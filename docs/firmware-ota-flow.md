# AERVINEX Firmware OTA Flow

## Ringkasan
Sistem OTA AERVINEX terdiri dari tiga komponen:

1. **Admin web upload** — `public/admin/firmware-ota.html` (`firmware-ota.js`) — upload `.bin` ke Firebase Storage, register metadata di Firestore `firmware_versions/{version}`.
2. **Cloud Function trigger** (stub: `/api/notifyFirmwareUpdate`) — fan out FCM notification ke semua `paired_devices` yang berlangganan channel sesuai.
3. **Firmware client** (ESP32, `firmware/aervinex-sensor/aervinex-sensor.ino`) — saat menerima notify atau saat polling periodik, ambil `downloadURL` lalu apply via `Update.h` / ArduinoOTA.

```
+--------------+      +-----------------+      +-----------------+
| Admin web    |----->| Firebase        |----->| Cloud Function  |
| (upload .bin)|      | Storage + FS    |      | notifyFleet     |
+--------------+      +--------+--------+      +--------+--------+
                               |                        | FCM
                               v                        v
                       firmware_versions/{v}     paired_devices (FCM tokens)
                               |                        |
                               +----------+-------------+
                                          v
                                +-----------------+
                                | ESP32 firmware  |
                                |  - HTTPS GET    |
                                |  - Update.h     |
                                +-----------------+
```

## Storage Layout
- `firmware/{version}/aervinex-sensor.bin` — payload
- Customer metadata: `version`, `channel`, `uploadedBy`

## Firestore Schema (`firmware_versions/{version}`)
```jsonc
{
  "version": "1.0.4",
  "channel": "stable",           // stable | beta | canary
  "releaseNotes": "...",
  "sha256": "abc123...",
  "sizeBytes": 481236,
  "downloadURL": "https://...",
  "storagePath": "firmware/1.0.4/aervinex-sensor.bin",
  "releasedAt": "<serverTimestamp>",
  "releasedBy": "cooxnime@gmail.com"
}
```

## Cloud Function (TODO — stub at `/api/notifyFirmwareUpdate`)
**Trigger**: HTTPS callable (admin only)
**Payload**: `{ version, channel }`
**Logic**:
1. Query `paired_devices` where `subscribed_channel == channel`.
2. Batch FCM push with data payload `{ ota_version, ota_url, ota_sha256 }`.
3. Log to `audit_log/{auto}` for traceability.

## Firmware-side Update (ESP32)
1. Pada boot atau saat menerima FCM/MQTT, kirim HTTPS GET ke `downloadURL`.
2. Verifikasi SHA256 sebelum flash.
3. Gunakan `Update.begin()` → `Update.write()` → `Update.end(true)` → `ESP.restart()`.
4. Roll-back: simpan slot factory di partisi `factory`; jika boot count > 3 tanpa "healthy" flag, fallback ke factory.

## Browser Web Bluetooth Support Matrix
| Platform        | Browser           | Status |
|-----------------|-------------------|--------|
| Windows / macOS | Chrome 56+        | ✅     |
| Windows / macOS | Edge 79+          | ✅     |
| Linux           | Chrome (flag)     | ⚠️     |
| Android         | Chrome 56+        | ✅     |
| iOS             | Safari            | ❌     |
| iOS             | Bluefy (3rd party)| ⚠️     |
| Firefox         | All               | ❌     |

**Konsekuensi untuk iOS**: pengguna iPhone tidak bisa langsung pair via Web Bluetooth. Roadmap mitigasi:
- Phase 1: arahkan ke Bluefy browser (paid app, tidak ideal).
- Phase 2: native iOS companion app (Capacitor/React Native bridge).
- Phase 3: ESP32 dual-mode — selain BLE, expose WebSocket di WiFi setup AP sehingga pengguna iOS bisa konek langsung tanpa BLE.

## Security
- Storage rules harus membatasi write ke `request.auth.token.email in [admin]`.
- Cloud Function harus verify ID token + custom claim `admin`.
- SHA256 verification wajib di firmware sebelum flash.
- Rollback otomatis jika boot 3x gagal (anti-bricked).

## Testing Checklist
- [ ] Upload `.bin` 500 KB via admin page — progress bar smooth.
- [ ] Firestore `firmware_versions/1.0.4` ter-create dengan sha256 valid.
- [ ] Download URL dapat di-fetch dari ESP32 (HTTPS root CA bundled).
- [ ] FCM trigger berhasil mencapai device test.
- [ ] Firmware apply update tanpa brick; reboot bersih.
- [ ] Roll-back path kembali ke v sebelumnya jika gagal 3x.

## Catatan Production
- Firestore rules saat ini belum menyertakan path `firmware_versions/{v}` — perlu tambah rule **admin-only write, public read** atau auth-only read.
- Storage rules juga perlu di-update (file ini fokus pada flow; konfigurasi rules adalah follow-up).
