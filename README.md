## FireGuard Control Dashboard

FireGuard Control is a web dashboard for monitoring an ESP32‑based fire detection system in real time using Firebase Realtime Database. It visualizes temperature, humidity, gas level, flame sensor status, and alarm state with a modern, responsive UI and light/dark themes.

### Features

- Live telemetry from an ESP32 device via Firebase Realtime Database
- Temperature, humidity, gas and flame sensor cards with status messages
- Alarm state indicator with visual emphasis when active
- Device connectivity panel showing online/offline and last ping time
- History Timeline showing the most recent readings (newest first)
- Light/dark theme toggle
- Works well on desktop and mobile screens

### Prerequisites

- Node.js and npm installed
- A Firebase project with Realtime Database enabled
- An ESP32 (or similar device) publishing readings to Firebase

### Getting Started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Configure Firebase:

   - Open `src/firebase.js`.
   - Replace the `firebaseConfig` object with your own Firebase project credentials if needed.

3. Start the development server:

   ```bash
   npm start
   ```

   The app runs by default at `http://localhost:3000`.

### Data Structure

The dashboard expects readings under a device path similar to:

```text
/devices/esp32_1
```

Each data object is expected to contain fields such as:

- `temperature` (number, °C)
- `humidity` (number, %)
- `gas` (number, analog value)
- `flame` (number, e.g. `0` or `1`)
- `alarm` (boolean)
- `timestamp` (number, seconds since Unix epoch)

Adjust the `devicePath` constant in `src/App.js` if your database path is different.

### Build for Production

To create an optimized production build:

```bash
npm run build
```

The compiled app will be output to the `build` directory.

### Project Structure

- `src/App.js` – main React application and dashboard layout
- `src/App.css` – styling for the dashboard
- `src/firebase.js` – Firebase initialization and Realtime Database export
- `src/index.js` – React entry point
- `public/index.html` – HTML template

### Notes

- The alarm sound file is expected at `public/alarm.mp3`.
- Make sure your browser allows notifications if you want to receive alarm notifications.
