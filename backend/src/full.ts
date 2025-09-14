import { createServer } from "http";
import { ReadlineParser, SerialPort } from "serialport";
import { Server, type Socket } from "socket.io";

const TICK_MS = 1000; // feature update cadence
const WINDOW_SECS = 10; // rolling window for % metrics
const BREAK_SECONDS = 20; // microbreak length
const EMA_ALPHA = 0.3; // smoothing for risk score

const PRESS_ZERO = 5; // ~stationary
const PRESS_LIGHT_MIN = 10;
const PRESS_HEAVY_MIN = 150;
const ACC_SLIGHT = 10; // axis delta
const ACC_REACH = 14; // magnitude spike
const ACC_STATIC = 5; // "static hold" threshold
const TILT_SIDEWAYS_RIGHT_MAX = 100; // sideways
const TILT_NEUTRAL_MIN = 650; // not rotated

// risk weights
const WEIGHTS = {
	heavy_press_pct: 0.55,
	extreme_tilt_pct: 0.2, // % time hand is sideways
	static_hold_norm: 0.15,
	burst_norm: 0.20,
	microbreak_norm: 0.15,
};

const port = new SerialPort({ path: "/dev/tty.usbserial-A5069RR4", baudRate: 9600 });
const parser = port.pipe(new ReadlineParser({ delimiter: "\n" }));
let socket: Socket | undefined;

type Sample = { t: number; v: number };

const state = {
	latest: {
		pressure1: 0,
		pressure2: 0,
		tilt: 700, // not rotated
		accX: 0,
		accY: 0,
		accDx: 0,
		accDy: 0,
		accMag: 0,
		t: 0,
	},
	streams: { press: [] as Sample[], tilt: [] as Sample[], accMag: [] as Sample[] },
	ring: {
		heavyPress: Array(WINDOW_SECS).fill(false) as boolean[],
		extremeTilt: Array(WINDOW_SECS).fill(false) as boolean[],
		bursts: Array(WINDOW_SECS).fill(0) as number[],
		idx: 0,
	},
	staticHoldStreakSec: 0,
	breakStreakSec: 0,
	lastRealBreakAt: Date.now(),
	riskEMA: 0,
	baseline: { pressLight: 25, have: false },
	calib: { pressSum: 0, pressN: 0, startedAt: Date.now() },
};

function prune() {
	const cutoff = Date.now() - WINDOW_SECS * 1000;
	for (const key of ["press", "tilt", "accMag"] as const) {
		const arr = state.streams[key];
		while (arr.length && arr[0].t < cutoff) arr.shift();
	}
}
function pushStream(key: "press" | "tilt" | "accMag", v: number) {
	state.streams[key].push({ t: Date.now(), v });
}
function currentCombinedPress(): number {
	return Math.max(state.latest.pressure1, state.latest.pressure2);
}
function updateAccMag(dxAbs: number, dyAbs: number) {
	const mag = Math.sqrt(dxAbs * dxAbs + dyAbs * dyAbs);
	state.latest.accMag = mag;
	pushStream("accMag", mag);
}
function clamp01(x: number) {
	return Math.max(0, Math.min(1, x));
}
function ema(prev: number, x: number, alpha = EMA_ALPHA) {
	return prev === 0 ? x : alpha * x + (1 - alpha) * prev;
}

function isSidewaysRight(t: number) {
	return t < TILT_SIDEWAYS_RIGHT_MAX;
}
function isTiltNeutral(t: number) {
	return t >= TILT_NEUTRAL_MIN;
}

const re = /(X|Y|Tilt|Pressure1|Pressure2):\s*(\d+)/;
let lastX = 0, lastY = 0;

parser.on("data", onData);

function onData(line: string) {
	const m = line.trim().match(re);
	if (!m) return;
	const [, type, raw] = m;
	const val = parseFloat(raw);
	state.latest.t = Date.now();

	switch (type) {
		case "X": {
			state.latest.accX = val;
			const dx = val - lastX;
			lastX = val;
			state.latest.accDx = dx;
			updateAccMag(Math.abs(dx), Math.abs(state.latest.accDy));
			break;
		}
		case "Y": {
			state.latest.accY = val;
			const dy = val - lastY;
			lastY = val;
			state.latest.accDy = dy;
			updateAccMag(Math.abs(state.latest.accDx), Math.abs(dy));
			break;
		}
		case "Tilt": {
			state.latest.tilt = val;
			pushStream("tilt", val);
			break;
		}
		case "Pressure1":
			state.latest.pressure1 = val;
			pushStream("press", currentCombinedPress());
			break;
		case "Pressure2":
			state.latest.pressure2 = val;
			pushStream("press", currentCombinedPress());
			break;
	}
}

function tick() {
	prune();

	const pressNow = currentCombinedPress();
	const tiltNow = state.latest.tilt;
	const accNow = state.latest.accMag;

	const i = state.ring.idx;
	state.ring.heavyPress[i] = pressNow >= PRESS_HEAVY_MIN;
	state.ring.extremeTilt[i] = isSidewaysRight(tiltNow);
	state.ring.bursts[i] = accNow > ACC_REACH ? 1 : 0;
	state.ring.idx = (i + 1) % WINDOW_SECS;

	const heavy_press_pct = sumBool(state.ring.heavyPress) / WINDOW_SECS;
	const extreme_tilt_pct = sumBool(state.ring.extremeTilt) / WINDOW_SECS;
	const burst_count = sumNum(state.ring.bursts);
	const burst_norm = clamp01(burst_count / 6);

	// static hold
	if (pressNow >= PRESS_LIGHT_MIN && accNow < ACC_STATIC) {
		state.staticHoldStreakSec += 1;
	} else {
		state.staticHoldStreakSec = 0;
	}
	const static_hold_norm = clamp01(state.staticHoldStreakSec / 60);

	// microbreaks
	if (pressNow < PRESS_ZERO && accNow < ACC_STATIC) {
		state.breakStreakSec += 1;
		if (state.breakStreakSec === BREAK_SECONDS) state.lastRealBreakAt = Date.now();
	} else {
		state.breakStreakSec = 0;
	}
	const minutesSinceBreak = (Date.now() - state.lastRealBreakAt) / 60000;
	const microbreak_norm = clamp01(minutesSinceBreak / 10);

	if (!state.baseline.have && (Date.now() - state.calib.startedAt) < 60000) {
		if (pressNow >= PRESS_LIGHT_MIN && pressNow <= PRESS_HEAVY_MIN && accNow <= ACC_SLIGHT) {
			state.calib.pressSum += pressNow;
			state.calib.pressN += 1;
		}
	} else if (!state.baseline.have) {
		if (state.calib.pressN > 5) {
			state.baseline.pressLight = state.calib.pressSum / state.calib.pressN;
		}
		state.baseline.have = true;
		logOnce(`Baseline set → press≈${state.baseline.pressLight.toFixed(1)}`);
	}

	// risk score (0–100)
	const risk01 = WEIGHTS.heavy_press_pct * heavy_press_pct
		+ WEIGHTS.extreme_tilt_pct * extreme_tilt_pct
		+ WEIGHTS.static_hold_norm * static_hold_norm
		+ WEIGHTS.burst_norm * burst_norm
		+ WEIGHTS.microbreak_norm * microbreak_norm;

	state.riskEMA = ema(state.riskEMA, risk01);
	const riskScore = Math.round(state.riskEMA * 100);

	const warnings: string[] = [];
	if (heavy_press_pct > 0.25) warnings.push("pressing too heavy");
	if (extreme_tilt_pct > 0.30 && pressNow >= PRESS_LIGHT_MIN) warnings.push("extreme wrist tilt");
	if (state.staticHoldStreakSec >= 45) {
		warnings.push("high pressure held for long period without movement");
	}
	if (minutesSinceBreak >= 10) warnings.push("long time since break");

	console.clear();
	const tiltLabel = isSidewaysRight(tiltNow)
		? "sideways-right"
		: (isTiltNeutral(tiltNow) ? "neutral" : "unknown");
	console.log(
		`[Risk ${riskScore}]  press:${pressNow.toFixed(0)}  tilt:${
			tiltNow.toFixed(0)
		}(${tiltLabel})  acc:${accNow.toFixed(1)}`,
	);
	console.log(
		`heavy:${pct(heavy_press_pct)}  sideways:${
			pct(extreme_tilt_pct)
		}  static:${state.staticHoldStreakSec}s  bursts:${burst_count}  sinceBreak:${
			minutesSinceBreak.toFixed(1)
		}m`,
	);
	if (warnings.length) console.log("Warnings:", "• " + warnings.join("  • "));

	const data = {
		risk: riskScore,
		pressure: pressNow,
		pressureLeftNorm: clamp01(state.latest.pressure2 / 18),
		pressureRightNorm: clamp01(state.latest.pressure1 / 70),
		tilt: tiltNow,
		heavyPressNorm: heavy_press_pct,
		staticHoldNorm: static_hold_norm,
		burstsNorm: burst_norm * 1.2,
		extremeTiltNorm: extreme_tilt_pct,
		staticHoldStreakSec: state.staticHoldStreakSec,
		minutesSinceBreak,
	};

	socket?.emit("update", data);
}

function sumBool(a: boolean[]) {
	return a.reduce((s, x) => s + (x ? 1 : 0), 0);
}
function sumNum(a: number[]) {
	return a.reduce((s, x) => s + x, 0);
}
function pct(x: number) {
	return Math.round(x * 100) + "%";
}

let _logged = false;
function logOnce(msg: string) {
	if (_logged) return;
	_logged = true;
	console.log(msg);
}

setInterval(tick, TICK_MS);

const server = createServer();
const io = new Server(server, { cors: { origin: "*" } });
server.listen(4000);

io.on("connection", (s) => {
	socket = s;
});
