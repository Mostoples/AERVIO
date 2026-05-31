/*
 * =============================================================================
 *  AERVINEX Smartwatch Firmware
 *  Target  : ESP32-WROOM-32 / ESP32-S3 DevKit
 *  Author  : AERVINEX team
 *  License : MIT
 * -----------------------------------------------------------------------------
 *  Sensors:
 *    - MAX30102  (PPG / SpO2)       I2C  @ 0x57
 *    - BME280    (T / RH / P)       I2C  @ 0x76
 *    - SDS011    (PM2.5 / PM10)     UART2 @ 9600  (RX=16, TX=17)
 *    - GUVA-S12SD (UV index)        ADC1_CH6 (GPIO34)
 *    - Battery   (voltage divider)  ADC1_CH7 (GPIO35)
 *    - DS18B20   (optional skin T)  OneWire on GPIO4
 *
 *  Connectivity:
 *    - WiFi STA (fallback AP "AERVINEX-SETUP")
 *    - BLE peripheral (NimBLE-Arduino)
 *    - OTA via ArduinoOTA
 *
 *  Sampling schedule:
 *    - PPG/SpO2   : 25 Hz continuous, 4s window
 *    - PM2.5/PM10 : every 60 s
 *    - UV + amb   : every 30 s
 *    - Battery    : every 300 s
 *    - Telemetry  : every 5 s pushed via BLE NOTIFY + Serial JSON
 *
 *  BLE GATT layout (see firmware/README.md for full UUID table):
 *    - 0x180D  Heart Rate Service          (standard)
 *        0x2A37 Heart Rate Measurement     (NOTIFY)
 *        0x2A38 Body Sensor Location       (READ)
 *    - 0x181A  Environmental Sensing       (standard)
 *        0x2A6E Temperature                (NOTIFY)
 *        0x2A6F Humidity                   (NOTIFY)
 *        0x2A6D Pressure                   (NOTIFY)
 *    - 6e400001-b5a3-f393-e0a9-e50e24dcca9e  AERVINEX Custom Service
 *        6e400002-...  Telemetry JSON      (NOTIFY) - aggregate payload
 *        6e400003-...  Command sink        (WRITE)  - host -> device
 *        6e400004-...  Battery percent     (NOTIFY)
 * =============================================================================
 */

#include <Arduino.h>
#include <Wire.h>
#include <WiFi.h>
#include <ArduinoOTA.h>
#include <ArduinoJson.h>

// --- Sensor libraries ---
#include <MAX30105.h>                 // SparkFun MAX3010x library (works for MAX30102)
#include "spo2_algorithm.h"           // bundled with SparkFun MAX3010x
#include "heartRate.h"                // bundled with SparkFun MAX3010x
#include <Adafruit_Sensor.h>
#include <Adafruit_BME280.h>
#include <SdsDustSensor.h>            // "Nova Fitness Sds dust sensors library" by lewapek

// --- BLE stack (NimBLE is lighter than the default ESP32 BLE) ---
#include <NimBLEDevice.h>

#include "secrets.h"                  // WIFI_SSID, WIFI_PASS, OTA_PASSWORD, FIREBASE_HOST, etc.

// -----------------------------------------------------------------------------
// Pin map
// -----------------------------------------------------------------------------
#define I2C_SDA            21
#define I2C_SCL            22
#define SDS_RX_PIN         16    // ESP32 RX2 <- SDS011 TXD
#define SDS_TX_PIN         17    // ESP32 TX2 -> SDS011 RXD
#define UV_ADC_PIN         34    // ADC1_CH6
#define BATTERY_ADC_PIN    35    // ADC1_CH7
#define ONEWIRE_PIN         4    // DS18B20 (optional)

// Voltage divider (R1=100k high side, R2=100k low side) -> Vbat/2 to ADC
#define BATTERY_DIVIDER     2.0f
#define BATTERY_MAX_V       4.20f
#define BATTERY_MIN_V       3.30f

// -----------------------------------------------------------------------------
// Timing
// -----------------------------------------------------------------------------
static const uint32_t PPG_SAMPLE_HZ     = 25;
static const uint32_t PPG_WINDOW_MS     = 4000;
static const uint32_t PM_INTERVAL_MS    = 60000UL;
static const uint32_t UV_INTERVAL_MS    = 30000UL;
static const uint32_t BAT_INTERVAL_MS   = 300000UL;
static const uint32_t TELEMETRY_MS      = 5000UL;
static const uint32_t WIFI_TIMEOUT_MS   = 15000UL;

// -----------------------------------------------------------------------------
// BLE UUIDs
// -----------------------------------------------------------------------------
#define UUID_HR_SERVICE         "0000180D-0000-1000-8000-00805F9B34FB"
#define UUID_HR_MEASUREMENT     "00002A37-0000-1000-8000-00805F9B34FB"
#define UUID_HR_BODY_LOCATION   "00002A38-0000-1000-8000-00805F9B34FB"

#define UUID_ENV_SERVICE        "0000181A-0000-1000-8000-00805F9B34FB"
#define UUID_ENV_TEMP           "00002A6E-0000-1000-8000-00805F9B34FB"
#define UUID_ENV_HUMID          "00002A6F-0000-1000-8000-00805F9B34FB"
#define UUID_ENV_PRESSURE       "00002A6D-0000-1000-8000-00805F9B34FB"

#define UUID_AERV_SERVICE       "6E400001-B5A3-F393-E0A9-E50E24DCCA9E"
#define UUID_AERV_TELEMETRY     "6E400002-B5A3-F393-E0A9-E50E24DCCA9E"
#define UUID_AERV_COMMAND       "6E400003-B5A3-F393-E0A9-E50E24DCCA9E"
#define UUID_AERV_BATTERY       "6E400004-B5A3-F393-E0A9-E50E24DCCA9E"

// -----------------------------------------------------------------------------
// Globals
// -----------------------------------------------------------------------------
MAX30105        particleSensor;
Adafruit_BME280 bme;
SdsDustSensor   sds(Serial2);

NimBLEServer*         bleServer        = nullptr;
NimBLECharacteristic* chHrMeasurement  = nullptr;
NimBLECharacteristic* chEnvTemp        = nullptr;
NimBLECharacteristic* chEnvHumid       = nullptr;
NimBLECharacteristic* chEnvPressure    = nullptr;
NimBLECharacteristic* chAervTelemetry  = nullptr;
NimBLECharacteristic* chAervCommand    = nullptr;
NimBLECharacteristic* chAervBattery    = nullptr;

bool bleConnected = false;

// Latest sensor readings
struct Telemetry {
  float    hr           = NAN;     // bpm
  float    spo2         = NAN;     // %
  uint8_t  hrConfidence = 0;       // 0..100
  float    tempC        = NAN;
  float    humidity     = NAN;
  float    pressure     = NAN;     // hPa
  float    pm25         = NAN;
  float    pm10         = NAN;
  float    uvIndex      = NAN;
  float    batteryV     = NAN;
  uint8_t  batteryPct   = 0;
  uint32_t uptime       = 0;
} latest;

// MAX30102 SpO2 buffers (Maxim SpO2 ref design uses 100-sample window)
#define SPO2_BUFFER_LEN 100
uint32_t irBuffer[SPO2_BUFFER_LEN];
uint32_t redBuffer[SPO2_BUFFER_LEN];
uint16_t spo2BufIdx = 0;

// Beat detector state
static const uint8_t RATE_SIZE = 8;
uint8_t  rates[RATE_SIZE] = {0};
uint8_t  rateSpot = 0;
uint32_t lastBeat = 0;
float    beatsPerMinute = 0;

// Cadence timers
uint32_t tPmLast        = 0;
uint32_t tUvLast        = 0;
uint32_t tBatLast       = 0;
uint32_t tTelemetryLast = 0;
uint32_t tPpgLastSample = 0;

// -----------------------------------------------------------------------------
// BLE callbacks
// -----------------------------------------------------------------------------
class ServerCb : public NimBLEServerCallbacks {
  void onConnect(NimBLEServer*) override {
    bleConnected = true;
    Serial.println(F("[BLE] client connected"));
  }
  void onDisconnect(NimBLEServer* s) override {
    bleConnected = false;
    Serial.println(F("[BLE] client disconnected -> advertising"));
    NimBLEDevice::startAdvertising();
  }
};

class CommandCb : public NimBLECharacteristicCallbacks {
  void onWrite(NimBLECharacteristic* c) override {
    std::string v = c->getValue();
    Serial.printf("[BLE] cmd rx: %s\n", v.c_str());
    // Reserved for future commands: reboot, calibrate, set sampling rate, ...
    if (v == "reboot") {
      delay(200);
      ESP.restart();
    }
  }
};

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------
static float adcToVolts(int raw) {
  // ESP32 default attenuation 11dB -> ~0..3.3V, 12-bit
  return (raw / 4095.0f) * 3.30f;
}

static float readBatteryVoltage() {
  // Median of N samples
  const int N = 16;
  int v[N];
  for (int i = 0; i < N; ++i) {
    v[i] = analogRead(BATTERY_ADC_PIN);
    delayMicroseconds(200);
  }
  // simple sort
  for (int i = 1; i < N; ++i) {
    int k = v[i], j = i - 1;
    while (j >= 0 && v[j] > k) { v[j + 1] = v[j]; --j; }
    v[j + 1] = k;
  }
  float volts = adcToVolts(v[N / 2]) * BATTERY_DIVIDER;
  return volts;
}

static uint8_t batteryPercent(float volts) {
  if (isnan(volts)) return 0;
  float pct = (volts - BATTERY_MIN_V) / (BATTERY_MAX_V - BATTERY_MIN_V);
  if (pct < 0) pct = 0;
  if (pct > 1) pct = 1;
  return (uint8_t)(pct * 100.0f + 0.5f);
}

static float readUVIndex() {
  // GUVA-S12SD: Vout(mV) ~ 307 * UV_index after op-amp typical board.
  // We follow the common SparkFun/Adafruit mapping table.
  int raw = analogRead(UV_ADC_PIN);
  float mv = adcToVolts(raw) * 1000.0f;
  if (mv < 50)        return 0.0f;
  else if (mv < 227)  return 1.0f;
  else if (mv < 318)  return 2.0f;
  else if (mv < 408)  return 3.0f;
  else if (mv < 503)  return 4.0f;
  else if (mv < 606)  return 5.0f;
  else if (mv < 696)  return 6.0f;
  else if (mv < 795)  return 7.0f;
  else if (mv < 881)  return 8.0f;
  else if (mv < 976)  return 9.0f;
  else if (mv < 1079) return 10.0f;
  else                return 11.0f;
}

// -----------------------------------------------------------------------------
// Sensor init
// -----------------------------------------------------------------------------
static void initMax30102() {
  if (!particleSensor.begin(Wire, I2C_SPEED_FAST)) {
    Serial.println(F("[MAX30102] not found - check wiring (SDA=21 SCL=22 addr 0x57)"));
    return;
  }
  // Maxim reference config for SpO2 + HR
  byte ledBrightness = 0x1F;  // ~6.4 mA, gentle on skin
  byte sampleAverage = 4;
  byte ledMode       = 2;     // Red + IR
  int  sampleRate    = 100;   // Hz
  int  pulseWidth    = 411;   // us
  int  adcRange      = 4096;
  particleSensor.setup(ledBrightness, sampleAverage, ledMode,
                       sampleRate, pulseWidth, adcRange);
  particleSensor.enableDIETEMPRDY();
  Serial.println(F("[MAX30102] ready"));
}

static void initBme280() {
  if (!bme.begin(0x76, &Wire)) {
    if (!bme.begin(0x77, &Wire)) {
      Serial.println(F("[BME280] not found at 0x76 or 0x77"));
      return;
    }
  }
  bme.setSampling(Adafruit_BME280::MODE_NORMAL,
                  Adafruit_BME280::SAMPLING_X1,   // temp
                  Adafruit_BME280::SAMPLING_X1,   // pressure
                  Adafruit_BME280::SAMPLING_X1,   // humidity
                  Adafruit_BME280::FILTER_X4,
                  Adafruit_BME280::STANDBY_MS_1000);
  Serial.println(F("[BME280] ready"));
}

static void initSds011() {
  Serial2.begin(9600, SERIAL_8N1, SDS_RX_PIN, SDS_TX_PIN);
  sds.begin();
  Serial.println(sds.queryFirmwareVersion().toString());
  sds.setQueryReportingMode();      // we will poll
  sds.sleep();                      // saver: we wake briefly each cycle
  Serial.println(F("[SDS011] ready (sleep)"));
}

static void initBle() {
  NimBLEDevice::init("AERVINEX");
  NimBLEDevice::setPower(ESP_PWR_LVL_P7);
  bleServer = NimBLEDevice::createServer();
  bleServer->setCallbacks(new ServerCb());

  // Heart Rate Service
  {
    NimBLEService* svc = bleServer->createService(UUID_HR_SERVICE);
    chHrMeasurement = svc->createCharacteristic(
      UUID_HR_MEASUREMENT, NIMBLE_PROPERTY::NOTIFY | NIMBLE_PROPERTY::READ);
    NimBLECharacteristic* loc = svc->createCharacteristic(
      UUID_HR_BODY_LOCATION, NIMBLE_PROPERTY::READ);
    uint8_t wrist = 0x02; // 0x02 = wrist
    loc->setValue(&wrist, 1);
    svc->start();
  }
  // Environmental Sensing Service
  {
    NimBLEService* svc = bleServer->createService(UUID_ENV_SERVICE);
    chEnvTemp      = svc->createCharacteristic(UUID_ENV_TEMP,     NIMBLE_PROPERTY::NOTIFY | NIMBLE_PROPERTY::READ);
    chEnvHumid     = svc->createCharacteristic(UUID_ENV_HUMID,    NIMBLE_PROPERTY::NOTIFY | NIMBLE_PROPERTY::READ);
    chEnvPressure  = svc->createCharacteristic(UUID_ENV_PRESSURE, NIMBLE_PROPERTY::NOTIFY | NIMBLE_PROPERTY::READ);
    svc->start();
  }
  // AERVINEX custom service
  {
    NimBLEService* svc = bleServer->createService(UUID_AERV_SERVICE);
    chAervTelemetry = svc->createCharacteristic(UUID_AERV_TELEMETRY, NIMBLE_PROPERTY::NOTIFY | NIMBLE_PROPERTY::READ);
    chAervCommand   = svc->createCharacteristic(UUID_AERV_COMMAND,   NIMBLE_PROPERTY::WRITE);
    chAervBattery   = svc->createCharacteristic(UUID_AERV_BATTERY,   NIMBLE_PROPERTY::NOTIFY | NIMBLE_PROPERTY::READ);
    chAervCommand->setCallbacks(new CommandCb());
    svc->start();
  }

  NimBLEAdvertising* adv = NimBLEDevice::getAdvertising();
  adv->addServiceUUID(UUID_HR_SERVICE);
  adv->addServiceUUID(UUID_ENV_SERVICE);
  adv->addServiceUUID(UUID_AERV_SERVICE);
  adv->setName("AERVINEX");
  adv->setScanResponse(true);
  NimBLEDevice::startAdvertising();
  Serial.println(F("[BLE] advertising as AERVINEX"));
}

// -----------------------------------------------------------------------------
// WiFi + OTA
// -----------------------------------------------------------------------------
static void startSetupAP() {
  WiFi.mode(WIFI_AP);
  WiFi.softAP("AERVINEX-SETUP", "aervinex2025");
  Serial.print(F("[WiFi] AP fallback IP: "));
  Serial.println(WiFi.softAPIP());
}

static void initWifi() {
  WiFi.mode(WIFI_STA);
  WiFi.setSleep(true);
  WiFi.begin(WIFI_SSID, WIFI_PASS);
  Serial.printf("[WiFi] connecting to %s ", WIFI_SSID);
  uint32_t t0 = millis();
  while (WiFi.status() != WL_CONNECTED && (millis() - t0) < WIFI_TIMEOUT_MS) {
    delay(250);
    Serial.print('.');
  }
  Serial.println();
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println(F("[WiFi] failed -> setup AP"));
    startSetupAP();
    return;
  }
  Serial.print(F("[WiFi] IP: "));
  Serial.println(WiFi.localIP());
}

static void initOta() {
  ArduinoOTA.setHostname("aervinex");
#ifdef OTA_PASSWORD
  ArduinoOTA.setPassword(OTA_PASSWORD);
#endif
  ArduinoOTA
    .onStart([]() { Serial.println(F("[OTA] start")); })
    .onEnd([]()   { Serial.println(F("[OTA] end"));   })
    .onError([](ota_error_t e) { Serial.printf("[OTA] error %u\n", e); });
  ArduinoOTA.begin();
}

// -----------------------------------------------------------------------------
// Sensor sampling tasks
// -----------------------------------------------------------------------------
static void samplePpg() {
  // Continuous read; SparkFun lib pulls FIFO at hardware sample rate.
  if (!particleSensor.available()) {
    particleSensor.check();
    if (!particleSensor.available()) return;
  }
  uint32_t ir  = particleSensor.getIR();
  uint32_t red = particleSensor.getRed();
  particleSensor.nextSample();

  // --- HR via beat detector (heartRate.h) ---
  if (checkForBeat(ir)) {
    uint32_t now = millis();
    uint32_t delta = now - lastBeat;
    lastBeat = now;
    float bpm = 60000.0f / (float)delta;
    if (bpm > 30 && bpm < 220) {
      rates[rateSpot++] = (uint8_t)bpm;
      rateSpot %= RATE_SIZE;
      uint32_t sum = 0;
      for (uint8_t i = 0; i < RATE_SIZE; ++i) sum += rates[i];
      beatsPerMinute = sum / (float)RATE_SIZE;
      latest.hr = beatsPerMinute;
      latest.hrConfidence = (ir > 50000) ? 90 : 40;
    }
  }

  // --- SpO2 via 100-sample sliding buffer ---
  redBuffer[spo2BufIdx] = red;
  irBuffer[spo2BufIdx]  = ir;
  spo2BufIdx++;
  if (spo2BufIdx >= SPO2_BUFFER_LEN) {
    spo2BufIdx = 0;
    int32_t spo2Val = 0;
    int8_t  spo2Valid = 0;
    int32_t hrVal = 0;
    int8_t  hrValid = 0;
    maxim_heart_rate_and_oxygen_saturation(
      irBuffer, SPO2_BUFFER_LEN, redBuffer,
      &spo2Val, &spo2Valid, &hrVal, &hrValid);
    if (spo2Valid && spo2Val > 70 && spo2Val <= 100) {
      latest.spo2 = (float)spo2Val;
    }
  }
}

static void sampleEnvironment() {
  latest.tempC    = bme.readTemperature();
  latest.humidity = bme.readHumidity();
  latest.pressure = bme.readPressure() / 100.0f;  // Pa -> hPa
  latest.uvIndex  = readUVIndex();
}

static void samplePm() {
  // Wake SDS011, let fan stabilize ~10s, query, sleep again.
  sds.wakeup();
  delay(10000);
  PmResult pm = sds.queryPm();
  if (pm.isOk()) {
    latest.pm25 = pm.pm25;
    latest.pm10 = pm.pm10;
  } else {
    Serial.print(F("[SDS011] query failed: "));
    Serial.println(pm.statusToString());
  }
  sds.sleep();
}

static void sampleBattery() {
  latest.batteryV   = readBatteryVoltage();
  latest.batteryPct = batteryPercent(latest.batteryV);
}

// -----------------------------------------------------------------------------
// Telemetry publishing
// -----------------------------------------------------------------------------
static void notifyBleStandard() {
  if (!bleConnected) return;

  // Heart Rate Measurement (flags 0x00 -> uint8 BPM)
  if (!isnan(latest.hr)) {
    uint8_t hrPayload[2] = {0x00, (uint8_t)constrain((int)latest.hr, 0, 255)};
    chHrMeasurement->setValue(hrPayload, sizeof(hrPayload));
    chHrMeasurement->notify();
  }
  // Env service (sint16 * 0.01 for temp, uint16 * 0.01 for humid, uint32 * 0.1 for pressure-Pa)
  if (!isnan(latest.tempC)) {
    int16_t t = (int16_t)(latest.tempC * 100.0f);
    chEnvTemp->setValue((uint8_t*)&t, sizeof(t));
    chEnvTemp->notify();
  }
  if (!isnan(latest.humidity)) {
    uint16_t h = (uint16_t)(latest.humidity * 100.0f);
    chEnvHumid->setValue((uint8_t*)&h, sizeof(h));
    chEnvHumid->notify();
  }
  if (!isnan(latest.pressure)) {
    uint32_t p = (uint32_t)(latest.pressure * 1000.0f); // hPa -> Pa*10
    chEnvPressure->setValue((uint8_t*)&p, sizeof(p));
    chEnvPressure->notify();
  }
}

static void publishTelemetry() {
  latest.uptime = millis() / 1000;

  StaticJsonDocument<512> doc;
  doc["uptime_s"]   = latest.uptime;
  doc["hr_bpm"]     = isnan(latest.hr)       ? (float)0 : latest.hr;
  doc["hr_conf"]    = latest.hrConfidence;
  doc["spo2_pct"]   = isnan(latest.spo2)     ? (float)0 : latest.spo2;
  doc["temp_c"]     = isnan(latest.tempC)    ? (float)0 : latest.tempC;
  doc["humid_pct"]  = isnan(latest.humidity) ? (float)0 : latest.humidity;
  doc["press_hpa"]  = isnan(latest.pressure) ? (float)0 : latest.pressure;
  doc["pm25_ugm3"]  = isnan(latest.pm25)     ? (float)0 : latest.pm25;
  doc["pm10_ugm3"]  = isnan(latest.pm10)     ? (float)0 : latest.pm10;
  doc["uv_index"]   = isnan(latest.uvIndex)  ? (float)0 : latest.uvIndex;
  doc["bat_v"]      = isnan(latest.batteryV) ? (float)0 : latest.batteryV;
  doc["bat_pct"]    = latest.batteryPct;

  char buf[512];
  size_t n = serializeJson(doc, buf, sizeof(buf));

  // Serial debug
  Serial.write((const uint8_t*)buf, n);
  Serial.println();

  // BLE custom telemetry
  if (bleConnected && chAervTelemetry) {
    chAervTelemetry->setValue((uint8_t*)buf, n);
    chAervTelemetry->notify();
  }
  if (bleConnected && chAervBattery) {
    uint8_t pct = latest.batteryPct;
    chAervBattery->setValue(&pct, 1);
    chAervBattery->notify();
  }
  notifyBleStandard();
}

// -----------------------------------------------------------------------------
// Power management - light sleep between cycles when battery low
// -----------------------------------------------------------------------------
static void maybeLightSleep() {
  // If battery >20% and BLE connected, keep CPU awake for responsive PPG.
  if (bleConnected) return;
  if (latest.batteryPct > 20) return;
  // Drop the radios for 2s to save power.
  esp_sleep_enable_timer_wakeup(2 * 1000 * 1000ULL);
  esp_light_sleep_start();
}

// =============================================================================
// Arduino entry points
// =============================================================================
void setup() {
  Serial.begin(115200);
  delay(200);
  Serial.println();
  Serial.println(F("============================================"));
  Serial.println(F(" AERVINEX firmware booting"));
  Serial.println(F("============================================"));

  analogReadResolution(12);
  analogSetAttenuation(ADC_11db);

  Wire.begin(I2C_SDA, I2C_SCL, 400000UL);

  initMax30102();
  initBme280();
  initSds011();
  initWifi();
  initOta();
  initBle();

  // prime battery + env so first telemetry payload is meaningful
  sampleBattery();
  sampleEnvironment();

  Serial.println(F("[boot] setup complete"));
}

void loop() {
  ArduinoOTA.handle();

  uint32_t now = millis();

  // PPG runs as fast as we can call check() — the lib paces itself.
  samplePpg();

  if (now - tUvLast >= UV_INTERVAL_MS) {
    tUvLast = now;
    sampleEnvironment();
  }
  if (now - tPmLast >= PM_INTERVAL_MS) {
    tPmLast = now;
    samplePm();
  }
  if (now - tBatLast >= BAT_INTERVAL_MS) {
    tBatLast = now;
    sampleBattery();
  }
  if (now - tTelemetryLast >= TELEMETRY_MS) {
    tTelemetryLast = now;
    publishTelemetry();
    maybeLightSleep();
  }
}
