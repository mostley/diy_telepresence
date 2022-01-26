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

Servo panServo;
Servo tiltServo;

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
      panServo.write(180);
    } else if (byte == 'l') {
      Serial.write("\r\nTurning Pan Servo left.");
      panServo.write(0);
    } else if (byte == 'u') {
      Serial.write("\r\nTurning Tilt Servo up.");
      tiltServo.write(180);
    } else if (byte == 'd') {
      Serial.write("\r\nTurning Tilt Servo down.");
      tiltServo.write(0);
    }

    Serial.write("\r\n> ");
    Serial.flush();
  }
}
