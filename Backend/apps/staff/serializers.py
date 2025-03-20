from rest_framework import serializers

from .models import Staff, UpsentModel


class UpsentModelSerializer(serializers.ModelSerializer):
    class Meta:
        model = UpsentModel
        fields = "__all__"


class StaffSerializer(serializers.ModelSerializer):
    upsent_day = UpsentModelSerializer()

    class Meta:
        model = Staff
        fields = "__all__"

    def create(self, validated_data):
        upsent_data = validated_data.pop("upsent_day")
        upsent_instance = UpsentModel.objects.create(**upsent_data)
        staff_instance = Staff.objects.create(
            upsent_day=upsent_instance, **validated_data
        )
        return staff_instance
