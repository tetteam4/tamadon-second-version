import datetime
from decimal import Decimal

import jdatetime
from apps.users.models import User
from django import forms
from jdatetime import datetime
from rest_framework import serializers

from .models import AttributeType, AttributeValue, Category, Order, ReceptionOrder


class JalaliDateField(serializers.DateField):
    def to_representation(self, value):
        if value is None:
            return None
        jalali_date = jdatetime.date.fromgregorian(date=value)
        return jalali_date.strftime("%Y-%m-%d")

    def to_internal_value(self, data):
        # Convert from Jalali date string to Gregorian date when saving to the database
        try:
            jalali_date = jdatetime.datetime.strptime(data, "%Y-%m-%d")
            return jalali_date.togregorian().date()
        except ValueError:
            raise serializers.ValidationError(
                "Invalid date format. Please use YYYY-MM-DD."
            )


class CategorySerializer(serializers.ModelSerializer):
    stages = serializers.ListField(child=serializers.CharField())

    class Meta:
        model = Category
        fields = ["id", "name", "stages", "created_at", "updated_at"]
        ref_name = "GroupCategorySerializer"


class AttributeTypeSerializer(serializers.ModelSerializer):
    category = serializers.PrimaryKeyRelatedField(queryset=Category.objects.all())
    attribute_type = serializers.ChoiceField(
        choices=AttributeType.ATTRIBUTE_CHOICE_TYPE,
        default="select attribute type",
    )

    class Meta:
        model = AttributeType
        fields = [
            "id",
            "name",
            "category",
            "attribute_type",
            "created_at",
            "updated_at",
        ]


class AttributeValueSerializer(serializers.ModelSerializer):
    attribute = serializers.PrimaryKeyRelatedField(queryset=AttributeType.objects.all())

    class Meta:
        model = AttributeValue
        fields = [
            "id",
            "attribute",
            "attribute_value",
            "created_at",
            "updated_at",
        ]


class OrderSerializer(serializers.ModelSerializer):
    designer = serializers.PrimaryKeyRelatedField(queryset=User.objects.all())
    category = serializers.PrimaryKeyRelatedField(queryset=Category.objects.all())
    # status = serializers.ListField(child=serializers.CharField())

    class Meta:
        model = Order
        fields = [
            "id",
            "order_name",
            "customer_name",
            "designer",
            "description",
            "category",
            "secret_key",
            "attributes",
            "status",
            "created_at",
            "updated_at",
        ]


class ReceptionOrderSerializer(serializers.ModelSerializer):
    reminder_price = serializers.DecimalField(
        max_digits=10, decimal_places=2, read_only=True
    )

    delivery_date = JalaliDateField()

    class Meta:
        model = ReceptionOrder
        fields = [
            "id",
            "order",
            "price",
            "receive_price",
            "reminder_price",
            "delivery_date",
            "created_at",
        ]

    def validate(self, data):
        price = data.get("price")
        receive_price = data.get("receive_price")

        # Check if price and receive_price are present
        if price is not None and receive_price is not None:
            # Calculate reminder_price
            reminder_price = price - receive_price

            # Ensure reminder_price is not negative
            if reminder_price < 0:
                raise serializers.ValidationError(
                    "Calculated reminder price cannot be negative."
                )

            # Add the calculated reminder_price to the data
            data["reminder_price"] = reminder_price

        return data

    def create(self, validated_data):
        """
        Create a new ReceptionOrder, ensuring reminder_price is valid.
        """
        # If reminder_price is not in validated data, calculate it
        if "reminder_price" not in validated_data:
            price = validated_data["price"]
            receive_price = validated_data["receive_price"]
            reminder_price = price - receive_price

            # Ensure reminder_price is not negative
            if reminder_price < 0:
                raise serializers.ValidationError(
                    "Calculated reminder price cannot be negative."
                )

            validated_data["reminder_price"] = reminder_price

        return super().create(validated_data)

    def update(self, instance, validated_data):
        """
        Update an existing ReceptionOrder, ensuring reminder_price is valid.
        """
        # If reminder_price is not in validated data, calculate it
        if "reminder_price" not in validated_data:
            price = validated_data.get("price", instance.price)
            receive_price = validated_data.get("receive_price", instance.receive_price)
            reminder_price = price - receive_price

            # Ensure reminder_price is not negative
            if reminder_price < 0:
                raise serializers.ValidationError(
                    "Calculated reminder price cannot be negative."
                )

            validated_data["reminder_price"] = reminder_price

        return super().update(instance, validated_data)


class OrderStatusUpdateSerializer(serializers.Serializer):
    order_id = serializers.IntegerField()  
    status = serializers.CharField()

    def validate_order_id(self, value):
        # Ensure the order exists
        if not Order.objects.filter(id=value).exists():
            raise serializers.ValidationError("Order with this ID does not exist.")
        return value


class OrderSerializerByPrice(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = [
            "id",
            "order_name",
            "status",
        ]


class ReceptionOrderSerializerByPrice(serializers.ModelSerializer):
    order = serializers.PrimaryKeyRelatedField(queryset=Order.objects.all())
    delivery_date = JalaliDateField()

    class Meta:
        model = ReceptionOrder
        fields = [
            "id",
            "order",
            "price",
            "receive_price",
            "reminder_price",
            "delivery_date",
            "created_at",
        ]

    def create(self, validated_data):
        order = validated_data.pop("order")
        reception_order = ReceptionOrder.objects.create(
            order=order,
            price=validated_data["price"],
            receive_price=validated_data["receive_price"],
            reminder_price=validated_data["reminder_price"],
            delivery_date=validated_data["delivery_date"],
        )

        return reception_order
