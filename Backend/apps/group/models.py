import secrets
import uuid

from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from django.db import models
from django_jalali.db import models as jmodels


class Category(models.Model):
    name = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

    def clean(self):
        if Category.objects.filter(name=self.name).exists():
            raise ValidationError(
                f"A category with the name '{self.name}' already exists."
            )

    class Meta:
        verbose_name = "Category"
        verbose_name_plural = "Categories"


class AttributeType(models.Model):
    ATTRIBUTE_CHOICE_TYPE = (
        ("dropdown", "dropdown"),
        ("date", "date"),
        ("checkbox", "checkbox"),
        ("input", "input"),
    )
    name = models.CharField(max_length=50)
    category = models.ForeignKey(
        Category, on_delete=models.CASCADE, default=1, related_name="attribute_types"
    )
    attribute_type = models.CharField(
        max_length=100, choices=ATTRIBUTE_CHOICE_TYPE, default="select attribute type"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

    def clean(self):
        if AttributeType.objects.filter(
            name=self.name, category=self.category
        ).exists():
            raise ValidationError(
                f"An attribute with the name '{self.name}' already exists in this category."
            )

    class Meta:
        unique_together = ["name", "category"]


class AttributeValue(models.Model):
    attribute = models.ForeignKey(
        AttributeType,
        on_delete=models.CASCADE,
        default=1,
        related_name="attribute_values",
    )
    attribute_value = models.CharField(max_length=255)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.attribute_value

    def clean(self):
        if AttributeValue.objects.filter(
            attribute=self.attribute, attribute_value=self.attribute_value
        ).exists():
            raise ValidationError(
                f"An attribute value '{self.attribute_value}' already exists for this attribute."
            )

    class Meta:
        unique_together = ["attribute", "attribute_value"]


def generate_secret_key():
    return "".join(
        secrets.choice("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789")
        for _ in range(6)
    )


class Order(models.Model):
    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("taken", "Taken"),
        ("processing", "Processing"),
        ("done", "Done"),
        ("delivered", "Delivered"),
    ]
    User = get_user_model()
    order_name = models.CharField(max_length=255)
    customer_name = models.CharField(max_length=255)
    designer = models.ForeignKey(User, on_delete=models.CASCADE, related_name="orders")
    printer = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="printer_orders",
        null=True,
        blank=True,
    )

    secret_key = models.CharField(
        max_length=6,
        default=generate_secret_key,
        editable=False,
        unique=True,
    )
    category = models.ForeignKey(Category, on_delete=models.CASCADE)
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default="pending")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    attributes = models.JSONField(default=dict, null=True, blank=True)

    def __str__(self):
        return f"Order {self.order_name} by {self.customer_name}"

    class Meta:
        verbose_name = "Order"
        verbose_name_plural = "Orders"


class ReceptionOrder(models.Model):
    order = models.OneToOneField(
        Order, on_delete=models.SET_NULL, null=True, blank=True
    )
    price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    receive_price = models.DecimalField(
        max_digits=10, decimal_places=2, null=True, blank=True
    )
    reminder_price = models.DecimalField(
        max_digits=10, decimal_places=2, null=True, blank=True
    )
    delivery_date = jmodels.jDateField()
    created_at = models.DateTimeField(auto_now_add=True)

    def clean(self):
        if self.price is not None and self.receive_price is not None:

            calculated_reminder_price = self.price - self.receive_price

            if self.reminder_price != calculated_reminder_price:
                raise ValidationError(
                    f"Reminder price should be {calculated_reminder_price}, but got {self.reminder_price}."
                )

    def __str__(self):
        return self.order.order_name
