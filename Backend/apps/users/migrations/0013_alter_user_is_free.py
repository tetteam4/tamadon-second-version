from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0012_contact'),
    ]

    operations = [
        migrations.AlterField(
            model_name='user',
            name='is_free',
            field=models.BooleanField(blank=True, default=False, null=True),
        ),
    ]