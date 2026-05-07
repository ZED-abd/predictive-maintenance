from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [("telemetry", "0001_initial")]

    operations = [
        migrations.CreateModel(
            name="Alert",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("machine_id", models.CharField(max_length=64)),
                ("timestamp", models.DateTimeField()),
                ("vibration", models.FloatField()),
                ("temperature", models.FloatField()),
                ("current", models.FloatField()),
                ("score", models.FloatField()),
                ("reason", models.TextField()),
            ],
            options={"ordering": ["-timestamp"]},
        )
    ]
