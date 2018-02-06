//Älybussisovellus
// Code for Arduino Uno
void setup() {
  pinMode(2,INPUT);                       // PIN2 is set for input
  pinMode(3,OUTPUT);                      // PIN3 is set for output
  Serial.begin(9600);                     // serial data rate is set for 9600bps(bits per second)
}

void loop() {                             // execute the loop forever
  if(digitalRead(2)==HIGH) {              // if button attached to the UNO is pressed
     while(digitalRead(2)==HIGH){
     }
     Serial.print(1);
     delay(200);
  } else if(digitalRead(3)==HIGH) {
     while(digitalRead(3)==HIGH){
     }
     Serial.print(2);
     delay(200);
  } else if(digitalRead(4)==HIGH) {
     while(digitalRead(4)==HIGH){
     }
     Serial.print(3);
     delay(200);
  } else if(digitalRead(6)==HIGH) {
     while(digitalRead(6)==HIGH){
     }
     Serial.print(4);
     delay(200);
  } else if(digitalRead(5)==HIGH) {
     while(digitalRead(5)==HIGH){
     }
     Serial.print(5);
     delay(200);
  }

}
