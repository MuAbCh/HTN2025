import serial
import time
import json
import re

# === CONFIG ===
PORT = "/dev/tty.usbserial-A5069RR4"   # Change to COM3 on Windows, or /dev/tty.usbserial-* on Mac
BAUD = 9600
INTERVAL = 5  # seconds

# Storage
data = {
    "pressure": [],
    "tilt": [],
    "accelerometer": [],
    "baseline": {
        "accelerometer": 0,
        "tilt": 0,
        "pressure": 0
    }
}

def parse_line(line: str):
    """
    Parses a line like 'Y: 406' or 'Tilt: 414' and updates data.
    """
    line = line.strip()
    match = re.match(r"(Y|Tilt|Pressure):\s*(\d+)", line)
    if match:
        sensor, value = match.groups()
        value = int(value)

        if sensor == "Y":  # accelerometer
            data["accelerometer"].append(value)
        elif sensor == "Tilt":
            data["tilt"].append(value)
        elif sensor == "Pressure":
            data["pressure"].append(value)

def main():
    ser = serial.Serial(PORT, BAUD, timeout=1)
    last_dump = time.time()

    while True:
        line = ser.readline().decode(errors="ignore")
        if line:
            parse_line(line)

        # Every INTERVAL seconds, dump JSON
        if time.time() - last_dump >= INTERVAL:
            payload = [data]  # wrap in a list as per your schema
            print(json.dumps(payload, indent=2))
            last_dump = time.time()

        print(data)  # For debugging

if __name__ == "__main__":
    main()
