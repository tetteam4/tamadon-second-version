from django.http import HttpResponse
from .models import OrderSystem

def test_order_system(request):
    order_system = OrderSystem()
    order_system.create_order()
    order_system.create_order()

    order_system.user_available()
    order_system.checkout_order("ORD-123456")
    return HttpResponse("Test Completed!")
