#include <ThingSpeak.h>
#include <WiFi.h>
/* Use a photoresistor (or photocell) to turn on an LED in the dark
   More info and circuit schematic: http://www.ardumotive.com/how-to-use-a-photoresistor-en.html
   Dev: Michalis Vasilakis // Date: 8/6/2015 // www.ardumotive.com */

// Wifi Config
char ssid[] = "Hackathon";
char password[] = "";
int keyIndex = 0;

int status = WL_IDLE_STATUS;


// ThinkSpeak
unsigned long channel_id = 2454062;
char * read_api_key = "MA8G838PZV3LJZ3G";

WiFiClient client;  

//int ledPin = 0;

//Constants
const int pResistor = A2; // Photoresistor at Arduino analog pin A0
const int ledPin1=A9;       // Led pin at Arduino pin 9
const int ledPin2=A8; 
const int ledPin3=A7; 
const int ledPin4=A6; 

//Variables
int value;          // Store value from photoresistor (0-1023)
void setup(){
 Serial.begin(115200);
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
      delay(500);
      Serial.print(".");
  } 
  ThingSpeak.begin(client);
//  if (status == 200){
//   Serial.println("Maximum Movement:");
//  }
 
 pinMode(ledPin1, OUTPUT);  // Set lepPin - 9 pin as an output
 pinMode(ledPin2, OUTPUT);
 pinMode(ledPin3, OUTPUT);
 pinMode(ledPin4, OUTPUT);

 //pinMode(pResistor, INPUT);// Set pResistor - A0 pin as an input (optional)
 Serial.println("Serial Monitor Working!");
}

void loop(){
  float avMove = ThingSpeak.readFloatField(channel_id, 2, read_api_key);
  status = ThingSpeak.getLastReadStatus();
  Serial.print("move%  ");
  Serial.println(avMove);
  Serial.print("Working Connection  ");
  Serial.println(status == 200);
  value = analogRead(pResistor);
  Serial.print("Light  ");
  Serial.println(value);

  int stayOn = 2000;

  if(avMove > .02){
    if (value >= 1700){
      setLEDs(LOW,LOW,LOW,LOW);
      delay(stayOn);
    }
    else if(value >= 1200){
      setLEDs(HIGH,LOW,LOW,LOW);
      delay(stayOn);
    }
    else if(value >= 700){
      setLEDs(HIGH,HIGH,LOW,LOW);
      delay(stayOn);
    }
    else if(value >= 200){
      setLEDs(HIGH,HIGH,HIGH,LOW);
      delay(stayOn);
    }
    else{
      setLEDs(HIGH,HIGH,HIGH,HIGH);
      delay(stayOn);
    }
  }else{
      setLEDs(LOW,LOW,LOW,LOW);
  }
  avMove = 0;
  

  delay(10); //Small delay
}

bool setLEDs(int led1,int led2,int led3,int led4){
    digitalWrite(ledPin1, led1);
    digitalWrite(ledPin2, led2);
    digitalWrite(ledPin3, led3);
    digitalWrite(ledPin4, led4);
}