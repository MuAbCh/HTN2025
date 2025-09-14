import { SerialPort } from "serialport";
import { ReadlineParser } from "serialport";

const port = new SerialPort({ path: "/dev/tty.usbserial-A5069RR4", baudRate: 9600 });
const parser = port.pipe(new ReadlineParser({ delimiter: "\n" }));

const data = {
	pressure1: [] as number[], // 0 to 100; 0 = stationary, 20-30 = normal press force, >30 = heavy press force
	pressure2: [] as number[], // 0 to 100; 0 = stationary, 20-30 = normal press force, >30 = heavy press force
	tilt: [] as number[], // 0 to 100; 0 = finger vertical, 100 = finger horizontal
	accx: [] as number[], // accelerometer x; calculate delta; +/- 10 = slight movement, +/- >10 = sudden movement
	accy: [] as number[], // accelerometer y; calculate delta; +/- 10 = slight movement, +/- >10 = sudden movement
	baseline: { pressure1: 0, pressure2: 0, tilt: 0, accx: 0, accy: 0 },
};

parser.on("data", onData);

let start = Date.now();

const re = /(X|Y|Tilt|Pressure1|Pressure2):\s*(\d+)/;
async function onData(line: string) {
	const match = line.trim().match(re);
	if (match) {
		const [_, type, value] = match;
		switch (type) {
			case "X":
				data.accx.push(parseFloat(value));
				break;
			case "Y":
				data.accy.push(parseFloat(value));
				break;
			case "Tilt":
				data.tilt.push(parseFloat(value));
				break;
			case "Pressure1":
				data.pressure1.push(parseFloat(value));
				break;
			case "Pressure2":
				data.pressure2.push(parseFloat(value));
				break;
		}
		console.log(data);
	}
}

setTimeout(async () => {
	const count = Math.floor((Date.now() - start) / 1000);
	parser.off("data", onData);
	console.log(
		await fetch("https://kvucic.app.n8n.cloud/webhook/c18e2903-e30b-41ab-a5cc-d1bcbbc3d261", {
			method: "POST",
			body: JSON.stringify({ ...data, count }),
		}).then((res) => res.json()),
	);
}, 10_000);
