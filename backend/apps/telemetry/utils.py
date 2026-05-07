import math


def simple_anomaly_score(vibration: float, temp: float, current: float) -> float:
    v = (vibration - 1.0) / 0.6
    t = (temp - 55.0) / 18.0
    c = (current - 7.5) / 4.0
    return math.sqrt(v * v + t * t + c * c)


def is_anomaly(score: float) -> bool:
    return score > 3.0
