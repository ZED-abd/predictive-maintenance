from django.urls import path
from . import views

urlpatterns = [
    path("readings/", views.readings),
    path("alerts/", views.alerts),
    path("stats/<str:machine_id>", views.machine_stats),
]
