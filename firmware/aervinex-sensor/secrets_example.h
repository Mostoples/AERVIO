// =============================================================================
//  AERVINEX firmware - secrets template
// -----------------------------------------------------------------------------
//  1. Copy this file to  secrets.h  (same directory).
//  2. Fill in the values below.
//  3. secrets.h is in firmware/.gitignore — do NOT commit it.
// =============================================================================
#pragma once

// ----- WiFi STA credentials -----
#define WIFI_SSID       "YOUR_WIFI_SSID"
#define WIFI_PASS       "YOUR_WIFI_PASSWORD"

// ----- OTA (ArduinoOTA) -----
// Comment the line out to disable password auth on OTA.
#define OTA_PASSWORD    "change-me-please"

// ----- Firebase / backend (optional - reserved for future HTTP push path) -----
#define FIREBASE_HOST   "aervinex-default-rtdb.asia-southeast1.firebasedatabase.app"
#define FIREBASE_AUTH   "YOUR_DATABASE_SECRET_OR_ID_TOKEN"
#define DEVICE_ID       "aervinex-dev-001"

// ----- BLE pairing PIN (reserved, NimBLE bonding) -----
#define BLE_STATIC_PIN  123456
