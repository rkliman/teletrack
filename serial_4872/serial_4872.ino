#include "Servo.h"

Servo arm;
Servo shoulder;
Servo head;
Servo body;
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
}

void loop() {
  if(Serial.available() >0 ) {
    char command = Serial.read();
    Serial.println(command);
    if(command == '0'){
      //do something
    } else if(command == '1') {
    //do something
    } else if(command == '2') {
    //do something   
     if(bodyAngle + 10 < 180) {
          bodyAngle += 10;
          body.write(bodyAngle);
     } 
    } else if(command == '3'){
     //do something 
      if(bodyAngle - 10 > 0) {
        bodyAngle -= 10;
        body.write(bodyAngle);
      }
    } else if(command == '4'){
    //do something
      if(headAngle + 10 < 180) {
          headAngle += 10;
          head.write(headAngle);
       }
    } else if(command == '5'){
    //do something 
      if(headAngle - 10 > 0) {
        headAngle -= 10;
        head.write(headAngle);
      }
    } else if(command == '6') {
      if(armAngle + 10 < 180) {
        armAngle += 10;
        arm.write(armAngle);
      }
    } else if(command == '7') {
      if(armAngle - 10 > 0) {
        armAngle -= 10;
        arm.write(armAngle);
      }
    } else if(command == '8') {
    //do something
      if(shoulderAngle + 10 < 180) {
        shoulderAngle += 10;
        shoulder.write(shoulderAngle);
      }
    } else if(command == '9') {
    //do something
     if(shoulderAngle - 10 > 0) {
        shoulderAngle -= 10;
        shoulder.write(shoulderAngle);
      }
    } else if(command == 'l') {
      digitalWrite(laserPin, HIGH);
    } else if(command == 'k') {
      digitalWrite(laserPin, LOW);
    }
  }
}

