# Generated by Django 5.1.2 on 2025-01-13 06:55

import django.utils.timezone
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('group', '0007_order_printer'),
    ]

    operations = [
        migrations.AddField(
            model_name='receptionorder',
            name='created_at',
            field=models.DateTimeField(auto_now_add=True, default=django.utils.timezone.now),
            preserve_default=False,
        ),
    ]
