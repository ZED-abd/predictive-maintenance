# ML Anomaly Detection

This module trains an Isolation Forest model on telemetry features
(temperature, vibration, pressure) and exports it for integration.

## Usage

```bash
pip install -r requirements.txt
python train.py
python infer.py --temperature 75 --vibration 2.8 --pressure 110
```
