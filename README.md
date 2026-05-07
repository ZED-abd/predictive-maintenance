# IoT Predictive Maintenance — Industrie 4.0

Système de **maintenance prédictive en temps réel** basé sur l'IoT.  
Surveillance continue de machines industrielles via capteurs, détection d'anomalies par Machine Learning (Isolation Forest) et alertes automatiques.

---

## Architecture du système

```
┌─────────────────────────────────────────────────┐
│           COUCHE SIMULATEUR (IoT)               │
│  sensor_simulator.py  ──►  publisher.py         │
│  (machine_01, 2s)          (M-101..M-104, 1s)   │
└──────────────────┬──────────────────────────────┘
                   │  MQTT (Paho → Mosquitto :1883)
┌──────────────────▼──────────────────────────────┐
│           BROKER MQTT (Mosquitto)               │
│  Port 1883 (TCP)  |  Port 9001 (WebSockets)     │
└──────────────────┬──────────────────────────────┘
                   │  Subscribe
┌──────────────────▼──────────────────────────────┐
│           BACKEND (Django + Channels)           │
│  run_mqtt_subscriber ──► Isolation Forest       │
│  ──► PostgreSQL (SensorReading, Alert)          │
│  ──► Email SMTP (alertes anomalies)             │
│  REST API + WebSocket push (telemetry_live)     │
└──────────────────┬──────────────────────────────┘
                   │  REST + WebSocket
┌──────────────────▼──────────────────────────────┐
│           DASHBOARD                             │
│  React + Recharts  (dashboard complet)          │
│  OU  Streamlit app.py  (démo standalone)        │
└─────────────────────────────────────────────────┘
```

---

## Capteurs surveillés

| Capteur | Plage normale | Unité |
|---|---|---|
| Vibration | 0.1 – 2.0 | mm/s |
| Température | 20 – 90 | °C |
| Courant | 0 – 15 | A |
| Pression | ~100 | bar (publisher multi-machines) |

Une anomalie est injectée automatiquement toutes les **50 lectures** (spike ×3 sur un capteur aléatoire).

---

## Détection d'anomalies (ML)

- Algorithme : **Isolation Forest** (`scikit-learn`)
- Entraînement : 5 000 échantillons de comportement normal
- Contamination : `2 %`
- Sortie : `is_anomaly` (bool) + `score` (float) + `reason` (texte)
- Modèle persisté dans `model.pkl` (généré au premier lancement)

---

## Alertes automatiques

Lors d'une anomalie détectée :
- 🔴 Statut machine basculé en **ANOMALY** sur le dashboard
- 💾 Enregistrement en base de données (`Alert`)
- 📧 Envoi d'un email SMTP (`ALERT_TO_EMAIL`)
- 📡 Push WebSocket en temps réel vers tous les clients connectés

---

## Structure du projet

```
predictive-maintenance/
├── app.py                          # Démo standalone Streamlit (tout-en-un)
├── model.pkl                       # Modèle ML pré-entraîné
├── requirements.txt                # Dépendances Streamlit (démo)
├── .env.example                    # Variables d'environnement
│
├── simulator/
│   ├── sensor_simulator.py         # Simulateur machine_01 (MQTT, 2s)
│   └── publisher.py                # Simulateur multi-machines (M-101..104)
│
├── ml/
│   ├── model.py                    # Isolation Forest + alertes email/DB
│   ├── train.py                    # Entraînement standalone
│   └── infer.py                    # Inférence CLI (--temperature --vibration --pressure)
│
├── backend/                        # API Django + WebSocket
│   ├── manage.py
│   ├── config/
│   │   ├── settings.py             # Config Django, MQTT, Redis, PostgreSQL
│   │   └── urls.py
│   └── apps/telemetry/
│       ├── models.py               # SensorReading, Alert
│       ├── views.py                # GET /readings/, /alerts/, /stats/<machine>/
│       ├── consumers.py            # WebSocket (Django Channels)
│       ├── serializers.py
│       ├── admin.py
│       └── management/commands/
│           └── run_mqtt_subscriber.py  # Subscriber MQTT → DB → WebSocket
│
├── dashboard/                      # Frontend React
│   └── src/
│       ├── App.jsx                 # Dashboard temps réel (Recharts + WebSocket)
│       └── styles.css
│
└── mosquitto/
    └── mosquitto.conf              # Broker MQTT (port 1883 + 9001 WebSocket)
```

---

## Lancement rapide — Démo Streamlit (tout-en-un)

```bash
pip install -r requirements.txt
streamlit run app.py
```

L'application simule les capteurs, détecte les anomalies et affiche le dashboard, **sans dépendance externe**.

---

## Lancement complet — Stack complète

### 1. Variables d'environnement

```bash
cp .env.example .env
# Éditer .env avec vos paramètres (DB, SMTP, MQTT...)
```

### 2. Broker MQTT (Mosquitto)

```bash
mosquitto -c mosquitto/mosquitto.conf
```

### 3. Backend Django

```bash
cd backend
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver                   # API REST + WebSocket
python manage.py run_mqtt_subscriber        # Subscriber MQTT (dans un 2e terminal)
```

### 4. Simulateur de capteurs

```bash
cd simulator
pip install -r requirements.txt
python sensor_simulator.py                  # machine_01
# ou
python publisher.py                         # M-101 à M-104
```

### 5. Dashboard React

```bash
cd dashboard
npm install
npm run dev                                 # http://localhost:5173
```

### 6. Entraînement ML (optionnel)

```bash
cd ml
python train.py                             # Génère models/isolation_forest.joblib
python infer.py --temperature 85 --vibration 5.2 --pressure 145
```

---

## API REST (backend)

| Méthode | Endpoint | Description |
|---|---|---|
| GET | `/api/readings/` | Lectures capteurs (param: `machine`, `limit`) |
| GET | `/api/alerts/` | Alertes anomalies (param: `limit`) |
| GET | `/api/stats/<machine_id>/` | Statistiques agrégées par machine |

**WebSocket** : `ws://localhost:8000/ws/telemetry/`

---

## Variables d'environnement

| Variable | Défaut | Description |
|---|---|---|
| `DJANGO_SECRET_KEY` | `unsafe-dev-key` | Clé secrète Django (**changer en prod**) |
| `DB_NAME` / `DB_USER` / `DB_PASSWORD` | `predictive` / `postgres` / `postgres` | PostgreSQL |
| `MQTT_BROKER` | `localhost` | Adresse du broker Mosquitto |
| `MQTT_PORT` | `1883` | Port MQTT |
| `MQTT_TOPIC` | `sensors/machine_01` | Topic de souscription |
| `SMTP_HOST` | — | Serveur SMTP pour les alertes email |
| `ALERT_TO_EMAIL` | — | Destinataire des alertes |
| `REDIS_HOST` | `localhost` | Redis pour Django Channels |

---

## Conformité Industrie 4.0 — §3.1 Maintenance Prédictive

| Exigence | Statut |
|---|---|
| Surveillance temps réel des machines | ✅ |
| Capteurs de vibration | ✅ |
| Capteurs de température | ✅ |
| Détection d'anomalies par ML | ✅ Isolation Forest |
| Alertes automatiques (email + DB + WebSocket) | ✅ |
| Dashboard de suivi en temps réel | ✅ React + Streamlit |
| Architecture IoT avec broker MQTT | ✅ Mosquitto |

---

## Notes

- `model.pkl` est créé automatiquement au premier lancement de `app.py`.
- Docker a été retiré du projet ; chaque composant se lance indépendamment.
- En production, définir `DJANGO_SECRET_KEY`, désactiver `DJANGO_DEBUG=False` et restreindre `CORS_ALLOWED_ORIGINS`.
