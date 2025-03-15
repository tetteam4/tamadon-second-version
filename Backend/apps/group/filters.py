from django_filters import rest_framework as filters

from .models import Order


class OrderFilter(filters.FilterSet):
    status = filters.CharFilter(field_name="status", lookup_expr="iexact")

    class Meta:
        model = Order
        fields = ["status"]
