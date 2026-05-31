/* =============================================================================
 *  AERVINEX — Web Bluetooth Pairing Client
 *  -----------------------------------------------------------------------------
 *  Pairs the web app with an AERVINEX ESP32 sensor over Web Bluetooth GATT and
 *  streams telemetry (PPG / Env / Battery) into Firestore.
 *
 *  Firmware GATT (see firmware/aervinex-sensor/aervinex-sensor.ino):
 *    - Custom service : 6e400001-b5a3-f393-e0a9-e50e24dcca9e
 *        6e400002-...   Telemetry JSON   (NOTIFY)   aggregate payload
 *        6e400003-...   Command sink     (WRITE)    host -> device
 *        6e400004-...   Battery percent  (NOTIFY)
 *    - Standard 0x180D Heart Rate         (NOTIFY 0x2A37)
 *    - Standard 0x181A Environmental      (NOTIFY 0x2A6E / 0x2A6F / 0x2A6D)
 *
 *  Firestore writes:
 *    - sensor_data/{uid}/realtime/current  (latest snapshot, onSnapshot target)
 *    - sensor_data/{uid}/stream/{ts}       (append-only window)
 *    - paired_devices/{deviceId}           (per-user fleet record)
 *
 *  Browser support:
 *    - Chrome / Edge (desktop + Android)   : full Web Bluetooth
 *    - iOS Safari                          : NOT supported (use Bluefy fallback)
 *    - Firefox                             : behind flag (not recommended)
 *  See docs/firmware-ota-flow.md for the OTA / native-bridge fallback matrix.
 * =============================================================================
 */
(function (global) {
  'use strict';

  const SVC_AERVINEX   = '6e400001-b5a3-f393-e0a9-e50e24dcca9e';
  const CHR_TELEMETRY  = '6e400002-b5a3-f393-e0a9-e50e24dcca9e';
  const CHR_COMMAND    = '6e400003-b5a3-f393-e0a9-e50e24dcca9e';
  const CHR_BATTERY    = '6e400004-b5a3-f393-e0a9-e50e24dcca9e';

  // Standard SIG services (optional secondary subscriptions)
  const SVC_HEART_RATE = 0x180d;
  const CHR_HR_MEAS    = 0x2a37;
  const SVC_ENV        = 0x181a;
  const CHR_ENV_TEMP   = 0x2a6e;
  const CHR_ENV_HUMID  = 0x2a6f;

  const RECONNECT_BACKOFF_MS = [1000, 2000, 4000, 8000, 15000, 30000];
  const STREAM_FLUSH_MS = 5000;

  const state = {
    device: null,
    server: null,
    aervSvc: null,
    telemetryChar: null,
    batteryChar: null,
    commandChar: null,
    reconnectAttempt: 0,
    reconnectTimer: null,
    listeners: new Set(),
    lastPayload: null,
    streamBuffer: [],
    streamTimer: null,
    isSupported: typeof navigator !== 'undefined'
      && !!(navigator.bluetooth && navigator.bluetooth.requestDevice),
  };

  // ---------- Helpers ----------
  const decoder = new TextDecoder('utf-8');

  function log(...args) {
    if (global.AERVINEX_DEBUG) console.log('[ble]', ...args);
  }
  function emit(event, payload) {
    state.listeners.forEach((fn) => {
      try { fn(event, payload); } catch (e) { console.warn('listener err', e); }
    });
  }
  function uid() {
    return (global.auth && global.auth.currentUser && global.auth.currentUser.uid) || null;
  }
  function db() { return global.db || null; }

  function parseTelemetry(dataView) {
    try {
      const txt = decoder.decode(dataView);
      return JSON.parse(txt);
    } catch (e) {
      log('telemetry parse failed', e);
      return null;
    }
  }

  // ---------- Firestore sinks ----------
  function writeRealtime(payload) {
    const u = uid(); if (!u || !db() || !payload) return;
    const enriched = {
      ...payload,
      uid: u,
      deviceId: state.device ? (state.device.id || state.device.name || 'unknown') : 'unknown',
      receivedAt: firebase.firestore.FieldValue.serverTimestamp(),
    };
    db().collection('sensor_data').doc(u).collection('realtime').doc('current')
      .set(enriched, { merge: true })
      .catch((e) => console.warn('[ble] realtime write failed', e));
  }

  function bufferStream(payload) {
    if (!payload) return;
    state.streamBuffer.push({
      ...payload,
      capturedAt: Date.now(),
    });
    if (state.streamBuffer.length > 100) {
      // Drop oldest to bound memory if Firestore is offline
      state.streamBuffer.splice(0, state.streamBuffer.length - 100);
    }
  }

  async function flushStream() {
    const u = uid(); if (!u || !db()) return;
    if (state.streamBuffer.length === 0) return;
    const batch = db().batch();
    const colRef = db().collection('sensor_data').doc(u).collection('stream');
    const items = state.streamBuffer.splice(0);
    items.forEach((item) => {
      const docRef = colRef.doc(String(item.capturedAt));
      batch.set(docRef, {
        ...item,
        uid: u,
        deviceId: state.device ? state.device.id || state.device.name : 'unknown',
        capturedAt: firebase.firestore.Timestamp.fromMillis(item.capturedAt),
      });
    });
    try {
      await batch.commit();
      log('flushed', items.length, 'stream rows');
    } catch (e) {
      console.warn('[ble] stream flush failed — restoring buffer', e);
      state.streamBuffer.unshift(...items);
    }
  }

  function ensureStreamFlusher() {
    if (state.streamTimer) return;
    state.streamTimer = setInterval(flushStream, STREAM_FLUSH_MS);
  }

  // ---------- Device registry ----------
  async function registerPairedDevice() {
    const u = uid(); if (!u || !db() || !state.device) return;
    const deviceId = state.device.id || state.device.name || 'aervinex-sensor';
    try {
      await db().collection('paired_devices').doc(deviceId).set({
        uid: u,
        deviceId,
        name: state.device.name || 'AERVINEX Sensor',
        mac: state.device.id || null,
        pairedAt: firebase.firestore.FieldValue.serverTimestamp(),
        last_seen: firebase.firestore.FieldValue.serverTimestamp(),
        battery: state.lastPayload?.batt ?? null,
        firmware_version: state.lastPayload?.fw ?? null,
        gatt_endpoint: SVC_AERVINEX,
      }, { merge: true });
      // Also mirror into user-scoped subcollection for fleet UI joins
      await db().collection('users').doc(u).collection('paired_devices').doc(deviceId).set({
        deviceId,
        name: state.device.name || 'AERVINEX Sensor',
        last_seen: firebase.firestore.FieldValue.serverTimestamp(),
        battery: state.lastPayload?.batt ?? null,
        firmware_version: state.lastPayload?.fw ?? null,
      }, { merge: true });
    } catch (e) {
      console.warn('[ble] paired_devices register failed', e);
    }
  }

  async function touchPairedDevice(extra) {
    const u = uid(); if (!u || !db() || !state.device) return;
    const deviceId = state.device.id || state.device.name || 'aervinex-sensor';
    try {
      await db().collection('paired_devices').doc(deviceId).set({
        last_seen: firebase.firestore.FieldValue.serverTimestamp(),
        ...(extra || {}),
      }, { merge: true });
    } catch (e) { /* swallow — touch is best-effort */ }
  }

  // ---------- Notification handlers ----------
  function onTelemetryNotify(evt) {
    const payload = parseTelemetry(evt.target.value);
    if (!payload) return;
    state.lastPayload = payload;
    writeRealtime(payload);
    bufferStream(payload);
    emit('telemetry', payload);
  }

  function onBatteryNotify(evt) {
    // Firmware sends battery percent as single uint8
    const v = evt.target.value;
    const pct = v.byteLength >= 1 ? v.getUint8(0) : null;
    if (pct == null) return;
    emit('battery', { percent: pct });
    touchPairedDevice({ battery: pct });
  }

  function onHrNotify(evt) {
    // 0x2A37 — first byte = flags; if bit0=0 → uint8, else uint16 LE
    const v = evt.target.value;
    if (v.byteLength < 2) return;
    const flags = v.getUint8(0);
    const hr = (flags & 0x01) ? v.getUint16(1, true) : v.getUint8(1);
    emit('hr', { hr });
  }

  // ---------- Connection lifecycle ----------
  async function attachCharacteristics() {
    state.aervSvc = await state.server.getPrimaryService(SVC_AERVINEX);
    state.telemetryChar = await state.aervSvc.getCharacteristic(CHR_TELEMETRY);
    await state.telemetryChar.startNotifications();
    state.telemetryChar.addEventListener('characteristicvaluechanged', onTelemetryNotify);

    try {
      state.batteryChar = await state.aervSvc.getCharacteristic(CHR_BATTERY);
      await state.batteryChar.startNotifications();
      state.batteryChar.addEventListener('characteristicvaluechanged', onBatteryNotify);
    } catch (e) { log('battery char optional — skipped', e?.message); }

    try {
      state.commandChar = await state.aervSvc.getCharacteristic(CHR_COMMAND);
    } catch (e) { log('command char optional — skipped'); }

    // Optional secondary services (HR / Env) — non-fatal
    try {
      const hrSvc = await state.server.getPrimaryService(SVC_HEART_RATE);
      const hrChr = await hrSvc.getCharacteristic(CHR_HR_MEAS);
      await hrChr.startNotifications();
      hrChr.addEventListener('characteristicvaluechanged', onHrNotify);
    } catch (e) { log('HR service skipped'); }
  }

  function bindDisconnectHandler() {
    state.device.addEventListener('gattserverdisconnected', () => {
      emit('status', { connected: false, reason: 'gatt_disconnected' });
      scheduleReconnect();
    });
  }

  async function connectExisting() {
    if (!state.device) throw new Error('no device');
    emit('status', { connected: false, reason: 'connecting' });
    state.server = await state.device.gatt.connect();
    await attachCharacteristics();
    state.reconnectAttempt = 0;
    emit('status', { connected: true });
    ensureStreamFlusher();
    registerPairedDevice();
  }

  function scheduleReconnect() {
    if (!state.device) return;
    if (state.reconnectTimer) clearTimeout(state.reconnectTimer);
    const delay = RECONNECT_BACKOFF_MS[Math.min(state.reconnectAttempt, RECONNECT_BACKOFF_MS.length - 1)];
    state.reconnectAttempt += 1;
    log('reconnect in', delay, 'ms (attempt', state.reconnectAttempt, ')');
    state.reconnectTimer = setTimeout(() => {
      connectExisting().catch((e) => {
        log('reconnect failed', e?.message);
        if (state.reconnectAttempt < 10) scheduleReconnect();
        else emit('status', { connected: false, reason: 'reconnect_giveup' });
      });
    }, delay);
  }

  // ---------- Public API ----------
  async function pair() {
    if (!state.isSupported) {
      throw new Error('Web Bluetooth tidak tersedia di browser ini. Gunakan Chrome di Android/Desktop.');
    }
    emit('status', { connected: false, reason: 'requesting' });
    const device = await navigator.bluetooth.requestDevice({
      filters: [
        { services: [SVC_AERVINEX] },
        { namePrefix: 'AERVINEX' },
      ],
      optionalServices: [SVC_AERVINEX, SVC_HEART_RATE, SVC_ENV],
    });
    state.device = device;
    bindDisconnectHandler();
    await connectExisting();
    return {
      id: device.id,
      name: device.name,
    };
  }

  async function disconnect() {
    if (state.reconnectTimer) { clearTimeout(state.reconnectTimer); state.reconnectTimer = null; }
    if (state.streamTimer)   { clearInterval(state.streamTimer); state.streamTimer = null; }
    try { await flushStream(); } catch (e) {}
    if (state.device && state.device.gatt && state.device.gatt.connected) {
      state.device.gatt.disconnect();
    }
    state.device = null; state.server = null;
    emit('status', { connected: false, reason: 'manual_disconnect' });
  }

  async function sendCommand(cmd) {
    if (!state.commandChar) throw new Error('command channel unavailable');
    const encoder = new TextEncoder();
    const body = typeof cmd === 'string' ? cmd : JSON.stringify(cmd);
    await state.commandChar.writeValueWithResponse(encoder.encode(body));
    return true;
  }

  function isConnected() {
    return !!(state.device && state.device.gatt && state.device.gatt.connected);
  }

  function on(fn) {
    state.listeners.add(fn);
    return () => state.listeners.delete(fn);
  }

  function getLastPayload() { return state.lastPayload; }
  function isSupported()   { return state.isSupported; }

  // List user's paired devices (Firestore)
  async function listPairedDevices() {
    const u = uid(); if (!u || !db()) return [];
    try {
      const snap = await db().collection('users').doc(u).collection('paired_devices')
        .orderBy('last_seen', 'desc').limit(20).get();
      return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    } catch (e) {
      console.warn('[ble] listPaired failed', e);
      return [];
    }
  }

  async function unpairDevice(deviceId) {
    const u = uid(); if (!u || !db() || !deviceId) return false;
    try {
      await db().collection('users').doc(u).collection('paired_devices').doc(deviceId).delete();
      await db().collection('paired_devices').doc(deviceId).delete();
      return true;
    } catch (e) {
      console.warn('[ble] unpair failed', e);
      return false;
    }
  }

  global.AervinexBLE = {
    pair,
    disconnect,
    sendCommand,
    isConnected,
    isSupported,
    on,
    getLastPayload,
    listPairedDevices,
    unpairDevice,
    constants: { SVC_AERVINEX, CHR_TELEMETRY, CHR_COMMAND, CHR_BATTERY },
  };
})(typeof window !== 'undefined' ? window : globalThis);
