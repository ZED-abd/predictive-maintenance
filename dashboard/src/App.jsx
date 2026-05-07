import { useEffect, useMemo, useState } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";
const WS_URL =
  import.meta.env.VITE_WS_URL ||
  `${API.replace("/api", "").replace("http://", "ws://").replace("https://", "wss://")}/ws/telemetry/`;
const MACHINE_ID = "machine_01";

function App() {
  const [readings, setReadings] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [status, setStatus] = useState("NORMAL");
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    let socket;
    let retryTimer;

    const loadInitialData = async () => {
      const [readingsRes, alertsRes] = await Promise.all([
        fetch(`${API}/readings/?machine=${MACHINE_ID}&limit=100`),
        fetch(`${API}/alerts/?limit=10`),
      ]);
      const [readingsData, alertsData] = await Promise.all([readingsRes.json(), alertsRes.json()]);
      const sortedReadings = [...readingsData].reverse();
      setReadings(sortedReadings);
      setAlerts(alertsData);
      if (sortedReadings.length > 0) {
        setStatus(sortedReadings[sortedReadings.length - 1].is_anomaly ? "ANOMALY" : "NORMAL");
      }
    };

    const connectSocket = () => {
      socket = new WebSocket(WS_URL);
      socket.onopen = () => setConnected(true);
      socket.onclose = () => {
        setConnected(false);
        retryTimer = setTimeout(connectSocket, 2000);
      };
      socket.onmessage = async (event) => {
        const live = JSON.parse(event.data);
        if (live.machine_id !== MACHINE_ID) return;

        setReadings((prev) => {
          const next = [...prev, live];
          return next.slice(-100);
        });
        setStatus(live.is_anomaly ? "ANOMALY" : "NORMAL");

        if (live.is_anomaly) {
          const response = await fetch(`${API}/alerts/?limit=10`);
          const latestAlerts = await response.json();
          setAlerts(latestAlerts);
        }
      };
    };

    loadInitialData();
    connectSocket();

    return () => {
      if (socket) socket.close();
      if (retryTimer) clearTimeout(retryTimer);
    };
  }, []);

  const chartData = useMemo(
    () =>
      readings.map((reading) => ({
        time: new Date(reading.timestamp).toLocaleTimeString(),
        vibration: Number(reading.vibration),
        temperature: Number(reading.temp),
        current: Number(reading.current),
      })),
    [readings]
  );

  const statusIsAnomaly = status === "ANOMALY";

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="mx-auto max-w-7xl p-6">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Predictive Maintenance</h1>
            <p className="text-sm text-slate-600">Real-time telemetry for {MACHINE_ID}</p>
          </div>
          <div className="flex items-center gap-3">
            <span
              className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                connected ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
              }`}
            >
              {connected ? "WebSocket Connected" : "Reconnecting..."}
            </span>
          </div>
        </div>

        <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-4">
          <div className="rounded-xl bg-white p-5 shadow-sm lg:col-span-1">
            <p className="text-sm text-slate-500">Machine status</p>
            <p
              className={`mt-2 text-2xl font-bold ${
                statusIsAnomaly ? "text-red-600" : "text-emerald-600"
              }`}
            >
              {status}
            </p>
            <p className="mt-3 text-xs text-slate-500">
              Auto-updated from live MQTT stream via backend WebSocket.
            </p>
          </div>

          <div className="rounded-xl bg-white p-4 shadow-sm lg:col-span-3">
            <h2 className="mb-3 text-lg font-semibold">Sensor Trends</h2>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="vibration" stroke="#2563eb" dot={false} />
                  <Line type="monotone" dataKey="temperature" stroke="#f97316" dot={false} />
                  <Line type="monotone" dataKey="current" stroke="#16a34a" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Latest 10 Alerts</h2>
            <span className="text-xs text-slate-500">{alerts.length} items</span>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-3 py-2 text-left font-semibold">Timestamp</th>
                  <th className="px-3 py-2 text-left font-semibold">Machine</th>
                  <th className="px-3 py-2 text-left font-semibold">Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {alerts.map((alert) => (
                  <tr key={alert.id}>
                    <td className="px-3 py-2">{new Date(alert.timestamp).toLocaleString()}</td>
                    <td className="px-3 py-2">{alert.machine_id}</td>
                    <td className="px-3 py-2 text-red-600">{alert.reason}</td>
                  </tr>
                ))}
                {alerts.length === 0 && (
                  <tr>
                    <td className="px-3 py-3 text-slate-500" colSpan={3}>
                      No anomalies detected yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
