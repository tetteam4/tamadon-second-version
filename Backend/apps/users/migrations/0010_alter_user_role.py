# Generated by Django 5.1.2 on 2025-01-07 09:48

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("users", "0009_alter_chatmassage_date"),
    ]

    operations = [
        migrations.AlterField(
            model_name="user",
            name="role",
            field=models.PositiveSmallIntegerField(
                blank=True,
                choices=[
                    (1, "Designer"),
                    (2, "Reception"),
                    (3, "SuperDesigner"),
                    (0, "Admin"),
                    (4, "Printer"),
                ],
                null=True,
            ),
        ),
    ]
