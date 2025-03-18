from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    AttributeTypeDetailView,
    AttributeTypeListCreateView,
    AttributeValueDetailView,
    AttributeValueListCreateView,
    CategoryAttributeView,
    CategoryDetailView,
    CategoryListCreateView,
    OrderListByCategoryView,
    OrderListView,
    OrderStatusUpdateView,
    OrderViewSet,
    ReceptionOrderByPriceViewSet,
    ReceptionOrderViewSet,
    UpdateReminderPriceView,
)

router = DefaultRouter()
router.register("orders", OrderViewSet, basename="order")
router.register("reception-orders", ReceptionOrderViewSet)

router.register(
    "order-by-price",
    ReceptionOrderByPriceViewSet,
    basename="receptionorder-by-price",
)
urlpatterns = [
    path("categories/", CategoryListCreateView.as_view(), name="category-list-create"),
    path("categories/<int:pk>/", CategoryDetailView.as_view(), name="category-detail"),
    path(
        "attribute-values/",
        AttributeValueListCreateView.as_view(),
        name="attribute-value-list-create",
    ),
    path(
        "attribute-values/<int:pk>/",
        AttributeValueDetailView.as_view(),
        name="attribute-value-detail",
    ),
    path(
        "attribute-types/",
        AttributeTypeListCreateView.as_view(),
        name="attribute-type-list-create",
    ),
    path(
        "attribute-types/<int:pk>/",
        AttributeTypeDetailView.as_view(),
        name="attribute-type-detail",
    ),
    path(
        "category/attribute/<int:category_id>/",
        CategoryAttributeView.as_view(),
        name="category-attributes",
    ),
    path("order/<str:status>/", OrderListView.as_view(), name="order-list-status"),
    path("order/", OrderListView.as_view(), name="order-list-status"),
    path("", include(router.urls)),
    path(
        "update-order-status/",
        OrderStatusUpdateView.as_view(),
        name="update_order_status",
    ),
    path(
        "orders/category/<int:category_id>/",
        OrderListByCategoryView.as_view(),
        name="order-list-by-category",
    ),
    path(
        "order-by-price/complete/<int:order_id>/",
        UpdateReminderPriceView.as_view(),
        name="update-reminder-price",
    ),
]
