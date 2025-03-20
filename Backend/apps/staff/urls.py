from django.urls import path

from . import views

urlpatterns = [
    path(
        "upsentmodels/",
        views.UpsentModelListCreateView.as_view(),
        name="upsentmodel-list-create",
    ),
    path(
        "upsentmodels/<int:pk>/",
        views.UpsentModelRetrieveUpdateDestroyView.as_view(),
        name="upsentmodel-retrieve-update-destroy",
    ),
    # Staff URLs
    path("staff/", views.StaffListCreateView.as_view(), name="staff-list-create"),
    path(
        "staff/<int:pk>/",
        views.StaffRetrieveUpdateDestroyView.as_view(),
        name="staff-retrieve-update-destroy",
    ),
]
