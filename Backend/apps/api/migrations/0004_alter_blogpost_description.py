# Generated by Django 5.1.2 on 2025-02-09 09:32

import ckeditor.fields
from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0003_alter_blogpost_image'),
    ]

    operations = [
        migrations.AlterField(
            model_name='blogpost',
            name='description',
            field=ckeditor.fields.RichTextField(),
        ),
    ]
