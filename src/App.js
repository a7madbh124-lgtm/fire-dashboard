import React, { useEffect, useRef, useState } from "react";
import { db } from "./firebase";
import { ref, onValue } from "firebase/database";
import "./App.css";

function App() {
  const [data, setData] = useState(null);
  const [history, setHistory] = useState([]);
  const [isOnline, setIsOnline] = useState(false);
  const [theme, setTheme] = useState("dark");
  const prevAlarmRef = useRef(false);
  const offlineTimerRef = useRef(null);
  const audioRef = useRef(null);

  const devicePath = "/devices/esp32_1";

  useEffect(() => {
    const deviceRef = ref(db, devicePath);

    const unsubscribe = onValue(deviceRef, (snapshot) => {
      const val = snapshot.val();
      if (val) {
        setIsOnline(true);
        if (offlineTimerRef.current) {
          clearTimeout(offlineTimerRef.current);
        }
        offlineTimerRef.current = setTimeout(() => {
          setIsOnline(false);
        }, 10000);

        const prevAlarm = prevAlarmRef.current;
        const currentAlarm = !!val.alarm;

        setData(val);

        setHistory((prev) => {
          const next = [
            {
              ...val,
              _time: new Date().toISOString(),
            },
            ...prev,
          ];
          return next.slice(0, 20);
        });

        if (!prevAlarm && currentAlarm) {
          if (audioRef.current) {
            audioRef.current
              .play()
              .catch(() => {
              });
          }

          if ("Notification" in window) {
            if (Notification.permission === "granted") {
              new Notification("🔥 FIRE DETECTED! Check the system.", {
                body: "Alarm is active on ESP32 fire detection device.",
              });
            } else if (Notification.permission !== "denied") {
              Notification.requestPermission().then((permission) => {
                if (permission === "granted") {
                  new Notification("🔥 FIRE DETECTED! Check the system.", {
                    body: "Alarm is active on ESP32 fire detection device.",
                  });
                }
              });
            }
          }
        }

        prevAlarmRef.current = currentAlarm;
      } else {
        setData(null);
        setIsOnline(false);
        prevAlarmRef.current = false;
      }
    });

    return () => {
      unsubscribe();
      if (offlineTimerRef.current) {
        clearTimeout(offlineTimerRef.current);
      }
    };
  }, []);

  const formatTimestamp = (ts) => {
    if (!ts) return "--";
    const d = new Date(ts * 1000);
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
    if (!data || typeof data.temperature !== "number") {
      return "Waiting for data...";
    }
    if (data.temperature >= 60) return "Dangerously high temperature!";
    if (data.temperature >= 45) return "High temperature – possible fire risk.";
    if (data.temperature >= 35) return "Warm but within acceptable range.";
    return "Temperature in safe range.";
  };

  const getGasStatus = () => {
    if (!data || typeof data.gas !== "number") {
      return "Analog ADC value (0–4095)";
    }
    if (data.gas > 3000) return "Very high gas reading! Check immediately.";
    if (data.gas > 2000) return "High gas reading – potential leak.";
    if (data.gas > 1000) return "Slightly elevated gas reading.";
    return "Gas level normal.";
  };

  const getFlameStatus = () => {
    if (!data) return "Waiting for data...";
    if (data.flame === 0) {
      return "Sensor reports an active flame in view.";
    }
    if (data.flame === 1) {
      return "Sensor reports the area is clear (no flame).";
    }
    return "Sensor state not recognised.";
  };

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const alarmActive = !!(data && data.alarm);
  const isDeviceOnline =
    isOnline &&
    data &&
    typeof data.timestamp === "number" &&
    Date.now() / 1000 - data.timestamp < 20;

  return (
    <div className={`app theme-${theme} ${alarmActive ? "app-alarm-active" : ""}`}>
      <audio ref={audioRef} src="/alarm.mp3" preload="auto" />

      <header className="app-header">
        <div className="brand">
          <div className="brand-mark">
            <span className="brand-dot" />
          </div>
          <div className="brand-text">
            <h1>FireGuard Control</h1>
            <p>ESP32 Fire Detection • Live Telemetry</p>
          </div>
        </div>

        <div className="header-right">
          <button
            type="button"
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label="Toggle light / dark theme"
          >
            <span className="theme-toggle-icon">
              {theme === "dark" ? "☾" : "☼"}
            </span>
            <span className="theme-toggle-label">
              {theme === "dark" ? "Dark" : "Light"}
            </span>
          </button>
        </div>
      </header>

      <main className="app-main">
        {alarmActive && (
          <div className="alarm-banner alarm-banner-flash">
            <div className="alarm-banner-icon">🔥</div>
            <div className="alarm-banner-content">
              <div className="alarm-banner-title">
                Fire Detected – Alarm Active
              </div>
              <div className="alarm-banner-subtitle">
                Check the environment immediately and follow safety procedures.
              </div>
            </div>
          </div>
        )}

        <div className="layout-grid">
          <section className="primary-grid">
            <div className="card card-temperature">
              <div className="card-header">
                <div className="card-icon card-icon-temperature">
                  <span>🌡</span>
                </div>
                <div className="card-title-group">
                  <h2>Temperature</h2>
                  <p>Ambient thermal conditions</p>
                </div>
              </div>
              <div className="card-body">
                <div className="big-value value-pulse">
                  {data && typeof data.temperature === "number"
                    ? `${data.temperature.toFixed(1)} °C`
                    : "-- °C"}
                </div>
                <div className="sub-text">{getTempStatus()}</div>
              </div>
            </div>

            <div className="card card-humidity">
              <div className="card-header">
                <div className="card-icon card-icon-humidity">
                  <span>💧</span>
                </div>
                <div className="card-title-group">
                  <h2>Humidity</h2>
                  <p>Relative moisture level</p>
                </div>
              </div>
              <div className="card-body">
                <div className="big-value value-pulse">
                  {data && typeof data.humidity === "number"
                    ? `${data.humidity.toFixed(1)} %`
                    : "-- %"}
                </div>
                <div className="sub-text">Continuous humidity monitoring</div>
              </div>
            </div>

            <div className="card card-gas">
              <div className="card-header">
                <div className="card-icon card-icon-gas">
                  <span>🧪</span>
                </div>
                <div className="card-title-group">
                  <h2>Gas Level</h2>
                  <p>Analog gas sensor reading</p>
                </div>
              </div>
              <div className="card-body">
                <div className="big-value value-pulse">
                  {data && typeof data.gas === "number" ? data.gas : "--"}
                </div>
                <div className="sub-text">{getGasStatus()}</div>
              </div>
            </div>

            <div className="card card-flame">
              <div className="card-header">
                <div className="card-icon card-icon-flame">
                  <span>🔥</span>
                </div>
                <div className="card-title-group">
                  <h2>Flame Sensor</h2>
                  <p>Optical flame detection</p>
                </div>
              </div>
              <div className="card-body">
                <div className="big-value value-pulse">
                  {data && data.flame !== undefined
                    ? data.flame === 0
                      ? "Flame detected"
                      : data.flame === 1
                      ? "No flame detected"
                      : "Unknown state"
                    : "--"}
                </div>
                <div className="sub-text">{getFlameStatus()}</div>
              </div>
            </div>

            <div className="card card-alarm">
              <div className="card-header">
                <div className="card-icon card-icon-alarm">
                  <span>🚨</span>
                </div>
                <div className="card-title-group">
                  <h2>Alarm Status</h2>
                  <p>System safety state</p>
                </div>
              </div>
              <div className="card-body">
                <div className={`big-value alarm-value ${getAlarmClass()}`}>
                  {getAlarmText()}
                </div>
                <div className="sub-text">
                  Monitoring fire, gas, and temperature thresholds.
                </div>
                <div className="timestamp">
                  Last update:{" "}
                  {data && data.timestamp
                    ? formatTimestamp(data.timestamp)
                    : "--"}
                </div>
              </div>
            </div>
          </section>

          <aside className="sidebar">
            <div className="card card-device">
              <div className="card-header">
                <div className="card-icon card-icon-device">
                  <span>📡</span>
                </div>
                <div className="card-title-group">
                  <h2>Device Status</h2>
                  <p>ESP32 connectivity &amp; health</p>
                </div>
              </div>
              <div className="card-body device-body">
                <div className="device-status-row">
                  <div
                    className={
                      "status-chip " +
                      (isDeviceOnline
                        ? "status-chip-online"
                        : "status-chip-offline")
                    }
                  >
                    <span className="status-chip-dot" />
                    <span>{isDeviceOnline ? "Online" : "Offline"}</span>
                  </div>
                  <div className="device-meta">
                    {data && data.timestamp
                      ? `Last ping • ${formatTimestamp(data.timestamp)}`
                      : "Waiting for first reading..."}
                  </div>
                </div>
                <div className="device-grid">
                  <div className="device-pill">
                    <span className="device-pill-label">Temperature</span>
                    <span className="device-pill-value">
                      {data && typeof data.temperature === "number"
                        ? `${data.temperature.toFixed(1)} °C`
                        : "-- °C"}
                    </span>
                  </div>
                  <div className="device-pill">
                    <span className="device-pill-label">Humidity</span>
                    <span className="device-pill-value">
                      {data && typeof data.humidity === "number"
                        ? `${data.humidity.toFixed(1)} %`
                        : "-- %"}
                    </span>
                  </div>
                  <div className="device-pill">
                    <span className="device-pill-label">Gas</span>
                    <span className="device-pill-value">
                      {data && typeof data.gas === "number" ? data.gas : "--"}
                    </span>
                  </div>
                  <div className="device-pill">
                    <span className="device-pill-label">Flame</span>
                    <span className="device-pill-value">
                      {data && data.flame !== undefined
                        ? data.flame === 0
                          ? "Detected"
                          : data.flame === 1
                          ? "None"
                          : "Unknown"
                        : "--"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="card card-history">
              <div className="card-header">
                <div className="card-icon card-icon-history">
                  <span>📈</span>
                </div>
                <div className="card-title-group">
                  <h2>History Timeline</h2>
                  <p>Recent readings, newest first</p>
                </div>
              </div>
              <div className="card-body history">
                {history.length === 0 && (
                  <div className="history-empty">
                    <div className="history-empty-title">No data yet</div>
                    <div className="history-empty-subtitle">
                      Waiting for the first reading from your ESP32 device.
                    </div>
                  </div>
                )}

                {history.map((item, index) => (
                  <div className="history-item" key={index}>
                    <div className="history-timeline-marker" />
                    <div className="history-content">
                      <div className="history-main">
                        <span className="history-reading">
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
                          {item.flame === 0
                            ? "Detected"
                            : item.flame === 1
                            ? "None"
                            : "--"}{" "}
                          • Alarm:{" "}
                          {item.alarm ? "YES" : "NO"}
                        </span>
                      </div>
                      <div className="history-meta history-time">
                        {item.timestamp ? formatTimestamp(item.timestamp) : "--"}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </main>

      <footer className="app-footer">
        <span>Fire Detection System</span>
        <span className="footer-separator">•</span>
        <span>ESP32 + Firebase Realtime Database</span>
      </footer>
    </div>
  );
}

export default App;
