from __future__ import annotations

import time
from datetime import datetime, timezone

import numpy as np
import pandas as pd
import streamlit as st
from sklearn.ensemble import IsolationForest


MODEL_PATH = "model.pkl"
MACHINE_ID = "machine_01"


@st.cache_resource
def train_or_load_model() -> IsolationForest:
    # Train on normal operating behavior.
    rng = np.random.default_rng(42)
    n = 5000
    vibration = np.clip(rng.normal(1.0, 0.25, n), 0.1, 2.0)
    temperature = np.clip(rng.normal(55.0, 10.0, n), 20.0, 90.0)
    current = np.clip(rng.normal(7.5, 2.0, n), 0.0, 15.0)
    X = np.column_stack([vibration, temperature, current])

    model = IsolationForest(contamination=0.02, random_state=42)
    model.fit(X)

    try:
        import joblib

        joblib.dump(model, MODEL_PATH)
    except Exception:
        # Optional persistence; app still works if writing fails.
        pass
    return model


def detect_anomaly(model: IsolationForest, vibration: float, temperature: float, current: float) -> dict:
    sample = np.array([[vibration, temperature, current]], dtype=float)
    raw_pred = model.predict(sample)[0]
    score = float(-model.score_samples(sample)[0])
    is_anomaly = raw_pred == -1
    reason = (
        "Isolation Forest detected unusual sensor pattern."
        if is_anomaly
        else "Reading is within expected operating range."
    )
    return {"is_anomaly": is_anomaly, "score": score, "reason": reason}


def simulate_sensor(reading_count: int) -> dict:
    vibration = float(np.round(np.random.uniform(0.1, 2.0), 3))
    temperature = float(np.round(np.random.uniform(20.0, 90.0), 2))
    current = float(np.round(np.random.uniform(0.0, 15.0), 2))

    # Inject random spikes every 50 readings.
    if reading_count % 50 == 0:
        metric = np.random.choice(["vibration", "temperature", "current"])
        if metric == "vibration":
            vibration = float(np.round(vibration * 3, 3))
        elif metric == "temperature":
            temperature = float(np.round(temperature * 3, 2))
        else:
            current = float(np.round(current * 3, 2))

    return {
        "machine_id": MACHINE_ID,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "vibration": vibration,
        "temperature": temperature,
        "current": current,
    }


def init_state() -> None:
    if "readings" not in st.session_state:
        st.session_state.readings = []
    if "alerts" not in st.session_state:
        st.session_state.alerts = []
    if "count" not in st.session_state:
        st.session_state.count = 0


def main() -> None:
    st.set_page_config(page_title="IoT Predictive Maintenance", layout="wide")
    st.title("IoT Predictive Maintenance - Streamlit")
    st.caption("Simulation + ML anomaly detection + dashboard in one file.")

    init_state()
    model = train_or_load_model()

    with st.sidebar:
        st.header("Controls")
        auto_refresh = st.toggle("Live mode (2s refresh)", value=True)
        manual_generate = st.button("Generate one reading", use_container_width=True)
        max_points = st.slider("Max chart points", min_value=50, max_value=500, value=120, step=10)
        if st.button("Reset data", use_container_width=True):
            st.session_state.readings = []
            st.session_state.alerts = []
            st.session_state.count = 0
            st.rerun()

    if auto_refresh or manual_generate or not st.session_state.readings:
        st.session_state.count += 1
        reading = simulate_sensor(st.session_state.count)
        detection = detect_anomaly(
            model,
            reading["vibration"],
            reading["temperature"],
            reading["current"],
        )
        reading["is_anomaly"] = detection["is_anomaly"]
        reading["score"] = detection["score"]
        reading["reason"] = detection["reason"]
        st.session_state.readings.append(reading)

        if reading["is_anomaly"]:
            st.session_state.alerts.insert(
                0,
                {
                    "timestamp": reading["timestamp"],
                    "machine_id": reading["machine_id"],
                    "reason": reading["reason"],
                    "score": round(reading["score"], 4),
                },
            )
            st.session_state.alerts = st.session_state.alerts[:10]

    df = pd.DataFrame(st.session_state.readings).tail(max_points)
    if not df.empty:
        df["timestamp"] = pd.to_datetime(df["timestamp"])
        df = df.sort_values("timestamp")

    latest = st.session_state.readings[-1]
    status = "ANOMALY" if latest["is_anomaly"] else "NORMAL"

    col1, col2, col3, col4 = st.columns(4)
    col1.metric("Machine", MACHINE_ID)
    col2.metric("Status", status)
    col3.metric("Anomaly Score", f'{latest["score"]:.4f}')
    col4.metric("Total Alerts", len(st.session_state.alerts))

    st.subheader("Real-time Sensor Trends")
    if not df.empty:
        chart_df = df.set_index("timestamp")[["vibration", "temperature", "current"]]
        st.line_chart(chart_df, use_container_width=True)

    st.subheader("Last 10 Anomalies")
    if st.session_state.alerts:
        st.dataframe(pd.DataFrame(st.session_state.alerts), use_container_width=True, hide_index=True)
    else:
        st.info("No anomalies detected yet.")

    st.subheader("Latest Reading")
    st.json(latest)

    if auto_refresh:
        time.sleep(2)
        st.rerun()


if __name__ == "__main__":
    main()
