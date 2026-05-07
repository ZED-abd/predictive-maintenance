from django.urls import path

from .consumers import TelemetryConsumer

websocket_urlpatterns = [
    path("ws/telemetry/", TelemetryConsumer.as_asgi()),
]
