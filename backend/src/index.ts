import { SerialPort } from "serialport";
import { ReadlineParser } from "serialport";

const port = new SerialPort({ path: "/dev/tty.usbserial-A5069RR4", baudRate: 9600 });
const parser = port.pipe(new ReadlineParser({ delimiter: "\n" }));

const data = {
	pressure: [] as number[],
	tilt: [] as number[],
	x: [] as number[],
	y: [] as number[],
	baseline: { pressure: 0, tilt: 0, x: 0, y: 0 },
};

parser.on("data", onData);

const re = /(X|Y|Tilt|Pressure):\s*(\d+)/;
async function onData(line: string) {
	console.log(typeof line)
	const match = line.match(re);
	if (match) {
		const [_, type, value] = match;
		switch (type) {
			case "X":
				data.x.push(parseFloat(value));
				break;
			case "Y":
				data.y.push(parseFloat(value));
				break;
			case "Tilt":
				data.tilt.push(parseFloat(value));
				break;
			case "Pressure":
				data.pressure.push(parseFloat(value));
				break;
		}
		console.log(data);
	}
}
