# 💡 ESP32 Smart Light WebApp (React + Vite + BLE)

Modern, high-performance Progressive Web Application (PWA) to control the **ESP32 Smart Light Hub** via **Web Bluetooth (BLE)** and **Wi-Fi**.

---

## 🌟 Key Features

1. **Dual Connectivity Modes**:
   - **Bluetooth Low Energy (BLE)**: Connect directly in Google Chrome / Microsoft Edge / Bluefy via the **Web Bluetooth API** with 1 click. No router, internet, or mobile app installation required.
   - **Wi-Fi (Network)**: Connect over home router or ESP32 SoftAP at `http://smartlight.local` or `http://192.168.4.1`.
2. **100% Offline-First Physical Switch**:
   - The hardware push button on **GPIO 13** and relay on **GPIO 5** work instantaneously (< 1ms) from cold boot even if Wi-Fi or Bluetooth are completely disconnected.
3. **Interactive Control Hub**:
   - **Glow Light Visualizer**: Animated light bulb with manual override.
   - **Mode Switcher**: Manual Mode, Auto Schedule (Time-based), and Auto Ambient (LDR-based).
   - **Live LDR Ambient Gauge**: Real-time ambient light sensor bar (0-4095) with interactive threshold slider.
   - **Visual Schedule Planner**: Configure turn-on and turn-off times with presets.

---

## 🚀 Getting Started

### 1. Run Development Server
```bash
npm install
npm run dev
```
Open your browser at `http://localhost:5173`.

### 2. Build for Production / Hosting (Vercel, GitHub Pages, Netlify)
```bash
npm run build
```
The output will be generated in `dist/`. You can host this static folder anywhere (e.g. GitHub Pages or Vercel) and connect to your ESP32 directly via Bluetooth or local Wi-Fi!

---

## 📱 Bluetooth (BLE) Specifications
- **Device Name**: `ESP32-SmartLight`
- **Service UUID**: `4fafc201-1fb5-459e-8fcc-c5c9c331914b`
- **Command Characteristic (Write)**: `beb5483e-36e1-4688-b7f5-ea07361b26a8`
- **Status Characteristic (Notify/Read)**: `beb5483e-36e1-4688-b7f5-ea07361b26a9`

---

## 🔌 Hardware Pinout (ESP32)
- **PIN 5**: Relay (Active HIGH)
- **PIN 13**: Physical Push Button (INPUT_PULLUP)
- **PIN 34**: LDR Ambient Light Sensor (Analog ADC1_CH6)
- **PIN 2**: Onboard Status LED
