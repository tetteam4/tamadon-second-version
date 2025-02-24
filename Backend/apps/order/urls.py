from django.urls import path
from . views import test_order_system
urlpatterns = [
    path("test-order/", test_order_system, name="test_order_system"),

]
