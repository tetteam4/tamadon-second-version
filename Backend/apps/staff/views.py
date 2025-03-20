from rest_framework import generics

from .models import Staff, UpsentModel
from .serializers import StaffSerializer, UpsentModelSerializer


# Generic View for UpsentModel
class UpsentModelListCreateView(generics.ListCreateAPIView):
    queryset = UpsentModel.objects.all()
    serializer_class = UpsentModelSerializer


class UpsentModelRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = UpsentModel.objects.all()
    serializer_class = UpsentModelSerializer


# Generic View for Staff
class StaffListCreateView(generics.ListCreateAPIView):
    queryset = Staff.objects.all()
    serializer_class = StaffSerializer


class StaffRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Staff.objects.all()
    serializer_class = StaffSerializer
