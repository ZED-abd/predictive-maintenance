from django.contrib import admin
from .models import Alert, SensorReading

@admin.register(SensorReading)
class SensorReadingAdmin(admin.ModelAdmin):
    list_display = ("machine_id", "timestamp", "vibration", "temp", "current", "is_anomaly")
    list_filter = ("machine_id", "is_anomaly")


@admin.register(Alert)
class AlertAdmin(admin.ModelAdmin):
    list_display = ("machine_id", "timestamp", "score")
    list_filter = ("machine_id",)
