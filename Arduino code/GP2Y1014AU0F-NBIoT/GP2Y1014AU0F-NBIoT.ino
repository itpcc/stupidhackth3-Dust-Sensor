#include "IoTtweetNBIoT.h"
/////////////////////////////////////////////////////////////////////////////
// Sharp GP2Y1014AU0F Dust Sensor Demo
//
// Board Connection:
//   GP2Y1014    Arduino
//   V-LED       Between R1 and C1
//   LED-GND     C1 and GND
//   LED         Pin 7
//   S-GND       GND
//   Vo          A5
//   Vcc         5V
//
// Serial monitor setting:
//   9600 baud
/////////////////////////////////////////////////////////////////////////////
// Choose program options.
// #define PRINT_RAW_DATA
#define USE_AVG

// Arduino pin numbers.
const int sharpLEDPin = 7;   // Arduino digital pin 7 connect to sensor LED.
const int sharpVoPin = A5;   // Arduino analog pin 5 connect to sensor Vo.

// For averaging last N raw voltage readings.
#ifdef USE_AVG
#define N 100
static unsigned long VoRawTotal = 0;
static int VoRawCount = 0;
#endif // USE_AVG

// Set the typical output voltage in Volts when there is zero dust. 
static float Voc = 0.6;

// Use the typical sensitivity in units of V per 100ug/m3.
const float K = 0.5;

// Motor configuration
#define MOTOR_THRESHOLD 100.0
unsigned long lastDetect = 0;
#define MOTOR_TRIGGER 5
#define DELAY_MILLISEC 2000
#define DELAY_TURNOFF_MILLISEC 10000
char motorState = 0;

// IoTweet config
String userid = "007041";          /*IoTtweet account user ID (6 digits, included zero pre-fix)*/
String key = "b4el3zq4a6lq";                   /*IoTtweet registered device key in "MY IOT Garage"*/
String private_tweet = "AIS NB-IoT";              /*Your private tweet meassage to dashboard*/
String public_tweet = "Hello IoTtweet";           /*Your public tweet message to dashboard*/
IoTtweetNBIoT NBiotObj;
  
/////////////////////////////////////////////////////////////////////////////

// Helper functions to print a data value to the serial monitor.
void printValue(String text, unsigned int value, bool isLast = false) {
  Serial.print(text);
  Serial.print("=");
  Serial.print(value);
  if (!isLast) {
    Serial.print(", ");
  }
}
void printFValue(String text, float value, String units, bool isLast = false) {
  Serial.print(text);
  Serial.print("=");
  Serial.print(value);
  Serial.print(units);
  if (!isLast) {
    Serial.print(", ");
  }
}

/////////////////////////////////////////////////////////////////////////////

// Arduino setup function.
void setup() {
  pinMode(MOTOR_TRIGGER, OUTPUT);
  digitalWrite(MOTOR_TRIGGER, HIGH);
  unsigned long serialSetupTime;
  // Set LED pin for output.
  pinMode(sharpLEDPin, OUTPUT);
  pinMode(sharpVoPin, INPUT);
  
  // Start the hardware serial port for the serial monitor.
  Serial.begin(9600);
  
  // Wait two seconds for startup.
  serialSetupTime = millis();
  NBiotObj.init();
  Serial.print("NBIoT: RSSI = ");
  Serial.print(NBiotObj.readRSSI());
  while(millis() - serialSetupTime < 2000){ delay(2000 - (millis() - serialSetupTime)); }
  Serial.println("");
  Serial.println("GP2Y1014AU0F Demo");
  Serial.println("=================");
}



// Arduino main loop.
void loop() {
  unsigned long currentTime;
  // Turn on the dust sensor LED by setting digital pin LOW.
  digitalWrite(sharpLEDPin, LOW);

  // Wait 0.28ms before taking a reading of the output voltage as per spec.
  delayMicroseconds(280);

  // Record the output voltage. This operation takes around 100 microseconds.
  int VoRaw = analogRead(sharpVoPin);
  
  // Turn the dust sensor LED off by setting digital pin HIGH.
  digitalWrite(sharpLEDPin, HIGH);

  // Wait for remainder of the 10ms cycle = 10000 - 280 - 100 microseconds.
  delayMicroseconds(9620);
  
  // Print raw voltage value (number from 0 to 1023).
  #ifdef PRINT_RAW_DATA
  printValue("VoRaw", VoRaw, true);
  Serial.println("");
  #endif // PRINT_RAW_DATA
  
  // Use averaging if needed.
  float Vo = VoRaw;
  #ifdef USE_AVG
  VoRawTotal += VoRaw;
  VoRawCount++;
  if ( VoRawCount >= N ) {
    Vo = 1.0 * VoRawTotal / N;
    VoRawCount = 0;
    VoRawTotal = 0;
  } else {
    return;
  }
  #endif // USE_AVG

  // Compute the output voltage in Volts.
  Vo = Vo / 1024.0 * 5.0;
  printFValue("Vo", Vo*1000.0, "mV");

  // Convert to Dust Density in units of ug/m3.
  float dV = Vo - Voc;
  if ( dV < 0 ) {
    dV = 0;
    Voc = Vo;
  }
  float dustDensity = dV / K * 100.0;
  printFValue("DustDensity", dustDensity, "ug/m3", true);
  Serial.println("");

  switch(motorState){
    case 0: // Inactive, unmeasured
    case 1: // Inactive, high dust
      if(dustDensity <= MOTOR_THRESHOLD){ // If dust is lower than threshould
        motorState = 2;
        lastDetect = millis();
      }else{
        motorState = 1;
      }
    break;
    case 2: // Inactive, low dust preparing
      if(millis() - lastDetect > DELAY_MILLISEC){
        if(dustDensity <= MOTOR_THRESHOLD){
          motorState = 3; // Active, start
          lastDetect = millis();
        }else{
          motorState = 1;
        }
      }
    break;
    case 3: // Active, low dust
      if(dustDensity <= MOTOR_THRESHOLD){
        lastDetect = millis();
      }else{
        motorState = 4;
        lastDetect = millis();
      }
    break;
    case 4: // Active, high dust preparing
      if(millis() - lastDetect > DELAY_TURNOFF_MILLISEC){
        if(dustDensity <= MOTOR_THRESHOLD){
          motorState = 3; // Active, start
          lastDetect = millis();
        }else{
          motorState = 1;
        }
      }
    break;
    default:
      Serial.println("WTF Dude! Unexpected state");
    break;
  }

  switch(motorState){
    case 0:
    case 1:
    case 2:
      digitalWrite(MOTOR_TRIGGER, HIGH);
    break;
    
    case 3:
    case 4:
      digitalWrite(MOTOR_TRIGGER, LOW);
    break;
  }
  Serial.print(F("State = ")); Serial.println(motorState, DEC);

  NBiotObj.sendDashboard(
    userid,key,
    dustDensity, motorState * 1.0, // Just to make sure it's floating
    0.0, 0.0,
    private_tweet,public_tweet
  );
} // END PROGRAM


