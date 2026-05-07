import argparse
from pathlib import Path
import joblib
import numpy as np

MODEL_PATH = Path("models/isolation_forest.joblib")

def score(model, temperature, vibration, pressure):
    sample = np.array([[temperature, vibration, pressure]])
    pred = model.predict(sample)[0]
    confidence = -model.score_samples(sample)[0]
    return pred == -1, float(confidence)

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--temperature", type=float, required=True)
    parser.add_argument("--vibration", type=float, required=True)
    parser.add_argument("--pressure", type=float, required=True)
    args = parser.parse_args()

    if not MODEL_PATH.exists():
        raise FileNotFoundError("Run train.py first to generate model.")

    model = joblib.load(MODEL_PATH)
    anomaly, confidence = score(model, args.temperature, args.vibration, args.pressure)
    print({"is_anomaly": anomaly, "score": confidence})
