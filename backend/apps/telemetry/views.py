from django.db.models import Avg, Max, Min
from rest_framework.decorators import api_view
from rest_framework.response import Response

from .models import Alert, SensorReading
from .serializers import AlertSerializer, SensorReadingSerializer

@api_view(["GET"])
def readings(request):
    limit = int(request.GET.get("limit", 100))
    machine_id = request.GET.get("machine")
    qs = SensorReading.objects.all()
    if machine_id:
        qs = qs.filter(machine_id=machine_id)
    qs = qs[:limit]
    return Response(SensorReadingSerializer(qs, many=True).data)

@api_view(["GET"])
def alerts(request):
    limit = int(request.GET.get("limit", 100))
    qs = Alert.objects.all()[:limit]
    return Response(AlertSerializer(qs, many=True).data)

@api_view(["GET"])
def machine_stats(request, machine_id: str):
    qs = SensorReading.objects.filter(machine_id=machine_id)
    total_readings = qs.count()
    total_alerts = qs.filter(is_anomaly=True).count()
    aggregates = qs.aggregate(
        vibration_avg=Avg("vibration"),
        vibration_min=Min("vibration"),
        vibration_max=Max("vibration"),
        temp_avg=Avg("temp"),
        temp_min=Min("temp"),
        temp_max=Max("temp"),
        current_avg=Avg("current"),
        current_min=Min("current"),
        current_max=Max("current"),
    )
    return Response(
        {
            "machine_id": machine_id,
            "total_readings": total_readings,
            "total_alerts": total_alerts,
            "anomaly_rate": (total_alerts / total_readings) if total_readings else 0.0,
            **aggregates,
        }
    )
