#include "Servo.h"

Servo arm;
Servo shoulder;
Servo head;
Servo body;
int armAngle = 90;
int shoulderAngle = 90;

int ledPin = 13;

void setup() {
  Serial.begin(115200);
  pinMode(ledPin, OUTPUT);
  
  arm.attach(11);
  shoulder.attach(10);
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
    } else if(command == '3'){
     //do something 
    } else if(command == '4'){
    //do something
    } else if(command == '5'){
    //do something 
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
    }
  }
}

