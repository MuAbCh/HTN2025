/*
 * Wearable Finger Strain Detector - LilyPad Arduino
 * 
 * This firmware reads multiple sensors to detect finger strain and overuse:
 * - Flex sensor: Measures finger bend/flex
 * - Tilt sensor: Detects hand orientation
 * - Accelerometer: Tracks motion and activity
 * - Hall effect sensor: Detects magnetic field changes
 * - Motion sensor: General movement detection
 * - Buzzer: Provides alerts for overuse
 * 
 * Data is normalized and sent via Serial as JSON/CSV format
 */

#include <ArduinoJson.h>

// Pin definitions for LilyPad Arduino
const int FLEX_SENSOR_PIN = A0;      // Flex sensor on analog pin
const int TILT_SENSOR_PIN = 2;       // Tilt sensor digital pin
const int ACCEL_X_PIN = A1;          // Accelerometer X-axis
const int ACCEL_Y_PIN = A2;          // Accelerometer Y-axis
const int ACCEL_Z_PIN = A3;          // Accelerometer Z-axis
const int HALL_SENSOR_PIN = A4;      // Hall effect sensor
const int MOTION_SENSOR_PIN = 3;     // Motion sensor (PIR)
const int BUZZER_PIN = 4;            // Buzzer for alerts
const int LED_PIN = 5;               // Status LED

// Sensor calibration values
int flexMin = 1023, flexMax = 0;     // Flex sensor range
int accelXCenter = 512, accelYCenter = 512, accelZCenter = 512;

// Strain detection parameters
const int STRAIN_THRESHOLD = 80;     // Percentage threshold for strain alert
const long ALERT_INTERVAL = 5000;   // 5 seconds between alerts
const long OVERUSE_TIME = 30000;    // 30 seconds of continuous strain = overuse

// Timing variables
unsigned long lastReadTime = 0;
unsigned long lastAlertTime = 0;
unsigned long strainStartTime = 0;
const long READ_INTERVAL = 100;     // Read sensors every 100ms

// Data output format
bool outputJSON = true;              // true for JSON, false for CSV

// Strain tracking
int strainLevel = 0;
bool inStrainState = false;
bool overuseDetected = false;

void setup() {
  Serial.begin(9600);
  
  // Initialize pins
  pinMode(TILT_SENSOR_PIN, INPUT);
  pinMode(MOTION_SENSOR_PIN, INPUT);
  pinMode(BUZZER_PIN, OUTPUT);
  pinMode(LED_PIN, OUTPUT);
  
  // Startup indication
  digitalWrite(LED_PIN, HIGH);
  delay(1000);
  digitalWrite(LED_PIN, LOW);
  
  // Calibration routine
  calibrateSensors();
  
  Serial.println("Finger Strain Detector Initialized");
  Serial.println("Format: JSON (send 'CSV' to switch to CSV format)");
}

void loop() {
  unsigned long currentTime = millis();
  
  // Check for serial commands
  checkSerialCommands();
  
  // Read sensors at specified interval
  if (currentTime - lastReadTime >= READ_INTERVAL) {
    lastReadTime = currentTime;
    
    // Read all sensors
    SensorData data = readSensors();
    
    // Calculate strain level
    strainLevel = calculateStrainLevel(data);
    
    // Check for strain conditions
    checkStrainConditions(currentTime);
    
    // Output data
    outputSensorData(data);
  }
}

struct SensorData {
  int flexValue;          // Normalized flex sensor value (0-100)
  bool tiltState;         // Tilt sensor state
  int accelX, accelY, accelZ; // Accelerometer values (-100 to 100)
  int hallValue;          // Hall effect sensor value
  bool motionDetected;    // Motion sensor state
  int strainPercentage;   // Calculated strain level (0-100)
  bool alertActive;       // Current alert status
  unsigned long timestamp; // Current timestamp
};

SensorData readSensors() {
  SensorData data;
  
  // Read flex sensor and normalize
  int flexRaw = analogRead(FLEX_SENSOR_PIN);
  data.flexValue = map(constrain(flexRaw, flexMin, flexMax), flexMin, flexMax, 0, 100);
  
  // Read tilt sensor
  data.tiltState = digitalRead(TILT_SENSOR_PIN);
  
  // Read accelerometer and normalize
  int accelXRaw = analogRead(ACCEL_X_PIN);
  int accelYRaw = analogRead(ACCEL_Y_PIN);
  int accelZRaw = analogRead(ACCEL_Z_PIN);
  
  data.accelX = map(accelXRaw - accelXCenter, -512, 512, -100, 100);
  data.accelY = map(accelYRaw - accelYCenter, -512, 512, -100, 100);
  data.accelZ = map(accelZRaw - accelZCenter, -512, 512, -100, 100);
  
  // Read hall effect sensor
  data.hallValue = analogRead(HALL_SENSOR_PIN);
  
  // Read motion sensor
  data.motionDetected = digitalRead(MOTION_SENSOR_PIN);
  
  // Set calculated values
  data.strainPercentage = strainLevel;
  data.alertActive = overuseDetected;
  data.timestamp = millis();
  
  return data;
}

int calculateStrainLevel(SensorData data) {
  int strain = 0;
  
  // Factor in flex sensor (main indicator)
  strain += (data.flexValue > 70) ? 40 : (data.flexValue * 40 / 70);
  
  // Factor in accelerometer movement (repetitive motion)
  int totalAccel = abs(data.accelX) + abs(data.accelY) + abs(data.accelZ);
  strain += (totalAccel > 150) ? 30 : (totalAccel * 30 / 150);
  
  // Factor in tilt (awkward positioning)
  if (data.tiltState) strain += 20;
  
  // Factor in continuous motion
  if (data.motionDetected) strain += 10;
  
  return constrain(strain, 0, 100);
}

void checkStrainConditions(unsigned long currentTime) {
  // Check if strain threshold is exceeded
  if (strainLevel >= STRAIN_THRESHOLD) {
    if (!inStrainState) {
      inStrainState = true;
      strainStartTime = currentTime;
    } else {
      // Check for overuse condition
      if ((currentTime - strainStartTime) >= OVERUSE_TIME) {
        if (!overuseDetected) {
          overuseDetected = true;
          triggerAlert();
        }
      }
    }
  } else {
    inStrainState = false;
    overuseDetected = false;
  }
  
  // Periodic alerts during overuse
  if (overuseDetected && (currentTime - lastAlertTime) >= ALERT_INTERVAL) {
    triggerAlert();
  }
}

void triggerAlert() {
  lastAlertTime = millis();
  
  // Sound buzzer pattern
  for (int i = 0; i < 3; i++) {
    digitalWrite(BUZZER_PIN, HIGH);
    digitalWrite(LED_PIN, HIGH);
    delay(200);
    digitalWrite(BUZZER_PIN, LOW);
    digitalWrite(LED_PIN, LOW);
    delay(100);
  }
}

void outputSensorData(SensorData data) {
  if (outputJSON) {
    outputJSON_Data(data);
  } else {
    outputCSV_Data(data);
  }
}

void outputJSON_Data(SensorData data) {
  StaticJsonDocument<300> doc;
  
  doc["timestamp"] = data.timestamp;
  doc["flex_sensor"] = data.flexValue;
  doc["tilt_state"] = data.tiltState;
  
  JsonObject accel = doc.createNestedObject("accelerometer");
  accel["x"] = data.accelX;
  accel["y"] = data.accelY;
  accel["z"] = data.accelZ;
  
  doc["hall_sensor"] = data.hallValue;
  doc["motion_detected"] = data.motionDetected;
  doc["strain_level"] = data.strainPercentage;
  doc["alert_active"] = data.alertActive;
  doc["overuse_detected"] = overuseDetected;
  
  serializeJson(doc, Serial);
  Serial.println();
}

void outputCSV_Data(SensorData data) {
  Serial.print(data.timestamp);
  Serial.print(",");
  Serial.print(data.flexValue);
  Serial.print(",");
  Serial.print(data.tiltState);
  Serial.print(",");
  Serial.print(data.accelX);
  Serial.print(",");
  Serial.print(data.accelY);
  Serial.print(",");
  Serial.print(data.accelZ);
  Serial.print(",");
  Serial.print(data.hallValue);
  Serial.print(",");
  Serial.print(data.motionDetected);
  Serial.print(",");
  Serial.print(data.strainPercentage);
  Serial.print(",");
  Serial.print(data.alertActive);
  Serial.print(",");
  Serial.println(overuseDetected);
}

void checkSerialCommands() {
  if (Serial.available()) {
    String command = Serial.readStringUntil('\n');
    command.trim();
    command.toUpperCase();
    
    if (command == "CSV") {
      outputJSON = false;
      Serial.println("Switched to CSV format");
      Serial.println("timestamp,flex,tilt,accel_x,accel_y,accel_z,hall,motion,strain,alert,overuse");
    } else if (command == "JSON") {
      outputJSON = true;
      Serial.println("Switched to JSON format");
    } else if (command == "CALIBRATE") {
      calibrateSensors();
    } else if (command == "STATUS") {
      printStatus();
    }
  }
}

void calibrateSensors() {
  Serial.println("Starting sensor calibration...");
  Serial.println("Please move the flex sensor through its full range for 5 seconds");
  
  digitalWrite(LED_PIN, HIGH);
  
  unsigned long calibrationStart = millis();
  flexMin = 1023;
  flexMax = 0;
  
  // Calibrate flex sensor range
  while (millis() - calibrationStart < 5000) {
    int reading = analogRead(FLEX_SENSOR_PIN);
    if (reading < flexMin) flexMin = reading;
    if (reading > flexMax) flexMax = reading;
    delay(10);
  }
  
  // Calibrate accelerometer center points
  Serial.println("Hold device steady for accelerometer calibration...");
  delay(2000);
  
  long accelXSum = 0, accelYSum = 0, accelZSum = 0;
  int samples = 100;
  
  for (int i = 0; i < samples; i++) {
    accelXSum += analogRead(ACCEL_X_PIN);
    accelYSum += analogRead(ACCEL_Y_PIN);
    accelZSum += analogRead(ACCEL_Z_PIN);
    delay(10);
  }
  
  accelXCenter = accelXSum / samples;
  accelYCenter = accelYSum / samples;
  accelZCenter = accelZSum / samples;
  
  digitalWrite(LED_PIN, LOW);
  
  Serial.println("Calibration complete!");
  Serial.print("Flex range: ");
  Serial.print(flexMin);
  Serial.print(" - ");
  Serial.println(flexMax);
  Serial.print("Accel center: X=");
  Serial.print(accelXCenter);
  Serial.print(", Y=");
  Serial.print(accelYCenter);
  Serial.print(", Z=");
  Serial.println(accelZCenter);
}

void printStatus() {
  Serial.println("=== Finger Strain Detector Status ===");
  Serial.print("Output format: ");
  Serial.println(outputJSON ? "JSON" : "CSV");
  Serial.print("Current strain level: ");
  Serial.print(strainLevel);
  Serial.println("%");
  Serial.print("In strain state: ");
  Serial.println(inStrainState ? "Yes" : "No");
  Serial.print("Overuse detected: ");
  Serial.println(overuseDetected ? "Yes" : "No");
  Serial.println("Commands: JSON, CSV, CALIBRATE, STATUS");
  Serial.println("=====================================");
}