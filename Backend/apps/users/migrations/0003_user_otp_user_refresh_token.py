# Generated by Django 5.1.2 on 2024-12-21 11:01

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0002_alter_user_role'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='otp',
            field=models.CharField(blank=True, max_length=8, null=True),
        ),
        migrations.AddField(
            model_name='user',
            name='refresh_token',
            field=models.CharField(blank=True, max_length=1000, null=True),
        ),
    ]
