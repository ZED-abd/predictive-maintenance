from django.db import migrations, models

class Migration(migrations.Migration):
    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name="SensorReading",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("machine_id", models.CharField(max_length=64)),
                ("timestamp", models.DateTimeField()),
                ("vibration", models.FloatField()),
                ("temp", models.FloatField()),
                ("current", models.FloatField()),
                ("is_anomaly", models.BooleanField(default=False)),
            ],
            options={"ordering": ["-timestamp"]},
        )
    ]
