// src/App.js
import React, { useEffect, useState } from "react";
import { db } from "./firebase";
import { ref, onValue } from "firebase/database";
import "./App.css";

function App() {
  const [data, setData] = useState(null);
  const [history, setHistory] = useState([]);
  const [isOnline, setIsOnline] = useState(false);

  // device path in your DB
  const devicePath = "/devices/esp32_1";

  useEffect(() => {
    const deviceRef = ref(db, devicePath);

    const unsubscribe = onValue(deviceRef, (snapshot) => {
      const val = snapshot.val();
      if (val) {
        setData(val);

        // push to history (newest on top, max 30 items)
        setHistory((prev) => {
          const next = [
            {
              ...val,
              _time: new Date().toISOString(),
            },
            ...prev,
          ];
          return next.slice(0, 30);
        });

        // online status: if timestamp is recent (< 10s)
        if (val.timestamp) {
          const now = Date.now();
          const ageMs = now - val.timestamp;
          setIsOnline(ageMs < 10000); // < 10s = online
        } else {
          setIsOnline(false);
        }
      } else {
        setData(null);
        setIsOnline(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const formatTimestamp = (ts) => {
    if (!ts) return "--";
    const d = new Date(ts);
    if (Number.isNaN(d.getTime())) return "--";
    return d.toLocaleString();
  };

  const getAlarmText = () => {
    if (!data) return "--";
    return data.alarm ? "ALARM ACTIVE" : "Normal";
  };

  const getAlarmClass = () => {
    if (!data) return "";
    if (data.alarm) return "alarm-critical";
    return "alarm-ok";
  };

  const getTempStatus = () => {
    if (!data || typeof data.temperature !== "number") return "Waiting for data...";
    if (data.temperature >= 60) return "Dangerously high temperature!";
    if (data.temperature >= 45) return "High temperature – possible fire risk.";
    if (data.temperature >= 35) return "Warm but within acceptable range.";
    return "Temperature in safe range.";
  };

  const getGasStatus = () => {
    if (!data || typeof data.gas !== "number") return "Analog ADC value (0–4095)";
    if (data.gas > 3000) return "Very high gas reading! Check immediately.";
    if (data.gas > 2000) return "High gas reading – potential leak.";
    if (data.gas > 1000) return "Slightly elevated gas reading.";
    return "Gas level normal.";
  };

  const getFlameStatus = () => {
    if (!data) return "Waiting for data...";
    if (data.flame === 0) return "Flame detected (for most sensor modules).";
    if (data.flame === 1) return "No flame detected.";
    return "Unknown sensor state.";
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Fire Detection System – Live Dashboard</h1>

        <div
          className={
            "status-badge " + (isOnline ? "status-online" : "status-offline")
          }
        >
          <span className="status-dot" />
          <span>{isOnline ? "Device Online" : "Device Offline"}</span>
        </div>
      </header>

      <main className="app-main">
        <div className="grid">
          <div className="card">
            <h2>Temperature</h2>
            <div className="big-value">
              {data && typeof data.temperature === "number"
                ? `${data.temperature.toFixed(1)} °C`
                : "-- °C"}
            </div>
            <div className="sub-text">{getTempStatus()}</div>
          </div>

          <div className="card">
            <h2>Humidity</h2>
            <div className="big-value">
              {data && typeof data.humidity === "number"
                ? `${data.humidity.toFixed(1)} %`
                : "-- %"}
            </div>
            <div className="sub-text">Relative humidity</div>
          </div>

          <div className="card">
            <h2>Gas Level</h2>
            <div className="big-value">
              {data && typeof data.gas === "number" ? data.gas : "--"}
            </div>
            <div className="sub-text">{getGasStatus()}</div>
          </div>

          <div className="card">
            <h2>Flame Sensor</h2>
            <div className="big-value">
              {data && data.flame !== undefined ? data.flame : "--"}
            </div>
            <div className="sub-text">{getFlameStatus()}</div>
          </div>

          <div className="card">
            <h2>Alarm Status</h2>
            <div className={`big-value ${getAlarmClass()}`}>
              {getAlarmText()}
            </div>
            <div className="sub-text">
              Monitoring fire, gas, and temperature thresholds
            </div>
            <div className="timestamp">
              Last update:{" "}
              {data && data.timestamp ? formatTimestamp(data.timestamp) : "--"}
            </div>
          </div>
        </div>

        <div className="card">
          <h2>Recent Readings</h2>
          <div className="history">
            {history.length === 0 && (
              <div className="history-item">
                <div className="history-main">
                  <span>No data yet</span>
                  <span className="history-meta">
                    Waiting for first reading from ESP32...
                  </span>
                </div>
              </div>
            )}

            {history.map((item, index) => (
              <div className="history-item" key={index}>
                <div className="history-main">
                  <span>
                    {typeof item.temperature === "number"
                      ? `${item.temperature.toFixed(1)} °C`
                      : "-- °C"}{" "}
                    •{" "}
                    {typeof item.humidity === "number"
                      ? `${item.humidity.toFixed(1)} %`
                      : "-- %"}{" "}
                    • Gas:{" "}
                    {typeof item.gas === "number" ? item.gas : "--"}
                  </span>
                  <span className="history-meta">
                    Flame:{" "}
                    {item.flame !== undefined ? item.flame : "--"} • Alarm:{" "}
                    {item.alarm ? "YES" : "NO"}
                  </span>
                </div>
                <div className="history-meta">
                  {item.timestamp ? formatTimestamp(item.timestamp) : "--"}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <footer className="app-footer">
        Fire Detection System • ESP32 + Firebase Realtime Database
      </footer>
    </div>
  );
}

export default App;
