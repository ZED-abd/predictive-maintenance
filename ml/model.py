import os
import smtplib
from datetime import datetime, timezone
from email.message import EmailMessage
from pathlib import Path
from typing import Any, Dict

import joblib
import numpy as np
from sklearn.ensemble import IsolationForest

MODEL_PATH = Path(__file__).resolve().parent / "model.pkl"
_MODEL = None


def _generate_normal_data(n_samples: int = 5000) -> np.ndarray:
    rng = np.random.default_rng(42)
    vibration = np.clip(rng.normal(1.0, 0.25, n_samples), 0.1, 2.0)
    temperature = np.clip(rng.normal(55.0, 10.0, n_samples), 20.0, 90.0)
    current = np.clip(rng.normal(7.5, 2.0, n_samples), 0.0, 15.0)
    return np.column_stack([vibration, temperature, current])


def train_model() -> IsolationForest:
    model = IsolationForest(contamination=0.02, random_state=42)
    model.fit(_generate_normal_data())
    MODEL_PATH.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump(model, MODEL_PATH)
    return model


def _load_model() -> IsolationForest:
    global _MODEL
    if _MODEL is None:
        if MODEL_PATH.exists():
            _MODEL = joblib.load(MODEL_PATH)
        else:
            _MODEL = train_model()
    return _MODEL


def _smtp_send_alert(subject: str, body: str) -> bool:
    host = os.getenv("SMTP_HOST")
    port = int(os.getenv("SMTP_PORT", "587"))
    username = os.getenv("SMTP_USERNAME")
    password = os.getenv("SMTP_PASSWORD")
    sender = os.getenv("ALERT_FROM_EMAIL", username or "alerts@predictive.local")
    recipient = os.getenv("ALERT_TO_EMAIL")
    if not host or not recipient:
        return False

    message = EmailMessage()
    message["Subject"] = subject
    message["From"] = sender
    message["To"] = recipient
    message.set_content(body)

    try:
        with smtplib.SMTP(host, port, timeout=15) as smtp:
            smtp.starttls()
            if username and password:
                smtp.login(username, password)
            smtp.send_message(message)
        return True
    except Exception:
        return False


def _save_alert_to_db(machine_id: str, vibration: float, temperature: float, current: float, score: float, reason: str) -> bool:
    try:
        import django
        from django.apps import apps

        if not apps.ready:
            os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
            django.setup()

        Alert = apps.get_model("telemetry", "Alert")
        Alert.objects.create(
            machine_id=machine_id,
            timestamp=datetime.now(timezone.utc),
            vibration=vibration,
            temperature=temperature,
            current=current,
            score=score,
            reason=reason,
        )
        return True
    except Exception:
        return False


def detect_anomaly(
    vibration: float, temperature: float, current: float, machine_id: str = "machine_01"
) -> Dict[str, Any]:
    model = _load_model()
    sample = np.array([[vibration, temperature, current]], dtype=float)
    prediction = model.predict(sample)[0]
    score = float(-model.score_samples(sample)[0])
    is_anomaly = prediction == -1

    reason = "Reading is within expected operating range."
    if is_anomaly:
        reason = "Isolation Forest flagged this reading as anomalous."
        db_saved = _save_alert_to_db(machine_id, vibration, temperature, current, score, reason)
        mail_sent = _smtp_send_alert(
            subject=f"[ALERT] Anomaly detected for {machine_id}",
            body=(
                f"machine_id={machine_id}\n"
                f"timestamp={datetime.now(timezone.utc).isoformat()}\n"
                f"vibration={vibration}\n"
                f"temperature={temperature}\n"
                f"current={current}\n"
                f"score={score:.4f}\n"
                f"reason={reason}\n"
            ),
        )
        if db_saved and mail_sent:
            reason = f"{reason} Alert saved to DB and email sent."
        elif db_saved:
            reason = f"{reason} Alert saved to DB, email not sent."
        elif mail_sent:
            reason = f"{reason} Email sent, DB save failed."
        else:
            reason = f"{reason} DB save and email send both failed."

    return {"is_anomaly": is_anomaly, "score": score, "reason": reason}


if __name__ == "__main__":
    train_model()
    print(f"Model saved at {MODEL_PATH}")
