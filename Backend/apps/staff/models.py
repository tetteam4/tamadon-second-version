from decimal import Decimal

from django.db import models
from django.utils.translation import gettext_lazy as _
from pyexpat import model


class UpsentModel(models.Model):
    day = models.DateField()
    staff = models.ForeignKey(
        "Staff", on_delete=models.PROTECT, related_name="upsent_models"
    )

    def __str__(self):
        return f"Upsent day: {self.day} - Staff: {self.staff.name}"


class Staff(models.Model):
    class Position(models.TextChoices):
        DESIGNER = "Designer", _("Designer")
        RECEPTION = "Reception", _("Reception")
        PRINTER = "Printer", _("Printer")
        OTHER = "Other", _("Other")

    class State(models.TextChoices):
        ACTIVE = "Active", _("Active")
        INACTIVE = "Inactive", _("Inactive")

    class Location(models.TextChoices):
        FACTORY = "Factory", _("Factory")
        SHOP = "Shop", _("Shop")
        OTHER = "Other", _("Other")

    name = models.CharField(_("Name"), max_length=250)
    father_name = models.CharField(_("Father Name"), max_length=250)
    nic = models.IntegerField(_("NIC"))
    photo = models.ImageField(upload_to="staff/images")
    address = models.CharField(_("Address"), max_length=250)
    salary_per_day = models.DecimalField(
        max_digits=12, decimal_places=2, default=Decimal("0.00")
    )
    location = models.CharField(_("Location"), choices=Location.choices, max_length=255)
    position = models.CharField(_("Position"), choices=Position.choices, max_length=250)
    state = models.CharField(
        _("State"), choices=State.choices, max_length=250, default=State.ACTIVE
    )
    total = models.DecimalField(
        max_digits=12, decimal_places=2, default=Decimal("0.00")
    )

    # Add related_name to avoid reverse query name clash
    upsent_day = models.ForeignKey(
        UpsentModel, on_delete=models.PROTECT, related_name="staff_members"
    )

    clear_date = models.DateField()

    def __str__(self):
        return f"{self.name} ({self.position})"
