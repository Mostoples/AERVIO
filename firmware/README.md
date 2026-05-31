# AERVINEX Firmware Suite

Firmware untuk smartwatch AERVINEX — kombinasi sensor PPG/SpO2, lingkungan
(suhu, RH, tekanan), kualitas udara (PM2.5/PM10), dan UV index — yang
mengalirkan telemetry ke aplikasi web AERVINEX lewat BLE GATT + Serial JSON.

Target board: **ESP32-WROOM-32** (default) atau **ESP32-S3 DevKit**.

---

## 1. Bill of Materials (BOM)

Harga perkiraan ritel Indonesia (Tokopedia/Shopee, awal 2026). Pakai sebagai
panduan kasar, bukan harga distributor.

| # | Komponen                          | Part / Modul                          | Qty | Harga satuan (Rp) |
|---|-----------------------------------|---------------------------------------|----:|------------------:|
| 1 | MCU                               | ESP32-WROOM-32 DevKit V1 (38 pin)     | 1   | 75.000 – 110.000  |
| 1a| Alternatif MCU                    | ESP32-S3 DevKit (N16R8)               | 1   | 180.000 – 240.000 |
| 2 | PPG/SpO2                          | MAX30102 breakout (GY-MAX30102)       | 1   | 35.000 – 55.000   |
| 3 | T / RH / Tekanan                  | BME280 breakout (I²C, 3.3 V)          | 1   | 60.000 – 95.000   |
| 4 | PM2.5 / PM10                      | Nova SDS011 (USB + UART pigtail)      | 1   | 350.000 – 480.000 |
| 5 | UV index                          | GUVA-S12SD analog module              | 1   | 45.000 – 75.000   |
| 6 | Skin temp (opsional)              | DS18B20 waterproof                    | 1   | 25.000 – 40.000   |
| 7 | Resistor pull-up 4.7 kΩ           | THT atau 0805 SMD                     | 4   | 200 – 500         |
| 8 | Resistor voltage divider 100 kΩ   | 1 % toleransi                         | 2   | 500 – 1.000       |
| 9 | Baterai LiPo 1S 1100 mAh          | dengan protection BMS                 | 1   | 60.000 – 95.000   |
|10 | TP4056 + DW01 charge module       | mikro-USB / USB-C                     | 1   | 8.000 – 15.000    |
|11 | Boost 3.7 V → 5 V (opsional)      | MT3608 modul                          | 1   | 10.000 – 18.000   |
|12 | Casing 3D print / PCB carrier     | PLA / FR4                             | 1   | 25.000 – 75.000   |
|13 | Kabel jumper + header             | dupont 20 cm × 20                     | 1   | 12.000 – 20.000   |

Estimasi total prototipe: **Rp 750.000 – 1.250.000** (tanpa SDS011 sekitar
Rp 350.000–550.000; SDS011 adalah komponen termahal — pertimbangkan PMS5003
sebagai alternatif Rp ±250.000 dengan API mirip).

---

## 2. Wiring diagram (ASCII)

```
                          ┌─────────────────────────────────┐
                          │         ESP32-WROOM-32           │
                          │       (DOIT DevKit V1, 30p)      │
                          │                                  │
   MAX30102                │ 3V3 ──────────┬────── VIN MAX   │
   ┌────────┐              │               │                  │
   │ VIN    │◀── 3V3 ──────┤               │                  │
   │ GND    │◀── GND ──────┤               ▼                  │
   │ SDA    │◀── GPIO 21 ──┤ I²C SDA  (with 4.7k pull-up)     │
   │ SCL    │◀── GPIO 22 ──┤ I²C SCL  (with 4.7k pull-up)     │
   └────────┘              │                                  │
                           │                                  │
   BME280  (addr 0x76)     │                                  │
   ┌────────┐              │                                  │
   │ VIN    │◀── 3V3 ──────┤                                  │
   │ GND    │◀── GND ──────┤                                  │
   │ SDA    │◀── GPIO 21 ──┤  (shares I²C with MAX30102)      │
   │ SCL    │◀── GPIO 22 ──┤                                  │
   └────────┘              │                                  │
                           │                                  │
   SDS011                  │                                  │
   ┌────────┐              │                                  │
   │ 5V     │◀── 5V VIN ───┤  (SDS011 MUST be 5 V)             │
   │ GND    │◀── GND ──────┤                                  │
   │ TXD    │──▶ GPIO 16 ──┤  (UART2 RX)                      │
   │ RXD    │◀── GPIO 17 ──┤  (UART2 TX)                      │
   └────────┘              │                                  │
                           │                                  │
   GUVA-S12SD              │                                  │
   ┌────────┐              │                                  │
   │ VCC    │◀── 3V3 ──────┤                                  │
   │ GND    │◀── GND ──────┤                                  │
   │ OUT    │──▶ GPIO 34 ──┤  ADC1_CH6                        │
   └────────┘              │                                  │
                           │                                  │
   Battery 1S LiPo         │                                  │
   ┌────────┐              │                                  │
   │ Vbat   │── 100 kΩ ──┬─┤ GPIO 35  ADC1_CH7                │
   │ GND    │            │ │                                  │
   │        │           100kΩ                                 │
   │        │            │                                    │
   │        │            └── GND                              │
   └────────┘              │                                  │
                           │                                  │
   DS18B20 (optional)      │                                  │
   ┌────────┐              │                                  │
   │ VCC    │◀── 3V3 ──────┤                                  │
   │ GND    │◀── GND ──────┤                                  │
   │ DATA   │──▶ GPIO 4  ──┤  (with 4.7k pull-up to 3V3)      │
   └────────┘              │                                  │
                           └─────────────────────────────────┘
```

**Penting**
- MAX30102 dan BME280 berbagi bus I²C — alamatnya berbeda (0x57 vs 0x76).
- SDS011 wajib **5 V** untuk fan-nya, sementara UART-nya tetap 3.3 V logic
  yang aman ke ESP32.
- Voltage divider 100 kΩ/100 kΩ memetakan 4.2 V baterai menjadi 2.1 V untuk
  ADC ESP32 — aman dalam rentang 0–3.3 V dengan margin.
- Total pull-up I²C cukup satu pasang 4.7 kΩ untuk seluruh bus.

---

## 3. Install arduino-cli

### Linux / macOS / WSL
```bash
bash firmware/scripts/setup.sh
```

### Windows PowerShell
```powershell
powershell -ExecutionPolicy Bypass -File firmware/scripts/setup.ps1
```

Manual fallback:
1. Unduh `arduino-cli` dari https://arduino.github.io/arduino-cli/latest/installation/.
2. Jalankan:
   ```bash
   arduino-cli config init
   arduino-cli config add board_manager.additional_urls \
     https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json
   arduino-cli core update-index
   arduino-cli core install esp32:esp32
   ```
3. Install library (lihat `firmware/library_dependencies.txt`).

---

## 4. Build & flash

```bash
# salin kredensial
cp firmware/aervinex-sensor/secrets_example.h firmware/aervinex-sensor/secrets.h
# edit secrets.h, isi WIFI_SSID, WIFI_PASS, OTA_PASSWORD

# compile
bash firmware/scripts/compile.sh
# atau   .\firmware\scripts\compile.ps1

# flash
bash firmware/scripts/flash.sh /dev/ttyUSB0
# atau   .\firmware\scripts\flash.ps1 -Port COM3

# serial monitor (telemetry JSON 5s)
bash firmware/scripts/monitor.sh /dev/ttyUSB0
# atau   .\firmware\scripts\monitor.ps1 -Port COM3
```

Untuk ESP32-S3, override FQBN:
```bash
FQBN=esp32:esp32:esp32s3 bash firmware/scripts/compile.sh
```
atau pada PowerShell:
```powershell
.\firmware\scripts\compile.ps1 -Fqbn esp32:esp32:esp32s3
```

---

## 5. BLE GATT contract

Vendor app / web client dapat memakai UUID berikut.

### 5.1 Standard services (Bluetooth SIG)

| Service                       | UUID    | Characteristic               | UUID    | Props          | Format                                        |
|-------------------------------|---------|------------------------------|---------|----------------|-----------------------------------------------|
| Heart Rate                    | 0x180D  | Heart Rate Measurement       | 0x2A37  | NOTIFY, READ   | uint8 flags, uint8 BPM (flag 0x00)            |
| Heart Rate                    | 0x180D  | Body Sensor Location         | 0x2A38  | READ           | uint8 (0x02 = wrist)                          |
| Environmental Sensing         | 0x181A  | Temperature                  | 0x2A6E  | NOTIFY, READ   | sint16, °C × 100                              |
| Environmental Sensing         | 0x181A  | Humidity                     | 0x2A6F  | NOTIFY, READ   | uint16, % × 100                               |
| Environmental Sensing         | 0x181A  | Pressure                     | 0x2A6D  | NOTIFY, READ   | uint32, Pa × 10                               |

### 5.2 AERVINEX custom service (Nordic-style 128-bit UUID)

| Characteristic               | UUID                                       | Props          | Payload                          |
|------------------------------|--------------------------------------------|----------------|----------------------------------|
| Service base                 | `6E400001-B5A3-F393-E0A9-E50E24DCCA9E`     | —              | container                        |
| Telemetry JSON               | `6E400002-B5A3-F393-E0A9-E50E24DCCA9E`     | NOTIFY, READ   | UTF-8 JSON, ≤ 512 B (lihat 5.3)  |
| Command sink (host → device) | `6E400003-B5A3-F393-E0A9-E50E24DCCA9E`     | WRITE          | UTF-8 string, e.g. `reboot`      |
| Battery percent              | `6E400004-B5A3-F393-E0A9-E50E24DCCA9E`     | NOTIFY, READ   | uint8 (0..100)                   |

### 5.3 Telemetry JSON schema

```json
{
  "uptime_s":   12345,
  "hr_bpm":     72.4,
  "hr_conf":    90,
  "spo2_pct":   97.0,
  "temp_c":     29.1,
  "humid_pct":  72.3,
  "press_hpa":  1009.6,
  "pm25_ugm3":  18.2,
  "pm10_ugm3":  41.7,
  "uv_index":   3.0,
  "bat_v":      3.95,
  "bat_pct":    73
}
```

Telemetry diterbitkan tiap **5 detik** baik ke Serial @ 115200 baud (1 baris
JSON per pesan) maupun ke characteristic `6E400002-…` via BLE NOTIFY.

---

## 6. OTA update flow

1. Pastikan device terhubung WiFi STA yang sama dengan komputer Anda dan
   serial menampilkan `[WiFi] IP: x.x.x.x`.
2. Dari arduino-cli:
   ```bash
   arduino-cli upload \
     --fqbn esp32:esp32:esp32 \
     --port aervinex.local \
     --upload-field network.password=$OTA_PASSWORD \
     firmware/aervinex-sensor
   ```
   atau pakai Arduino IDE → **Tools → Port → Network ports → aervinex**.
3. Jika mDNS gagal, ganti hostname dengan IP literal.
4. Setelah OTA selesai, ESP32 reboot otomatis dan kembali ke loop normal.

Password OTA diset lewat `secrets.h` (`OTA_PASSWORD`). Comment out makro
tersebut untuk menonaktifkan password (NOT recommended untuk perangkat
yang ter-deploy).

---

## 7. Troubleshooting

| Gejala                                            | Penyebab umum                        | Solusi                                                                                  |
|---------------------------------------------------|--------------------------------------|-----------------------------------------------------------------------------------------|
| `arduino-cli: command not found`                  | PATH belum di-set                    | Tambahkan `~/.local/bin` (Linux/mac) atau `%LOCALAPPDATA%\Programs\arduino-cli` (Win)   |
| `error: 'MAX30105' was not declared`              | Library SparkFun belum terpasang     | `arduino-cli lib install "SparkFun MAX3010x Pulse and Proximity Sensor Library"`        |
| `Failed to connect to ESP32: Timed out…`          | Tidak masuk bootloader               | Tahan tombol BOOT saat flash, lepas setelah connecting muncul                            |
| `Port not found` di `arduino-cli board list`      | CP210x / CH9102 driver belum ada     | Install driver Silicon Labs CP210x / WCH CH9102                                          |
| Reading PPG selalu 0                              | Sensor tidak menempel kulit          | Pastikan jari/pergelangan menutup MAX30102; cek I²C (`Wire.begin(21,22)`)                |
| SDS011 status `pm25=NaN`                          | Sensor masih sleeping / fan rusak    | Sketch sudah `wakeup()`+10 s; cek tegangan 5 V; ganti kipas jika berisik                |
| BME280 not found                                  | Alamat 0x77 vs 0x76                  | Sketch fallback ke 0x77 otomatis; cek solder jumper SDO                                  |
| BLE tidak muncul di nRF Connect                   | Advertising belum start              | Reboot device; cek log `[BLE] advertising as AERVINEX`                                   |
| OTA tidak terlihat di IDE                         | Firewall / mDNS                      | Izinkan UDP 5353; gunakan IP literal                                                     |

---

## 8. Tested boards

| Board                       | FQBN                              | Catatan                                                  |
|-----------------------------|-----------------------------------|----------------------------------------------------------|
| DOIT ESP32 DevKit V1 (30p)  | `esp32:esp32:esp32`               | Konfigurasi default, USB CP2102                          |
| ESP32-S3 DevKit C-1         | `esp32:esp32:esp32s3`             | Override FQBN; pinout sama (SDA 8/SCL 9 di S3 DevKit)    |
| M5StickC Plus2              | `esp32:esp32:m5stack_stickc_plus` | Tanpa SDS011; battery monitoring lewat AXP192            |
| LilyGO T-Watch S3 (eksp.)   | `esp32:esp32:esp32s3`             | Butuh remap I²C ke pin internal, lihat datasheet         |

---

## 9. Lisensi & atribusi

- Sketch ini MIT-licensed (sesuai header `aervinex-sensor.ino`).
- SpO2 algorithm (`spo2_algorithm.h`) © Maxim Integrated, dipakai sesuai
  contoh SparkFun MAX3010x library.
- NimBLE-Arduino © h2zero, Apache 2.0.

Pertanyaan / bug report → GitHub issues di repo AERVINEX.
