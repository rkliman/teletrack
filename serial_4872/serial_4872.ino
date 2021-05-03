#include "Servo.h"
https://code-with-me.jetbrains.com/oLF6nrRHd5Gll9IfNOfaOQ#p=WS&fp=9401EF8C241779EB7D5A68C5986E5842400F7979CDF4805DC564579A69684F1A
Servo arm;
Servo shoulder;
Servo head;
Servo body;
Servo track;
int trackSpeed = 0;
int armAngle = 90;
int shoulderAngle = 90;
int headAngle = 90;
int bodyAngle = 90;

int ledPin = 13;
int laserPin = 6;

void setup() {
  Serial.begin(115200);
  pinMode(ledPin, OUTPUT);
  pinMode(laserPin, OUTPUT);
  digitalWrite(laserPin, LOW);
  
  arm.attach(11);
  shoulder.attach(10);
  head.attach(5);
  body.attach(9);
  track.attach(7); //maybe?
}

void loop() {
    if(Serial.available() >0 ) {
        char command = Serial.read();
        Serial.println(command);
        switch(command) {
            case '0':  //track left
                track.write(100);
                delay(1);
                track.write(0);
                break;
            case '1':  //track right
                track.write(15);
                delay(1);
                track.write(0);
                break;
            case '2':  //body left
                if(bodyAngle + 10 < 180) {
                    bodyAngle += 10;
                    body.write(bodyAngle);
                }
                break;
            case '3':  //body right
                if(bodyAngle - 10 > 0) {
                    bodyAngle -= 10;
                    body.write(bodyAngle);
                }
                break;
            case '4':  //head up
                if(headAngle + 10 < 180) {
                    headAngle += 10;
                    head.write(headAngle);
                }
                break;
            case '5':  //head down
                if(headAngle - 10 > 0) {
                    headAngle -= 10;
                    head.write(headAngle);
                }
                break;
            case '6':  //arm up
                if(armAngle + 10 < 180) {
                    armAngle += 10;
                    arm.write(armAngle);
                }
                break;
            case '7':  //arm down
                if(armAngle - 10 > 0) {
                    armAngle -= 10;
                    arm.write(armAngle);
                }
                break;
            case '8':  //arm left
                if(shoulderAngle + 10 < 180) {
                    shoulderAngle += 10;
                    shoulder.write(shoulderAngle);
                }
                break;
            case '9':  //arm right
                if(shoulderAngle - 10 > 0) {
                    shoulderAngle -= 10;
                    shoulder.write(shoulderAngle);
                }
                break;
            case 'l':  //laser on
                digitalWrite(laserPin, HIGH);
                break;
            case 'k':  //laser off
                digitalWrite(laserPin, LOW);
                break;
            default:
                break;
        }
    }
}

