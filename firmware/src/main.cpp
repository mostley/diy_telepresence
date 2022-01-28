#include <Arduino.h>
#include <WebUSB.h>
#include <Servo.h>

/**
 * Creating an instance of WebUSBSerial will add an additional USB interface to
 * the device that is marked as vendor-specific (rather than USB CDC-ACM) and
 * is therefore accessible to the browser.
 *
 * The URL here provides a hint to the browser about what page the user should
 * navigate to to interact with the device.
 */
WebUSB WebUSBSerial(1 /* https:// */, "webusb.github.io/arduino/demos/rgb");

#define Serial WebUSBSerial
#define LED_PIN 13
#define PAN_SERVO_PIN 8
#define TILT_SERVO_PIN 9
#define MAX_PAN_ANGLE 180
#define MIN_PAN_ANGLE 0
#define MAX_TILT_ANGLE 140
#define MIN_TILT_ANGLE 30
#define PAN_ANGLE_STEP 10.0
#define TILT_ANGLE_STEP 10.0
#define LERP_FACTOR 1

Servo panServo;
Servo tiltServo;

float panAngle = 90;
float tiltAngle = 90;
float targetPanAngle = 90;
float targetTiltAngle = 90;

float lastMillis = 0;

void setup() {
  while (!Serial) {
    ;
  }

  Serial.begin(9600);
  Serial.write("Sketch begins.\r\n");
  Serial.flush();

  pinMode(LED_PIN, OUTPUT);

  panServo.attach(PAN_SERVO_PIN);
  tiltServo.attach(TILT_SERVO_PIN);
}

float clamp(float value) {
  if (value < 0.0) {
    return 0.0;
  } else if (value > 1.0) {
    return 1.0;
  } else {
    return value;
  }
}

float lerp(float v0, float v1, float t) {
  return (1 - t) * v0 + t * v1;
}

void loop() {
  if (Serial && Serial.available()) {
    Serial.write(".");

    int byte = Serial.read();
    Serial.write(byte);

    if (byte == '1') {
      Serial.write("\r\nTurning LED on.");
      digitalWrite(LED_PIN, HIGH);
    } else if (byte == '0') {
      Serial.write("\r\nTurning LED off.");
      digitalWrite(LED_PIN, LOW);
    } else if (byte == 'r') {
      Serial.write("\r\nTurning Pan Servo right.");
      targetPanAngle = targetPanAngle + PAN_ANGLE_STEP;
    } else if (byte == 'l') {
      Serial.write("\r\nTurning Pan Servo left.");
      targetPanAngle = targetPanAngle - PAN_ANGLE_STEP;
    } else if (byte == 'u') {
      Serial.write("\r\nTurning Tilt Servo up.");
      targetTiltAngle = targetTiltAngle - TILT_ANGLE_STEP;
    } else if (byte == 'd') {
      Serial.write("\r\nTurning Tilt Servo down.");
      targetTiltAngle = targetTiltAngle + TILT_ANGLE_STEP;
    }

    Serial.write("\r\n> ");
    Serial.flush();
  }

  if (targetPanAngle > MAX_PAN_ANGLE) {
    targetPanAngle = MAX_PAN_ANGLE;
  } else if (targetPanAngle < MIN_PAN_ANGLE) {
    targetPanAngle = MIN_PAN_ANGLE;
  }

  if (targetTiltAngle > MAX_TILT_ANGLE) {
    targetTiltAngle = MAX_TILT_ANGLE;
  } else if (targetTiltAngle < MIN_TILT_ANGLE) {
    targetTiltAngle = MIN_TILT_ANGLE;
  }

  unsigned long now = millis();
  float dt = (float)((now - lastMillis)/1000.0);

  float t = dt * LERP_FACTOR;
  t = clamp(t);

  panAngle = lerp(panAngle, targetPanAngle, t);
  tiltAngle = lerp(tiltAngle, targetTiltAngle, t);
  lastMillis = now;

  Serial.write("\r\ndt: ");
  Serial.print(dt);
  Serial.write("\r\nt: ");
  Serial.print(t);
  Serial.write("\r\nPan: ");
  Serial.print(panAngle);
  Serial.write("\r\nTilt: ");
  Serial.print(tiltAngle);

  /* if ((targetPanAngle - panAngle) > 0.5 || (targetTiltAngle - tiltAngle) > 0.5) { */
    panServo.write((int)panAngle);
    tiltServo.write((int)tiltAngle);
  /* } */
}
