import json
import os
import random
import time
import paho.mqtt.client as mqtt

BROKER = os.getenv("MQTT_BROKER", "localhost")
PORT = int(os.getenv("MQTT_PORT", "1883"))
TOPIC = os.getenv("MQTT_TOPIC", "sensors/telemetry")
INTERVAL = float(os.getenv("PUBLISH_INTERVAL", "1"))
MACHINES = ["M-101", "M-102", "M-103", "M-104"]

client = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2)
client.connect(BROKER, PORT, 60)

print(f"Publishing fake telemetry to {BROKER}:{PORT} on {TOPIC}")
while True:
    machine = random.choice(MACHINES)
    anomaly_boost = 1 if random.random() < 0.08 else 0
    payload = {
        "machine_id": machine,
        "temperature": round(random.gauss(70 + anomaly_boost * 25, 6), 2),
        "vibration": round(random.gauss(2 + anomaly_boost * 1.6, 0.4), 2),
        "pressure": round(random.gauss(100 + anomaly_boost * 35, 12), 2),
    }
    client.publish(TOPIC, json.dumps(payload))
    print(payload)
    time.sleep(INTERVAL)
