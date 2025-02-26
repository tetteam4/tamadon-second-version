
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0013_alter_user_is_free'),
    ]

    operations = [
        migrations.AlterField(
            model_name='user',
            name='role',
            field=models.PositiveSmallIntegerField(blank=True, choices=[(1, 'Designer'), (2, 'Reception'), (3, 'SuperDesigner'), (0, 'Admin'), (4, 'Printer'), (5, 'Delivered')], null=True),
        ),
    ]
