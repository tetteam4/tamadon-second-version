from rest_framework import serializers

from .models import Staff, UpsentModel


class UpsentModelSerializer(serializers.ModelSerializer):
    class Meta:
        model = UpsentModel
        fields = "__all__"


class StaffSerializer(serializers.ModelSerializer):

    class Meta:
        model = Staff
        fields = "__all__"
