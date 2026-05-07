from pathlib import Path
import joblib
import numpy as np
from sklearn.ensemble import IsolationForest

MODEL_PATH = Path("models/isolation_forest.joblib")
MODEL_PATH.parent.mkdir(parents=True, exist_ok=True)

def generate_synthetic_training_data(n=5000):
    rng = np.random.default_rng(42)
    temperature = rng.normal(70, 8, n)
    vibration = rng.normal(2, 0.4, n)
    pressure = rng.normal(100, 10, n)
    return np.column_stack([temperature, vibration, pressure])

if __name__ == "__main__":
    X = generate_synthetic_training_data()
    model = IsolationForest(contamination=0.03, random_state=42)
    model.fit(X)
    joblib.dump(model, MODEL_PATH)
    print(f"Saved model to {MODEL_PATH}")
