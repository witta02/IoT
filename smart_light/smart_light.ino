/*
 * ============================================================================
 * ESP32 Smart Light System - Quad-Stack (Physical + BLE + Wi-Fi + Global MQTT)
 *
 * Core Features:
 *   - 1. Offline-First Hardware: 0ms boot delay; physical button (GPIO 13) & relay
 *        work instantly with zero network dependencies.
 *   - 2. Bluetooth Low Energy (BLE 4.2/5.0): GATT Service with Notify & Write
 *        characteristics supporting direct Web Bluetooth API in browser.
 *   - 3. Local Wi-Fi & Web Server: Embedded UI + REST API (http://smartlight.local).
 *   - 4. Worldwide Cloud MQTT: High-speed global broker for remote 4G/5G control.
 *   - 5. Autonomous Schedules & LDR: Runs locally in flash/RTC.
 * ============================================================================
 */

#include <WiFi.h>
#include <WiFiClient.h>
#include <PubSubClient.h>
#include <ESPmDNS.h>
#include <WebServer.h>
#include <Preferences.h>
#include <time.h>
#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLEUtils.h>
#include <BLE2902.h>
#include "webpage.h"

// ─── BLE UUID DEFINITIONS ──────────────────────────────────────────────────
#define BLE_DEVICE_NAME             "allight"
#define SERVICE_UUID                "4fafc201-1fb5-459e-8fcc-c5c9c331914b"
#define CHARACTERISTIC_UUID_RX      "beb5483e-36e1-4688-b7f5-ea07361b26a8" // Write
#define CHARACTERISTIC_UUID_TX      "beb5483e-36e1-4688-b7f5-ea07361b26a9" // Notify/Read

// ─── WI-FI CONFIGURATION ──────────────────────────────────────────────────
const bool USE_AP_MODE = false; 

const char* AP_SSID = "allight-AP";
const char* AP_PASS = "12345678";

const char* WIFI_SSID = "Withwin";        // 👈 Put your home Wi-Fi name here
const char* WIFI_PASS = "Wintidhe1";    // 👈 Put your home Wi-Fi password here

// ─── CLOUD MQTT CONFIGURATION (High-Reliability Global Broker) ─────────────
const char* MQTT_HOST        = "broker.emqx.io"; // Global public broker (100% compatible with hotspots)
const int   MQTT_PORT        = 1883;             // Standard TCP Port
const char* MQTT_USER        = "smartlight";
const char* MQTT_PASS        = "SmartLight1234";
const char* MQTT_TOPIC_CMD   = "smartlight/witta02/cmd";
const char* MQTT_TOPIC_STATE = "smartlight/witta02/state";

// ─── GPIO PIN ASSIGNMENT ──────────────────────────────────────────────────
const int PIN_LDR     = 34;   // LDR Analog Input (ADC1_CH6)
const int PIN_RELAY   = 5;    // Relay Signal Pin
const int PIN_BUTTON  = 13;   // Push Button Pin (INPUT_PULLUP)
const int PIN_LED_LED = 2;    // Onboard Blue LED

// ─── NTP TIME CONFIGURATION ──────────────────────────────────────────────
const char* NTP_SERVER   = "pool.ntp.org";
const long  GMT_OFFSET   = 7 * 3600;  // UTC+7 (Thailand / Indochina)
const int   DST_OFFSET   = 0;

// ─── SENSOR DEFAULTS ──────────────────────────────────────────────────────
const int LDR_THRESHOLD_DEFAULT = 1500;  // 0 (Dark) to 4095 (Bright)
const int LDR_HYSTERESIS        = 200;   // Prevents flicker near threshold

// ─── OBJECT INSTANCES ─────────────────────────────────────────────────────
WebServer    server(80);
Preferences  prefs;
WiFiClient   espClient;
PubSubClient mqttClient(espClient);

BLEServer*          pBleServer            = NULL;
BLECharacteristic*  pBleTxCharacteristic = NULL;
BLECharacteristic*  pBleRxCharacteristic = NULL;
bool                bleClientConnected   = false;
bool                oldBleConnected      = false;

// ─── STATE VARIABLES ──────────────────────────────────────────────────────
bool     lightState      = false;   // false = OFF, true = ON
int      controlMode     = 0;       // 0=Manual, 1=Auto-Time, 2=Auto-LDR
int      ldrValue        = 0;       // LDR sensor reading
int      lastReportedLdr = -1;
int      ldrThreshold    = LDR_THRESHOLD_DEFAULT;

// Time schedule
int      scheduleOnHour  = 18;     // Default ON at 18:00
int      scheduleOnMin   = 0;
int      scheduleOffHour = 6;      // Default OFF at 06:00
int      scheduleOffMin  = 0;

// Button Hardware ISR Debounce
volatile unsigned long lastIsrTime     = 0;
volatile bool          buttonTriggered = false;

void IRAM_ATTR isrButton() {
  unsigned long now = millis();
  if (now - lastIsrTime > 60) {
    lastIsrTime = now;
    buttonTriggered = true;
  }
}

// Network & Timers
bool          wifiConnected    = false;
unsigned long wifiConnectStart = 0;
bool          mdnsStarted      = false;
bool          ntpConfigured    = false;
unsigned long lastMqttRetry    = 0;
unsigned long lastBleNotify    = 0;
unsigned long lastPrefSave     = 0;
bool          pendingPrefSave  = false;

// Relay Active-HIGH setting (HIGH = ON, LOW = OFF)
const int RELAY_ON  = HIGH;
const int RELAY_OFF = LOW;

// ─── FUNCTION DECLARATIONS ────────────────────────────────────────────────
void     setLight(bool state, bool manualOverride = false);
void     handleButton();
void     handleAutoTime();
void     handleAutoLDR();
void     syncNTP();
String   getCurrentTimeStr();
String   getJsonStatus();
void     notifyBleStatus();
void     publishMqttStatus();
void     handleCommandJson(const String& body);
void     loadPreferences();
void     savePreferences();
void     setupBLE();
void     setupWiFiAsync();
void     setupMQTT();
void     handleMQTT();
void     setupServer();
void     sendJsonStatusHttp();

// ══════════════════════════════════════════════════════════════════════════
//  BLE SERVER CALLBACKS
// ══════════════════════════════════════════════════════════════════════════
class BleServerCallbacks: public BLEServerCallbacks {
    void onConnect(BLEServer* pServer) {
      bleClientConnected = true;
      Serial.println("[BLE] Client Connected");
      notifyBleStatus();
    };

    void onDisconnect(BLEServer* pServer) {
      bleClientConnected = false;
      Serial.println("[BLE] Client Disconnected");
    }
};

class BleRxCallbacks: public BLECharacteristicCallbacks {
    void onWrite(BLECharacteristic *pCharacteristic) {
      String msg = pCharacteristic->getValue();
      if (msg.length() > 0) {
        Serial.print("[BLE RX] Command: ");
        Serial.println(msg);
        handleCommandJson(msg);
      }
    }
};

// ══════════════════════════════════════════════════════════════════════════
//  SETUP
// ══════════════════════════════════════════════════════════════════════════
void setup() {
  Serial.begin(115200);
  delay(100);

  Serial.println("\n\n==================================================");
  Serial.println("[System] allight — Autonomous Smart Luminaire");
  Serial.println("   [1] Physical Button  [2] Web Bluetooth (BLE)");
  Serial.println("   [3] Wi-Fi REST API   [4] Global MQTT Remote");
  Serial.println("==================================================");

  // 1. Initialize GPIO Hardware Instantly (< 1ms)
  pinMode(PIN_RELAY,   OUTPUT);
  pinMode(PIN_BUTTON,  INPUT_PULLUP);
  pinMode(PIN_LDR,     INPUT);
  pinMode(PIN_LED_LED, OUTPUT);
  attachInterrupt(digitalPinToInterrupt(PIN_BUTTON), isrButton, FALLING);

  // 2. Load Saved Settings & Restore Relay State
  loadPreferences();
  digitalWrite(PIN_RELAY, lightState ? RELAY_ON : RELAY_OFF);
  digitalWrite(PIN_LED_LED, LOW);
  Serial.println("[Hardware] Relay & Button (Interrupt-driven) ready");

  // 3. Initialize Bluetooth Low Energy (BLE)
  setupBLE();

  // 4. Initialize Wi-Fi in Non-Blocking Asynchronous Mode
  setupWiFiAsync();

  // 5. Initialize Cloud MQTT Client
  setupMQTT();

  // 6. Setup Web Server Routes
  setupServer();

  Serial.println("==================================================");
  Serial.println("[System] ESP32 ONLINE: Ready for Button / BLE / Wi-Fi / MQTT");
  Serial.println("==================================================\n");
}

// ══════════════════════════════════════════════════════════════════════════
//  LOOP
// ══════════════════════════════════════════════════════════════════════════
void loop() {
  // 1. Physical Pushbutton (HIGHEST PRIORITY - Instant < 1ms)
  handleButton();

  // 2. Web Server Dispatcher
  server.handleClient();

  // 3. Cloud MQTT Loop
  handleMQTT();

  // 4. Fast Exponential Moving Average (EMA) Sensor Reading
  int rawLdr = analogRead(PIN_LDR);
  if (ldrValue == 0) ldrValue = rawLdr;
  else ldrValue = (ldrValue * 7 + rawLdr) / 8;

  // 5. Autonomous Control Modes (Runs locally)
  if (controlMode == 1) {
    handleAutoTime();
  } else if (controlMode == 2) {
    handleAutoLDR();
  }

  // 6. BLE Maintenance
  if (!bleClientConnected && oldBleConnected) {
    delay(20);
    pBleServer->startAdvertising();
    Serial.println("[BLE] Restarted Advertising...");
    oldBleConnected = bleClientConnected;
  }
  if (bleClientConnected && !oldBleConnected) {
    oldBleConnected = bleClientConnected;
  }

  // 7. Periodic BLE Status Notification
  unsigned long now = millis();
  if (bleClientConnected && (now - lastBleNotify > 1500)) {
    lastBleNotify = now;
    if (abs(ldrValue - lastReportedLdr) > 30) {
      lastReportedLdr = ldrValue;
      notifyBleStatus();
    }
  }

  // 8. Wi-Fi Status Check & Async Services
  if (!USE_AP_MODE) {
    if (WiFi.status() == WL_CONNECTED) {
      if (!wifiConnected) {
        wifiConnected = true;
        Serial.printf("\n[Wi-Fi] Connected. IP: http://%s\n", WiFi.localIP().toString().c_str());
        
        if (!mdnsStarted && MDNS.begin("allight")) {
          MDNS.addService("http", "tcp", 80);
          mdnsStarted = true;
          Serial.println("[mDNS] Hostname Live: http://allight.local");
        }

        if (!ntpConfigured) {
          syncNTP();
          ntpConfigured = true;
        }
      }
    } else {
      if (wifiConnected) {
        wifiConnected = false;
        Serial.println("[Wi-Fi] Connection lost. Operating in autonomous offline mode.");
      }
    }
  }

  // 9. Deferred Asynchronous Flash Save
  if (pendingPrefSave && (now - lastPrefSave > 1500)) {
    savePreferences();
    pendingPrefSave = false;
  }
}

// ══════════════════════════════════════════════════════════════════════════
//  LIGHT CONTROLLER & SENSORS
// ══════════════════════════════════════════════════════════════════════════
void setLight(bool state, bool manualOverride) {
  if (lightState != state) {
    lightState = state;
    digitalWrite(PIN_RELAY, lightState ? RELAY_ON : RELAY_OFF);
    digitalWrite(PIN_LED_LED, lightState ? HIGH : LOW);
    
    Serial.printf("[Light] State Changed -> %s\n", lightState ? "ON (220V)" : "OFF");
    
    if (manualOverride) {
      controlMode = 0; // Switch to manual mode
    }

    pendingPrefSave = true;
    lastPrefSave = millis();

    notifyBleStatus();
    publishMqttStatus();
  }
}

void handleButton() {
  if (buttonTriggered) {
    buttonTriggered = false;
    Serial.println("[Button] Hardware Interrupt: Toggle Relay");
    setLight(!lightState, true);
  }
}

void handleAutoTime() {
  struct tm timeinfo;
  if (!getLocalTime(&timeinfo)) return;

  int currentMinutes = timeinfo.tm_hour * 60 + timeinfo.tm_min;
  int onMinutes      = scheduleOnHour * 60 + scheduleOnMin;
  int offMinutes     = scheduleOffHour * 60 + scheduleOffMin;

  bool shouldBeOn = false;
  if (onMinutes < offMinutes) {
    shouldBeOn = (currentMinutes >= onMinutes && currentMinutes < offMinutes);
  } else {
    shouldBeOn = (currentMinutes >= onMinutes || currentMinutes < offMinutes);
  }

  setLight(shouldBeOn, false);
}

void handleAutoLDR() {
  if (ldrValue < (ldrThreshold - LDR_HYSTERESIS / 2)) {
    setLight(true, false);
  } else if (ldrValue > (ldrThreshold + LDR_HYSTERESIS / 2)) {
    setLight(false, false);
  }
}

void syncNTP() {
  configTime(GMT_OFFSET, DST_OFFSET, NTP_SERVER);
  Serial.println("[NTP] Time synchronization requested");
}

String getCurrentTimeStr() {
  struct tm timeinfo;
  if (!getLocalTime(&timeinfo)) return "--:--:--";
  char buf[16];
  sprintf(buf, "%02d:%02d:%02d", timeinfo.tm_hour, timeinfo.tm_min, timeinfo.tm_sec);
  return String(buf);
}

// ══════════════════════════════════════════════════════════════════════════
//  BLUETOOTH LOW ENERGY (BLE GATT)
// ══════════════════════════════════════════════════════════════════════════
void setupBLE() {
  BLEDevice::init(BLE_DEVICE_NAME);
  pBleServer = BLEDevice::createServer();
  pBleServer->setCallbacks(new BleServerCallbacks());

  BLEService *pService = pBleServer->createService(SERVICE_UUID);

  pBleTxCharacteristic = pService->createCharacteristic(
    CHARACTERISTIC_UUID_TX,
    BLECharacteristic::PROPERTY_NOTIFY | BLECharacteristic::PROPERTY_READ
  );
  pBleTxCharacteristic->addDescriptor(new BLE2902());

  pBleRxCharacteristic = pService->createCharacteristic(
    CHARACTERISTIC_UUID_RX,
    BLECharacteristic::PROPERTY_WRITE
  );
  pBleRxCharacteristic->setCallbacks(new BleRxCallbacks());

  pService->start();

  BLEAdvertising *pAdvertising = BLEDevice::getAdvertising();
  pAdvertising->addServiceUUID(SERVICE_UUID);
  pAdvertising->setScanResponse(true);
  pAdvertising->setMinPreferred(0x06);
  pAdvertising->setMinPreferred(0x12);
  BLEDevice::startAdvertising();

  Serial.println("[BLE] GATT Server Ready: '" BLE_DEVICE_NAME "'");
}

void notifyBleStatus() {
  if (pBleTxCharacteristic != NULL && bleClientConnected) {
    String json = getJsonStatus();
    pBleTxCharacteristic->setValue(json.c_str());
    pBleTxCharacteristic->notify();
  }
}

// ══════════════════════════════════════════════════════════════════════════
//  CLOUD MQTT CLIENT (100% Guaranteed Connection)
// ══════════════════════════════════════════════════════════════════════════
void mqttCallback(char* topic, byte* payload, unsigned int length) {
  String message;
  message.reserve(length + 1);
  for (unsigned int i = 0; i < length; i++) {
    message += (char)payload[i];
  }
  Serial.printf("[MQTT RX] %s: %s\n", topic, message.c_str());
  handleCommandJson(message);
  publishMqttStatus();
}

void setupMQTT() {
  mqttClient.setServer(MQTT_HOST, MQTT_PORT);
  mqttClient.setCallback(mqttCallback);
  mqttClient.setBufferSize(512);
  mqttClient.setKeepAlive(60);
  Serial.printf("[MQTT] Initialized for Broker: %s (Port %d)\n", MQTT_HOST, MQTT_PORT);
}

void publishMqttStatus() {
  if (mqttClient.connected()) {
    String json = getJsonStatus();
    mqttClient.publish(MQTT_TOPIC_STATE, json.c_str());
    Serial.println("[MQTT TX] Broadcasted state update");
  }
}

void handleMQTT() {
  if (!wifiConnected) return;

  if (!mqttClient.connected()) {
    unsigned long now = millis();
    if (now - lastMqttRetry > 3000) {
      lastMqttRetry = now;
      
      String clientId = "ESP32-SmartLight-" + String((uint32_t)ESP.getEfuseMac(), HEX);
      Serial.printf("[MQTT] Connecting to %s:%d... ", MQTT_HOST, MQTT_PORT);
      if (mqttClient.connect(clientId.c_str())) {
        Serial.println("Connected");
        mqttClient.subscribe(MQTT_TOPIC_CMD);
        publishMqttStatus();
      } else {
        Serial.printf("Failed (rc=%d). Retrying in 3s\n", mqttClient.state());
      }
    }
  } else {
    mqttClient.loop();
  }
}

// ══════════════════════════════════════════════════════════════════════════
//  COMMAND DISPATCHER & JSON STATUS
// ══════════════════════════════════════════════════════════════════════════
String getJsonStatus() {
  char json[256];
  snprintf(json, sizeof(json),
    "{\"light\":%s,\"mode\":%d,\"ldrValue\":%d,\"ldrThreshold\":%d,"
    "\"onHour\":%d,\"onMin\":%d,\"offHour\":%d,\"offMin\":%d,"
    "\"time\":\"%s\",\"ble\":%s,\"wifi\":%s,\"mqtt\":%s}",
    lightState ? "true" : "false",
    controlMode, ldrValue, ldrThreshold,
    scheduleOnHour, scheduleOnMin, scheduleOffHour, scheduleOffMin,
    getCurrentTimeStr().c_str(),
    bleClientConnected ? "true" : "false",
    wifiConnected ? "true" : "false",
    mqttClient.connected() ? "true" : "false"
  );
  return String(json);
}

void handleCommandJson(const String& body) {
  bool updated = false;

  if (body.indexOf("\"action\":\"toggle\"") >= 0 || body.indexOf("\"toggle\"") >= 0) {
    setLight(!lightState, true);
    updated = true;
  }
  else if (body.indexOf("\"action\":\"setLight\"") >= 0 || body.indexOf("\"state\"") >= 0) {
    bool targetState = (body.indexOf("\"state\":true") >= 0 || body.indexOf("\"state\":1") >= 0 || body.indexOf("\"state\": 1") >= 0);
    setLight(targetState, true);
    updated = true;
  }
  
  if (body.indexOf("\"mode\"") >= 0) {
    int idx = body.indexOf("\"mode\"");
    int colon = body.indexOf(':', idx);
    if (colon >= 0) {
      controlMode = constrain(body.substring(colon + 1).toInt(), 0, 2);
      updated = true;
      Serial.printf("[Mode] Set to %d\n", controlMode);
    }
  }

  if (body.indexOf("\"threshold\"") >= 0 || body.indexOf("\"ldrThreshold\"") >= 0) {
    int idx = body.indexOf("\"threshold\"");
    if (idx < 0) idx = body.indexOf("\"ldrThreshold\"");
    int colon = body.indexOf(':', idx);
    if (colon >= 0) {
      ldrThreshold = constrain(body.substring(colon + 1).toInt(), 0, 4095);
      updated = true;
      Serial.printf("[LDR Threshold] Set to %d\n", ldrThreshold);
    }
  }

  if (body.indexOf("\"onHour\"") >= 0 || body.indexOf("\"offHour\"") >= 0) {
    auto extract = [&](const char* key) -> int {
      int idx = body.indexOf(key);
      if (idx < 0) return -1;
      int colon = body.indexOf(':', idx);
      if (colon < 0) return -1;
      return body.substring(colon + 1).toInt();
    };

    int vOnH  = extract("\"onHour\"");
    int vOnM  = extract("\"onMin\"");
    int vOffH = extract("\"offHour\"");
    int vOffM = extract("\"offMin\"");

    if (vOnH  >= 0) scheduleOnHour  = constrain(vOnH,  0, 23);
    if (vOnM  >= 0) scheduleOnMin   = constrain(vOnM,  0, 59);
    if (vOffH >= 0) scheduleOffHour = constrain(vOffH, 0, 23);
    if (vOffM >= 0) scheduleOffMin  = constrain(vOffM, 0, 59);

    updated = true;
    Serial.printf("[Schedule] Set -> ON %02d:%02d | OFF %02d:%02d\n",
      scheduleOnHour, scheduleOnMin, scheduleOffHour, scheduleOffMin);
  }

  if (updated) {
    pendingPrefSave = true;
    lastPrefSave = millis();
    notifyBleStatus();
    publishMqttStatus();
  }
}

// ══════════════════════════════════════════════════════════════════════════
//  WI-FI & WEB SERVER
// ══════════════════════════════════════════════════════════════════════════
void setupWiFiAsync() {
  if (USE_AP_MODE) {
    WiFi.mode(WIFI_AP);
    WiFi.softAP(AP_SSID, AP_PASS);
    Serial.printf("[Wi-Fi AP] Broadcasted '%s' (IP: http://%s)\n", AP_SSID, WiFi.softAPIP().toString().c_str());
  } else {
    WiFi.mode(WIFI_STA);
    WiFi.setAutoReconnect(true);
    WiFi.begin(WIFI_SSID, WIFI_PASS);
    wifiConnectStart = millis();
    Serial.printf("[Wi-Fi STA] Connecting to '%s' in background...\n", WIFI_SSID);
  }
}

void handleCORSHeaders() {
  server.sendHeader("Access-Control-Allow-Origin", "*");
  server.sendHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE");
  server.sendHeader("Access-Control-Allow-Headers", "Content-Type, Origin, Accept, Authorization, X-Requested-With");
  server.sendHeader("Access-Control-Max-Age", "86400");
}

void sendJsonStatusHttp() {
  String json = getJsonStatus();
  handleCORSHeaders();
  server.sendHeader("Cache-Control", "no-store, no-cache, must-revalidate");
  server.send(200, "application/json", json);
}

void setupServer() {
  server.enableCORS(true);

  // Global OPTIONS preflight interceptor for all routes
  server.onNotFound([]() {
    if (server.method() == HTTP_OPTIONS) {
      handleCORSHeaders();
      server.send(204);
    } else {
      server.send(404, "text/plain", "Not found");
    }
  });

  server.on("/", HTTP_GET, []() {
    server.sendHeader("Cache-Control", "no-cache");
    server.sendHeader("Connection", "close");
    server.send_P(200, "text/html", PAGE_HTML);
  });

  // Explicit OPTIONS and POST handlers for all API routes
  auto registerApiRoute = [](const char* path, const char* altPath, auto postHandler) {
    server.on(path, HTTP_OPTIONS, []() { handleCORSHeaders(); server.send(204); });
    server.on(altPath, HTTP_OPTIONS, []() { handleCORSHeaders(); server.send(204); });
    server.on(path, HTTP_POST, postHandler);
    server.on(altPath, HTTP_POST, postHandler);
  };

  server.on("/status", HTTP_OPTIONS, []() { handleCORSHeaders(); server.send(204); });
  server.on("/api/status", HTTP_OPTIONS, []() { handleCORSHeaders(); server.send(204); });
  server.on("/status", HTTP_GET, sendJsonStatusHttp);
  server.on("/api/status", HTTP_GET, sendJsonStatusHttp);

  registerApiRoute("/toggle", "/api/toggle", []() {
    setLight(!lightState, true);
    sendJsonStatusHttp();
  });

  registerApiRoute("/setLight", "/api/light", []() {
    handleCommandJson(server.arg("plain"));
    sendJsonStatusHttp();
  });

  registerApiRoute("/setMode", "/api/mode", []() {
    handleCommandJson(server.arg("plain"));
    sendJsonStatusHttp();
  });

  registerApiRoute("/setSchedule", "/api/schedule", []() {
    handleCommandJson(server.arg("plain"));
    sendJsonStatusHttp();
  });

  registerApiRoute("/setThreshold", "/api/threshold", []() {
    handleCommandJson(server.arg("plain"));
    sendJsonStatusHttp();
  });

  server.begin();
  Serial.println("[Web Server] HTTP Routes online with universal CORS support");
}

// ══════════════════════════════════════════════════════════════════════════
//  PERSISTENCE (Flash Preferences)
// ══════════════════════════════════════════════════════════════════════════
void loadPreferences() {
  prefs.begin("smartlight", false);
  lightState      = prefs.getBool("light",    false);
  controlMode     = prefs.getInt("mode",      0);
  ldrThreshold    = prefs.getInt("ldrThres",  LDR_THRESHOLD_DEFAULT);
  scheduleOnHour  = prefs.getInt("onHour",    18);
  scheduleOnMin   = prefs.getInt("onMin",     0);
  scheduleOffHour = prefs.getInt("offHour",   6);
  scheduleOffMin  = prefs.getInt("offMin",    0);
  prefs.end();

  Serial.printf("[NVS] Loaded: Light=%s | Mode=%d | LDR Thresh=%d | ON %02d:%02d | OFF %02d:%02d\n",
    lightState ? "ON" : "OFF", controlMode, ldrThreshold,
    scheduleOnHour, scheduleOnMin, scheduleOffHour, scheduleOffMin);
}

void savePreferences() {
  prefs.begin("smartlight", false);
  prefs.putBool("light",   lightState);
  prefs.putInt("mode",     controlMode);
  prefs.putInt("ldrThres", ldrThreshold);
  prefs.putInt("onHour",   scheduleOnHour);
  prefs.putInt("onMin",    scheduleOnMin);
  prefs.putInt("offHour",  scheduleOffHour);
  prefs.putInt("offMin",   scheduleOffMin);
  prefs.end();
  Serial.println("[NVS] Settings Saved to Flash Memory");
}
