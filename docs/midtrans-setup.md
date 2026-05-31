# AERVINEX × Midtrans — Payment Integration Setup

Dokumen ini menjelaskan cara memasang & menjalankan integrasi Midtrans untuk subscription Pro & Family AERVINEX.

---

## 1. Daftar Merchant Midtrans

1. Buka https://midtrans.com → klik **Sign Up**.
2. Pilih jenis bisnis: **Aplikasi Teknologi / SaaS / Healthtech**.
3. Lengkapi dokumen KYC:
   - KTP direktur / pemilik
   - NPWP perusahaan (atau NPWP pribadi untuk personal)
   - Akta pendirian (jika PT/CV)
   - Rekening bank perusahaan untuk settlement
4. Tunggu approval (umumnya 2-5 hari kerja).

> Tip: untuk test/sandbox, tidak perlu KYC selesai — gunakan akun sandbox di
> https://dashboard.sandbox.midtrans.com.

---

## 2. Mendapatkan Server Key & Client Key

### Sandbox (untuk development & testing)

1. Login ke https://dashboard.sandbox.midtrans.com.
2. Settings → **Access Keys**.
3. Salin:
   - **Server Key** (format `SB-Mid-server-XXXXX`) — RAHASIA, jangan di-commit.
   - **Client Key** (format `SB-Mid-client-XXXXX`) — boleh public, dipakai di snap.js.

### Production (setelah KYC approved)

1. Login ke https://dashboard.midtrans.com.
2. Settings → **Access Keys**.
3. Salin Server Key & Client Key (format tanpa prefix `SB-`).

---

## 3. Set Environment Variables di Firebase Functions

```bash
# Sandbox
firebase functions:config:set \
  midtrans.server_key="SB-Mid-server-XXXXX" \
  midtrans.client_key="SB-Mid-client-XXXXX" \
  midtrans.is_production="false"

# Production
firebase functions:config:set \
  midtrans.server_key="Mid-server-XXXXX" \
  midtrans.client_key="Mid-client-XXXXX" \
  midtrans.is_production="true"

# (Optional) SendGrid untuk email dunning
firebase functions:config:set sendgrid.api_key="SG.XXXXX"
```

Deploy:

```bash
cd functions
npm install
firebase deploy --only functions:createSubscription,functions:cancelSubscription,functions:midtransWebhook,functions:dunningManagement
```

---

## 4. Konfigurasi Frontend Client Key

Edit `public/subscription.html`:

```html
<script src="https://app.sandbox.midtrans.com/snap/snap.js"
        data-client-key="SB-Mid-client-XXXXX"></script>
```

Untuk production ganti URL ke `https://app.midtrans.com/snap/snap.js` dan client key
production.

---

## 5. Set Webhook Notification URL di Midtrans Dashboard

1. Midtrans Dashboard → Settings → **Configuration** → **Payment Notification URL**.
2. Isi dengan URL Cloud Function `midtransWebhook`:

```
https://asia-southeast2-aervinex.cloudfunctions.net/midtransWebhook
```

3. Test dengan tombol **Test Notification** di dashboard.

---

## 6. Test Sandbox Flow

1. Buka `https://aervinex.web.app/subscription.html` (sebagai user logged-in).
2. Klik **Mulai 7 Hari Gratis** pada plan Pro.
3. Pertama kali: akan otomatis activate 7-day trial (no charge).
4. Untuk test bayar langsung (skip trial), set `has_trialed: true` di Firestore subscriptions/{uid} dulu.
5. Snap modal akan terbuka. Gunakan test card sandbox:

| Type        | Card Number              | CVV | Exp     | OTP    |
|-------------|--------------------------|-----|---------|--------|
| Accepted    | 4811 1111 1111 1114      | 123 | 01/25   | 112233 |
| Denied      | 4911 1111 1111 1113      | 123 | 01/25   | 112233 |
| QRIS        | Scan QR di simulator     | -   | -       | -      |
| GoPay       | (Simulator otomatis)     | -   | -       | -      |

6. Setelah berhasil bayar, cek:
   - `payment_orders/{orderId}.status` → `active`
   - `subscriptions/{uid}.status` → `active`, `expiry` → 30 hari ke depan
   - Inbox alerts → notif `payment_success`

---

## 7. Production Checklist

- [ ] KYC Midtrans approved
- [ ] Production server key & client key di-set ke Firebase config
- [ ] `is_production: true`
- [ ] Webhook URL diganti ke production endpoint
- [ ] Snap.js URL diganti ke `app.midtrans.com` (tanpa `sandbox`)
- [ ] Test transaksi nyata dengan kartu pribadi (Rp 1.000 → refund)
- [ ] Setup settlement bank account di dashboard
- [ ] Aktifkan 3DS / OTP untuk credit card
- [ ] Aktifkan fraud detection di dashboard
- [ ] Test dunning flow: set `subscriptions/{uid}.expiry` ke kemarin → tunggu cron 09:00

---

## 8. Pricing & A/B Testing

`public/js/pricing-ab.js` mengassign user ke variant A (Rp 49rb Pro) atau B (Rp 59rb Pro).
Track conversion via Firestore `pricing_experiments/{uid}/events/`.

Untuk evaluasi:
```javascript
// Di Firestore console, group by variant dan hitung event 'payment_success' / 'assigned'
```

---

## 9. Free Trial Logic

- Pertama kali user klik **Upgrade Pro** → otomatis 7-day trial (no charge).
- `subscriptions/{uid}.has_trialed = true` setelah trial pertama.
- Setelah 7 hari → status berubah ke `expired` (atau auto-renew jika user simpan kartu).
- Dunning cron (`dunningManagement`) jalan setiap 09:00 untuk reminder.

---

## 10. Troubleshooting

| Problem | Solution |
|---------|----------|
| `midtrans-client not installed` | `cd functions && npm install` |
| Signature mismatch di webhook | Pastikan `server_key` di config = di Midtrans dashboard |
| Snap modal tidak muncul | Cek `client-key` di `<script src=".../snap.js" data-client-key="...">` |
| CORS error | Cloud Function sudah set `Access-Control-Allow-Origin: *` |
| Trial tidak aktif | Cek `subscriptions/{uid}.has_trialed` di Firestore |
| Push tidak terkirim setelah pembayaran | Cek `users/{uid}/fcm_tokens/` ada / tidak |

---

## 11. Referensi

- Midtrans Snap API: https://docs.midtrans.com/reference/snap-api
- Midtrans Notification: https://docs.midtrans.com/reference/notification-handling
- Sandbox test cards: https://docs.midtrans.com/reference/sandbox-test
- Firebase Functions config: https://firebase.google.com/docs/functions/config-env
