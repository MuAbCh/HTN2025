# Hardware Assembly Guide

## Components Required

### LilyPad Arduino Components
- 1x LilyPad Arduino USB (or LilyPad Arduino Simple)
- 1x Flex Sensor (4.5" or 2.2")
- 1x Tilt Sensor (SW-200D or similar)
- 1x LilyPad Accelerometer (ADXL335 or similar)
- 1x Hall Effect Sensor (A1324LUA-T or similar)
- 1x Motion Sensor (LilyPad PIR sensor or similar)
- 1x LilyPad Buzzer
- 1x LilyPad LED
- Conductive thread
- 10kΩ resistor (for flex sensor)

### Additional Materials
- Fabric or wearable base (glove, wristband)
- Needle for sewing conductive thread
- Small magnets (for hall effect sensor testing)

## Circuit Connections

### LilyPad Arduino Pin Assignments
```
Pin A0  - Flex Sensor (with 10kΩ pull-down resistor)
Pin A1  - Accelerometer X-axis
Pin A2  - Accelerometer Y-axis  
Pin A3  - Accelerometer Z-axis
Pin A4  - Hall Effect Sensor
Pin 2   - Tilt Sensor
Pin 3   - Motion Sensor (PIR)
Pin 4   - Buzzer
Pin 5   - Status LED
3.3V    - Power rail for sensors
GND     - Ground rail for sensors
```

### Detailed Wiring

#### Flex Sensor
```
Flex Sensor Pin 1 → Arduino A0
Flex Sensor Pin 2 → Arduino 3.3V
Arduino A0 → 10kΩ Resistor → Arduino GND
```

#### Tilt Sensor
```
Tilt Sensor Pin 1 → Arduino Pin 2
Tilt Sensor Pin 2 → Arduino GND
Arduino Pin 2 → Internal Pull-up (enabled in code)
```

#### Accelerometer (ADXL335)
```
ADXL335 VCC → Arduino 3.3V
ADXL335 GND → Arduino GND
ADXL335 X → Arduino A1
ADXL335 Y → Arduino A2
ADXL335 Z → Arduino A3
```

#### Hall Effect Sensor
```
Hall Sensor Pin 1 (VCC) → Arduino 3.3V
Hall Sensor Pin 2 (OUT) → Arduino A4
Hall Sensor Pin 3 (GND) → Arduino GND
```

#### Motion Sensor (PIR)
```
PIR VCC → Arduino 3.3V
PIR OUT → Arduino Pin 3
PIR GND → Arduino GND
```

#### Buzzer & LED
```
Buzzer + → Arduino Pin 4
Buzzer - → Arduino GND
LED + → Arduino Pin 5
LED - → Arduino GND (through current limiting resistor if needed)
```

## Assembly Instructions

### Step 1: Prepare the Base
1. Choose a comfortable glove or wrist-mounted base
2. Plan sensor placement:
   - Flex sensor: Along finger (index or middle)
   - Accelerometer: On back of hand
   - Tilt sensor: On wrist
   - Hall sensor: On fingertip or palm
   - Motion sensor: On hand/wrist
   - Buzzer: On wrist for tactile feedback

### Step 2: Sew Conductive Threads
1. Start with power (3.3V) and ground connections
2. Use thick, continuous conductive thread paths
3. Avoid crossing threads (use insulation if necessary)
4. Test continuity with multimeter as you go

### Step 3: Attach Sensors
1. Securely sew each sensor to the fabric base
2. Ensure good electrical contact with conductive thread
3. Test each sensor connection before proceeding

### Step 4: Mount Arduino
1. Attach LilyPad Arduino to a secure location (wrist/palm)
2. Connect all power and signal lines
3. Ensure USB port is accessible for programming

### Step 5: Testing
1. Upload the firmware
2. Run calibration routine
3. Test each sensor individually
4. Verify alert system functionality

## Calibration Process

### Initial Setup
1. Connect to computer via USB
2. Open Serial Monitor (9600 baud)
3. Send "CALIBRATE" command
4. Follow on-screen instructions

### Flex Sensor Calibration
1. Move finger through full range of motion
2. Ensure sensor detects minimum (straight) and maximum (bent) positions
3. Repeat if range seems limited

### Accelerometer Calibration
1. Keep device steady during calibration
2. Ensure all three axes are properly centered
3. Test by moving device in different orientations

## Troubleshooting

### No Serial Output
- Check USB connection
- Verify baud rate (9600)
- Check power connections

### Incorrect Sensor Readings
- Verify wiring connections
- Check for loose conductive threads
- Re-run calibration routine
- Check sensor power supply

### False Alerts
- Adjust STRAIN_THRESHOLD in firmware
- Re-calibrate sensors
- Check for electrical interference

### No Buzzer/LED Response
- Verify buzzer/LED connections
- Check if components are functional
- Test with multimeter

## Maintenance

### Regular Checks
- Inspect conductive thread integrity
- Test sensor responsiveness
- Clean sensors if needed
- Check battery levels (if using battery power)

### Recalibration
- Recommended weekly or after heavy use
- Required after any hardware modifications
- Use "CALIBRATE" command via Serial

## Safety Notes

- Ensure all connections are secure before wearing
- Avoid water exposure (unless using waterproof components)
- Remove device if any irritation occurs
- Check for proper grounding to prevent static buildup