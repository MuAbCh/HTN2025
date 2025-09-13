int x = A3;
int y = A2;
//int z = A3; // don't need z
int tilt = A0;
int pressure = A4;
int buzzer = A1;

void setup() {
  Serial.begin(9600);
  pinMode(x, INPUT);
  pinMode(y, INPUT);
  //pinMode(z, INPUT);
  pinMode(tilt, INPUT);
  pinMode(pressure, INPUT);
  pinMode(buzzer, OUTPUT);
}

void loop() {
  //Serial.println(String(analogRead(x)) + "," + String(analogRead(y)) + "," + String(analogRead(z)));
  Serial.println("Y: " + String(analogRead(y)));
  Serial.println("X: " + String(analogRead(x)));
  Serial.println("Tilt: " + String(analogRead(tilt)));
  Serial.println("Pressure: " + String(analogRead(pressure)));
  tone(buzzer, 85);
  tone(buzzer, 55);
  tone(buzzer, 15);
  noTone(buzzer);
  delay(200); // only 200 for, will lower/ remove later
}
