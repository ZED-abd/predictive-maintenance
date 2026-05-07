import json
from datetime import datetime, timezone

import paho.mqtt.client as mqtt
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from django.conf import settings
from django.core.management.base import BaseCommand

from apps.telemetry.models import SensorReading
from apps.telemetry.utils import simple_anomaly_score, is_anomaly

class Command(BaseCommand):
    help = "Run MQTT subscriber and persist sensor readings"

    def handle(self, *args, **options):
        channel_layer = get_channel_layer()

        def on_connect(client, userdata, flags, rc, properties=None):
            self.stdout.write(self.style.SUCCESS(f"Connected to MQTT with code {rc}"))
            client.subscribe(settings.MQTT_TOPIC)

        def on_message(client, userdata, msg):
            try:
                payload = json.loads(msg.payload.decode())
                score = simple_anomaly_score(
                    float(payload["vibration"]),
                    float(payload["temperature"]),
                    float(payload["current"]),
                )
                anomaly = is_anomaly(score)
                timestamp_str = payload.get("timestamp")
                if timestamp_str:
                    timestamp = datetime.fromisoformat(timestamp_str.replace("Z", "+00:00"))
                else:
                    timestamp = datetime.now(timezone.utc)

                reading = SensorReading.objects.create(
                    machine_id=payload["machine_id"],
                    timestamp=timestamp,
                    vibration=payload["vibration"],
                    temp=payload["temperature"],
                    current=payload["current"],
                    is_anomaly=anomaly,
                )

                async_to_sync(channel_layer.group_send)(
                    "telemetry_live",
                    {
                        "type": "telemetry.message",
                        "data": {
                            "id": reading.id,
                            "machine_id": reading.machine_id,
                            "timestamp": reading.timestamp.isoformat(),
                            "vibration": reading.vibration,
                            "temp": reading.temp,
                            "current": reading.current,
                            "is_anomaly": reading.is_anomaly,
                        },
                    },
                )
            except Exception as exc:
                self.stderr.write(f"Failed to process message: {exc}")

        client = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2)
        client.on_connect = on_connect
        client.on_message = on_message
        client.connect(settings.MQTT_BROKER, settings.MQTT_PORT, 60)
        self.stdout.write(self.style.SUCCESS("MQTT subscriber running..."))
        client.loop_forever()
