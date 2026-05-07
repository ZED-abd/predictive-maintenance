import json
import os
import random
import time
from datetime import datetime, timezone

import paho.mqtt.client as mqtt

BROKER = os.getenv("MQTT_BROKER", "localhost")
PORT = int(os.getenv("MQTT_PORT", "1883"))
TOPIC = os.getenv("MQTT_TOPIC", "sensors/machine_01")
PUBLISH_INTERVAL_SECONDS = 2
MACHINE_ID = "machine_01"


def generate_reading(reading_count: int) -> dict:
    vibration = round(random.uniform(0.1, 2.0), 3)
    temperature = round(random.uniform(20.0, 90.0), 2)
    current = round(random.uniform(0.0, 15.0), 2)

    # Inject an anomaly spike every 50th reading by tripling one metric.
    if reading_count % 50 == 0:
        metric = random.choice(["vibration", "temperature", "current"])
        if metric == "vibration":
            vibration = round(vibration * 3, 3)
        elif metric == "temperature":
            temperature = round(temperature * 3, 2)
        else:
            current = round(current * 3, 2)

    return {
        "machine_id": MACHINE_ID,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "vibration": vibration,
        "temperature": temperature,
        "current": current,
    }


def main() -> None:
    client = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2)
    client.connect(BROKER, PORT, 60)

    print(f"Publishing sensor telemetry to {BROKER}:{PORT} on topic {TOPIC}")
    reading_count = 0
    while True:
        reading_count += 1
        payload = generate_reading(reading_count)
        client.publish(TOPIC, json.dumps(payload))
        print(payload)
        time.sleep(PUBLISH_INTERVAL_SECONDS)


if __name__ == "__main__":
    main()
