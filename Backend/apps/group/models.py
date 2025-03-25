from datetime import datetime

import jdatetime
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from django.db import models
from django_jalali.db import models as jmodels


class Category(models.Model):

    name = models.CharField(max_length=255)
    stages = models.JSONField(default=list)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

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


def generate_secret_key(order_id):
    # Zero pad the order ID to always be 3 digits (001, 002, 003, etc.)
    first_three_digits = str(order_id).zfill(3)

    # Get the current date in the Jalali (Persian) calendar
    current_jalali_date = jdatetime.datetime.now()

    # Extract the last digit of the current Jalali year
    last_digit_of_year = str(current_jalali_date.year)[-1]  # e.g., '4' for 1404

    # Get the current month and day in Jalali calendar
    month_part = current_jalali_date.strftime(
        "%m"
    )  # Two-digit month (e.g., '03' for Farvardin)
    day_part = current_jalali_date.strftime("%d")  # Two-digit day (e.g., '25')

    # Combine all parts to form the secret key
    secret_key = f"{first_three_digits}{last_digit_of_year}{month_part}{day_part}"

    return secret_key


class Order(models.Model):
    User = get_user_model()
    order_name = models.CharField(max_length=255)
    customer_name = models.CharField(max_length=255)
    designer = models.ForeignKey(User, on_delete=models.CASCADE, related_name="orders")
    description = models.TextField()
    printer = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="printer_orders",
        null=True,
        blank=True,
    )
    secret_key = models.CharField(
        default="",
        max_length=6,
        editable=False,
        unique=True,
    )
    category = models.ForeignKey(Category, on_delete=models.CASCADE)
    status = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    attributes = models.JSONField(default=dict, null=True, blank=True)

    def __str__(self):
        return f"Order {self.order_name} by {self.customer_name}"

    class Meta:
        verbose_name = "Order"
        verbose_name_plural = "Orders"

    def save(self, *args, **kwargs):
        # Generate the secret key only if it's not already set
        if not self.secret_key:
            # Generate the secret key only after the instance has been saved
            super(Order, self).save(
                *args, **kwargs
            )  # Save first to generate the auto-incremented id
            self.secret_key = generate_secret_key(self.id)

            # Ensure the secret_key is unique, if not, regenerate
            while Order.objects.filter(secret_key=self.secret_key).exists():
                # Regenerate the secret key if it already exists
                self.secret_key = generate_secret_key(self.id)

        # Call the parent's save method
        super(Order, self).save(*args, **kwargs)


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
    delivery_date = models.DateTimeField(auto_now_add=True)
    created_at = models.DateTimeField(auto_now_add=True)
    is_checked = models.BooleanField(default=False)

    def clean(self):
        if self.price is not None and self.receive_price is not None:

            calculated_reminder_price = self.price - self.receive_price

            if self.reminder_price != calculated_reminder_price:
                raise ValidationError(
                    f"Reminder price should be {calculated_reminder_price}, but got {self.reminder_price}."
                )

    def __str__(self):
       
        return str(self.price)