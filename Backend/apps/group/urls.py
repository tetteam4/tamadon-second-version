from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    AttributeTypeDetailView,
    AttributeTypeListCreateView,
    AttributeValueDetailView,
    AttributeValueListCreateView,
    CategoryAttributeView,
    CategoryCreateView,
    CategoryDeleteView,
    CategoryUpdateView,
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
    path("categories/", CategoryCreateView.as_view(), name="category-create"),
    path(
        "categories/<int:pk>/",
        CategoryUpdateView.as_view(),
        name="category-update",
    ),
    path(
        "categories/<int:pk>/delete/",
        CategoryDeleteView.as_view(),
        name="category-delete",
    ),
    
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
    path("order/", OrderListView.as_view(), name="order-list"),
    path("order/<str:status>/", OrderListView.as_view(), name="order-list-status"),
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
