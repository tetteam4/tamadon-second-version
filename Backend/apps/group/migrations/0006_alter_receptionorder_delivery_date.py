# Generated by Django 5.1.2 on 2024-12-25 06:38

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('group', '0005_alter_attributetype_attribute_type_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='receptionorder',
            name='delivery_date',
            field=models.DateField(blank=True, null=True),
        ),
    ]
