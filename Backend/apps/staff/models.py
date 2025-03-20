from decimal import Decimal

from django.db import models
from django.utils.translation import gettext_lazy as _


class Staff(models.Model):
    class Position(models.TextChoices):
        DESIGNER = "Designer", _("Designer")
        RECEPTION = "Reception", _("Reception")
        PRINTER = "Printer", _("Printer")

        OTHER = "Other", _("Other")

    class Status(models.TextChoices):
        ACTIVE = "Active", _("Active")
        INACTIVE = "Inactive", _("Inactive")

    name = models.CharField(_("Name"), max_length=250)
    father_name = models.CharField(_("Father Name"), max_length=250)
    nic = models.IntegerField(_("NIC"))
    photo = models.ImageField(upload_to="staff/images")
    address = models.CharField(_("Address"), max_length=250)
    position = models.CharField(_("Position"), choices=Position.choices, max_length=250)
    salary = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    up_sent_day = models.PositiveSmallIntegerField(null=True, blank=True)
    location = models.CharField(max_length=255)
    status = models.CharField(_("Status"), choices=Status.choices, max_length=250)

    def __str__(self):
        return f"{self.name} ({self.position})"


class Salary(models.Model):
    month = models.CharField(_("month"), max_length=250)
    total = models.DecimalField(
        _("Total"), max_digits=10, decimal_places=2, default=Decimal("0.00")
    )
    customers_list = models.JSONField(default=dict)

    def get_customers_list(self):
        """Populate the customers list from active staff."""
        active_staff = Staff.objects.filter(status=Staff.Status.ACTIVE)
        customers_data = {
            staff.id: {
                "salary": str(staff.salary),
                "taken": 0,
                "remainder": str(staff.salary),
            }
            for staff in active_staff
        }
        return customers_data

    def save(self, *args, **kwargs):
        self.customers_list = self.get_customers_list()
        super().save(*args, **kwargs)
