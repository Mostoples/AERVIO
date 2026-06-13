# AERVINEX - BLE + SPA Architecture Plan

## Problem Statement
Current MPA architecture loses BLE connection on page navigation due to full page reload. IoT device must stay connected across all monitoring pages.

## Solution: Hybrid SPA Architecture

### Core Concept
Split app into two zones:
1. **SPA Island** - Real-time monitoring pages (persistent BLE)
2. **Traditional MPA** - Settings/static pages (no BLE needed)

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     AERVINEX Hybrid App                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Entry Points:                                               │
│  ├─ index.html (Landing - MPA)                              │
│  ├─ login.html (Auth - MPA)                                 │
│  └─ app.html (SPA Root - BLE Active) ⟵ Main app entry      │
│                                                              │
│  ┌────────────────────────────────────────────────┐         │
│  │  SPA ISLAND (/app.html)                        │         │
│  │  ┌──────────────────────────────────────────┐ │         │
│  │  │  BLE Service (Singleton)                 │ │         │
│  │  │  - Web Bluetooth API connection          │ │         │
│  │  │  - Real-time data streaming              │ │         │
│  │  │  - Device state management               │ │         │
│  │  └──────────────────────────────────────────┘ │         │
│  │                                                │         │
│  │  Client-Side Routes:                          │         │
│  │  ├─ /dashboard   (Home + live metrics)       │         │
│  │  ├─ /running     (Active session + GPS)      │         │
│  │  ├─ /recovery    (HRV analysis)              │         │
│  │  ├─ /live-data   (Real-time sensor stream)   │         │
│  │  ├─ /history     (Stats with live updates)   │         │
│  │  └─ /alerts      (Real-time notifications)   │         │
│  │                                                │         │
│  │  State Management:                            │         │
│  │  - deviceState (connected, battery, etc)     │         │
│  │  - sensorData (HR, SpO2, PM2.5, etc)         │         │
│  │  - sessionState (running, paused, stopped)   │         │
│  └────────────────────────────────────────────────┘         │
│                                                              │
│  External Links (leave SPA, BLE graceful disconnect):       │
│  ├─ /profile.html (MPA)                                     │
│  ├─ /settings.html (MPA)                                    │
│  ├─ /encyclopedia.html (MPA)                                │
│  └─ /research/* (MPA)                                       │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Implementation Details

### 1. BLE Service (Persistent across SPA routes)

```javascript
// services/bleService.js
class BLEService {
  constructor() {
    this.device = null;
    this.server = null;
    this.characteristics = new Map();
    this.isConnected = false;
    this.listeners = new Set();
  }

  // Connect to AERVINEX device
  async connect() {
    try {
      this.device = await navigator.bluetooth.requestDevice({
        filters: [
          { namePrefix: 'AERVINEX' },
          { services: ['heart_rate', 'environmental_sensing'] }
        ],
        optionalServices: [
          'battery_service',
          'device_information',
          'custom_aervinex_service' // Your custom service UUID
        ]
      });

      this.device.addEventListener('gattserverdisconnected',
        this.onDisconnected.bind(this));

      this.server = await this.device.gatt.connect();
      await this.setupCharacteristics();

      this.isConnected = true;
      this.notifyListeners('connected');

      return true;
    } catch (error) {
      console.error('BLE connection failed:', error);
      throw error;
    }
  }

  // Setup all sensor characteristics
  async setupCharacteristics() {
    // Heart Rate
    const hrService = await this.server.getPrimaryService('heart_rate');
    const hrChar = await hrService.getCharacteristic('heart_rate_measurement');
    await hrChar.startNotifications();
    hrChar.addEventListener('characteristicvaluechanged',
      this.handleHRData.bind(this));

    // Environmental (PM2.5, UV, Heat)
    const envService = await this.server.getPrimaryService('environmental_sensing');
    const pm25Char = await envService.getCharacteristic('pm25_concentration');
    await pm25Char.startNotifications();
    pm25Char.addEventListener('characteristicvaluechanged',
      this.handlePM25Data.bind(this));

    // Add more characteristics as needed
    // SpO2, Temperature, Humidity, etc.
  }

  // Parse and broadcast data
  handleHRData(event) {
    const value = event.target.value;
    const hr = value.getUint8(1); // BLE Heart Rate format
    this.notifyListeners('hr', hr);
  }

  handlePM25Data(event) {
    const value = event.target.value;
    const pm25 = value.getUint16(0, true); // Little-endian
    this.notifyListeners('pm25', pm25);
  }

  // Subscribe to data updates
  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  notifyListeners(type, data) {
    this.listeners.forEach(cb => cb({ type, data }));
  }

  // Graceful disconnect
  async disconnect() {
    if (this.device && this.device.gatt.connected) {
      await this.device.gatt.disconnect();
    }
    this.isConnected = false;
    this.notifyListeners('disconnected');
  }

  onDisconnected() {
    this.isConnected = false;
    this.notifyListeners('disconnected');
    // Optionally: auto-reconnect
    setTimeout(() => this.reconnect(), 2000);
  }
}

// Singleton instance
export const bleService = new BLEService();
```

### 2. React Hook for BLE

```javascript
// hooks/useBLE.js
import { useState, useEffect } from 'react';
import { bleService } from '../services/bleService';

export function useBLE() {
  const [isConnected, setIsConnected] = useState(false);
  const [deviceData, setDeviceData] = useState({
    hr: null,
    spo2: null,
    pm25: null,
    uv: null,
    temp: null,
    battery: null
  });

  useEffect(() => {
    const unsubscribe = bleService.subscribe(({ type, data }) => {
      if (type === 'connected') {
        setIsConnected(true);
      } else if (type === 'disconnected') {
        setIsConnected(false);
      } else {
        setDeviceData(prev => ({ ...prev, [type]: data }));
      }
    });

    return unsubscribe;
  }, []);

  const connect = async () => {
    try {
      await bleService.connect();
    } catch (error) {
      console.error('Connection failed:', error);
    }
  };

  const disconnect = async () => {
    await bleService.disconnect();
  };

  return { isConnected, deviceData, connect, disconnect };
}
```

### 3. App Structure

```javascript
// App.jsx (SPA Root)
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { useBLE } from './hooks/useBLE';
import Dashboard from './components/Dashboard';
import Running from './components/Running';
import Recovery from './components/Recovery';
import LiveData from './components/LiveData';
import History from './components/History';
import Alerts from './components/Alerts';

function App() {
  const { isConnected, deviceData, connect, disconnect } = useBLE();

  // Auto-connect on app load (if previously paired)
  useEffect(() => {
    const lastDevice = localStorage.getItem('aervinex-ble-device');
    if (lastDevice) {
      connect();
    }
  }, []);

  return (
    <BrowserRouter basename="/app">
      <div className="app-shell">
        {/* BLE Status Indicator */}
        <div className="ble-status">
          {isConnected ? (
            <span className="connected">
              🔵 Connected • {deviceData.battery}%
            </span>
          ) : (
            <button onClick={connect}>Connect Device</button>
          )}
        </div>

        {/* SPA Routes */}
        <Routes>
          <Route path="/" element={<Dashboard data={deviceData} />} />
          <Route path="/dashboard" element={<Dashboard data={deviceData} />} />
          <Route path="/running" element={<Running data={deviceData} />} />
          <Route path="/recovery" element={<Recovery data={deviceData} />} />
          <Route path="/live-data" element={<LiveData data={deviceData} />} />
          <Route path="/history" element={<History data={deviceData} />} />
          <Route path="/alerts" element={<Alerts data={deviceData} />} />
        </Routes>

        {/* Bottom Navigation */}
        <nav className="bottom-nav">
          <Link to="/dashboard">Home</Link>
          <Link to="/history">Stats</Link>
          <Link to="/running">Run</Link>
          <Link to="/recovery">Recovery</Link>
          <a href="/profile.html">Profile</a> {/* Exit SPA */}
        </nav>
      </div>
    </BrowserRouter>
  );
}
```

---

## Bundle Size Analysis

### SPA Island Bundle (Lazy Loaded):

```
Entry (app.html):
├─ React + ReactDOM:           130 KB (gzipped)
├─ React Router:                25 KB
├─ BLE Service:                 30 KB
├─ Firebase SDK:               300 KB
├─ Shared Components:           50 KB
├─ State Management:            20 KB
──────────────────────────────────
App Shell Total:               555 KB ✅

Lazy Loaded Routes:
├─ Dashboard.jsx:               80 KB (load on visit)
├─ Running.jsx:                120 KB (load on visit)
├─ Recovery.jsx:                90 KB (load on visit)
├─ LiveData.jsx:                60 KB (load on visit)
├─ History.jsx:                100 KB (load on visit)
├─ Alerts.jsx:                  50 KB (load on visit)
──────────────────────────────────
Routes Total:                  500 KB (loaded progressively)

Grand Total:                  ~1 MB (spread over time) ✅
```

**Comparison:**
- Current MPA (per page): ~300 KB, loses BLE ❌
- SPA Island: ~555 KB initial, maintains BLE ✅
- Worth the tradeoff for persistent connection!

---

## Migration Strategy

### Phase 1: Create SPA Island
1. Create `/public/app.html` as SPA entry point
2. Setup React + Router
3. Implement BLE service
4. Migrate 6 core pages to React components

### Phase 2: Connect IoT Device
1. Test Web Bluetooth connection
2. Parse AERVINEX BLE data packets
3. Real-time data streaming
4. State synchronization

### Phase 3: Optimize
1. Code splitting per route
2. Lazy load components
3. Service Worker for offline
4. Background sync

### Phase 4: Graceful Transitions
1. Handle SPA ↔ MPA navigation
2. BLE disconnect warning on exit
3. Auto-reconnect on return
4. State persistence

---

## User Flow

### Scenario 1: Normal Monitoring Session
```
1. User visits /app/dashboard
2. Click "Connect Device" button
3. BLE pairing dialog → Select AERVINEX device
4. Connection established ✅
5. Real-time data starts flowing
6. Navigate to /app/running → No reload, connection maintained ✅
7. Start running session → Continuous monitoring ✅
8. Navigate to /app/recovery → Still connected ✅
9. Click "Profile" → Warning: "Leaving will disconnect device"
10. User confirms → Navigate to /profile.html (MPA)
11. BLE disconnected gracefully
```

### Scenario 2: Quick Settings Change
```
1. User in /app/running (connected)
2. Need to change profile settings
3. Open settings in modal/drawer (within SPA) ✅
   OR
4. External link warning → "Navigate and reconnect?"
5. User saves state, disconnects, goes to /settings.html
6. After settings, return to /app → Auto-reconnect ✅
```

---

## Benefits

✅ **Persistent BLE Connection**
- No reconnection needed during monitoring
- Seamless real-time data flow
- Better battery life (fewer reconnects)

✅ **Better UX**
- Smooth transitions
- App-like experience
- State preservation
- Loading indicators instead of full refresh

✅ **Real-time Monitoring**
- Continuous HR/SpO2/PM2.5 tracking
- Live alerts
- Uninterrupted running sessions

✅ **Acceptable Bundle Size**
- ~1 MB total (spread over time)
- Only monitoring pages in SPA
- Settings/research stay lightweight

✅ **Progressive Enhancement**
- Works without BLE (fallback to manual input)
- Offline support via Service Worker
- Graceful degradation

---

## Considerations

⚠️ **Development Complexity**
- React/Vue learning curve
- State management
- BLE API handling
- Dual architecture (SPA + MPA)

⚠️ **Browser Support**
- Web Bluetooth only in Chrome/Edge/Opera
- Safari/Firefox need fallback

⚠️ **Testing**
- Need actual BLE device for testing
- BLE simulator for development
- Cross-browser testing

⚠️ **SEO**
- SPA pages need server-side rendering OR
- Pre-render static HTML shells
- Or: Accept that /app/* is not indexed (monitoring pages don't need SEO)

---

## Recommendation

**✅ IMPLEMENT HYBRID SPA**

**Why:**
1. **BLE requirement is critical** - must maintain connection
2. **6 pages in SPA is manageable** - not too heavy
3. **Best of both worlds** - keep 39 pages as MPA
4. **Real-time monitoring needs it** - no workaround
5. **Bundle size acceptable** - ~1 MB for persistent connection worth it

**Next Steps:**
1. Setup React project in `/src`
2. Create BLE service
3. Migrate dashboard.html → Dashboard.jsx
4. Test BLE connection
5. Migrate remaining 5 core pages
6. Polish transitions

---

## Estimated Timeline

- Week 1: Setup + BLE Service (20h)
- Week 2: Migrate 6 pages to React (30h)
- Week 3: Testing + Polish (20h)
- Week 4: Deploy + Monitor (10h)

**Total: ~80 hours for hybrid architecture**

---

## Alternative: Service Worker BLE Proxy (Complex)

*Not recommended - Web Bluetooth API doesn't work in Service Workers yet*

---

**CONCLUSION: Hybrid SPA is the RIGHT choice for BLE integration! 🚀**
