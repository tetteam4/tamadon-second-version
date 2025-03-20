from rest_framework import generics, permissions

from .models import Staff, UpsentModel
from .serializers import StaffSerializer, UpsentModelSerializer


# Generic View for UpsentModel
class UpsentModelListCreateView(generics.ListCreateAPIView):
    queryset = UpsentModel.objects.all()
    serializer_class = UpsentModelSerializer
    permission_classes = [permissions.AllowAny]


class UpsentModelRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = UpsentModel.objects.all()
    serializer_class = UpsentModelSerializer
    permission_classes = [permissions.AllowAny]


# Generic View for Staff
class StaffListCreateView(generics.ListCreateAPIView):
    queryset = Staff.objects.all()
    serializer_class = StaffSerializer
    permission_classes = [permissions.AllowAny]


class StaffRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Staff.objects.all()
    serializer_class = StaffSerializer
    permission_classes = [permissions.AllowAny]
