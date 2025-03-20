from django.urls import path

from .views import (
    StaffListCreateView,
    StaffRetrieveUpdateDestroyView,
    UpsentModelListCreateView,
    UpsentModelRetrieveUpdateDestroyView,
)

urlpatterns = [
    path("", StaffListCreateView.as_view(), name="staff-list-create"),
    path(
        "<int:pk>/",
        StaffRetrieveUpdateDestroyView.as_view(),
        name="staff-retrieve-update-destroy",
    ),
    path("", UpsentModelListCreateView.as_view(), name="upsent-list-create"),
    path(
        "<int:pk>/",
        UpsentModelRetrieveUpdateDestroyView.as_view(),
        name="upsent-retrieve-update-destroy",
    ),
]
