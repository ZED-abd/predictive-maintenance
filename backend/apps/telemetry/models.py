from django.db import models


class SensorReading(models.Model):
    machine_id = models.CharField(max_length=64)
    timestamp = models.DateTimeField()
    vibration = models.FloatField()
    temp = models.FloatField()
    current = models.FloatField()
    is_anomaly = models.BooleanField(default=False)

    class Meta:
        ordering = ["-timestamp"]

    def __str__(self):
        return f"{self.machine_id} @ {self.timestamp.isoformat()}"


class Alert(models.Model):
    machine_id = models.CharField(max_length=64)
    timestamp = models.DateTimeField()
    vibration = models.FloatField()
    temperature = models.FloatField()
    current = models.FloatField()
    score = models.FloatField()
    reason = models.TextField()

    class Meta:
        ordering = ["-timestamp"]

    def __str__(self):
        return f"Alert({self.machine_id}, {self.timestamp.isoformat()})"
