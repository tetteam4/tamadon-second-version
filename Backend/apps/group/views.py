from apps.group.filters import OrderFilter
from apps.users.tasks import (
    process_order_deletion,
    process_order_saving,
    process_order_update,
    process_reception_order_creation,
    process_reception_order_deletion,
    process_reception_order_update,
)
from django.db.models import Q
from django.forms import ValidationError
from django_filters.rest_framework.backends import DjangoFilterBackend
from rest_framework import generics, permissions, status, viewsets
from rest_framework.exceptions import PermissionDenied
from rest_framework.filters import SearchFilter
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import AttributeType, AttributeValue, Category, Order, ReceptionOrder
from .permissions import IsSuperDesigner
from .serializers import (
    AttributeTypeSerializer,
    AttributeValueSerializer,
    CategorySerializer,
    OrderSerializer,
    OrderStatusUpdateSerializer,
    ReceptionOrderSerializer,
    ReceptionOrderSerializerByPrice,
)


class CategoryListCreateView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        categories = Category.objects.all()
        serializer = CategorySerializer(categories, many=True)
        return Response(serializer.data)

    def post(self, request):

        serializer = CategorySerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CategoryDetailView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, pk):

        try:
            category = Category.objects.get(pk=pk)
        except Category.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)

        serializer = CategorySerializer(category)
        return Response(serializer.data)

    def put(self, request, pk):

        try:
            category = Category.objects.get(pk=pk)
        except Category.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)

        serializer = CategorySerializer(category, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):

        try:
            category = Category.objects.get(pk=pk)
        except Category.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)

        category.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class AttributeValueListCreateView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        attribute_values = AttributeValue.objects.all()
        serializer = AttributeValueSerializer(attribute_values, many=True)
        return Response(serializer.data)

    def post(self, request):

        serializer = AttributeValueSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AttributeValueDetailView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, pk):

        try:
            attribute_value = AttributeValue.objects.get(pk=pk)
        except AttributeValue.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)

        serializer = AttributeValueSerializer(attribute_value)
        return Response(serializer.data)

    def put(self, request, pk):

        try:
            attribute_value = AttributeValue.objects.get(pk=pk)
        except AttributeValue.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)

        serializer = AttributeValueSerializer(attribute_value, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):

        try:
            attribute_value = AttributeValue.objects.get(pk=pk)
        except AttributeValue.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)

        attribute_value.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class AttributeTypeListCreateView(generics.ListCreateAPIView):
    queryset = AttributeType.objects.all()
    serializer_class = AttributeTypeSerializer
    permission_classes = [AllowAny]


class AttributeTypeListCreateView(generics.ListCreateAPIView):

    queryset = AttributeType.objects.all()
    serializer_class = AttributeTypeSerializer
    permission_classes = [AllowAny]


class AttributeTypeDetailView(generics.RetrieveUpdateDestroyAPIView):

    queryset = AttributeType.objects.all()
    serializer_class = AttributeTypeSerializer
    permission_classes = [AllowAny]  # Adju


class CategoryAttributeView(generics.GenericAPIView):
    permission_classes = [AllowAny]

    def get(self, request, category_id):
        try:

            category = Category.objects.get(id=category_id)
        except Category.DoesNotExist:
            return Response(
                {"error": "Category not found"}, status=status.HTTP_404_NOT_FOUND
            )

        attribute_types = AttributeType.objects.filter(category=category)
        attribute_values = AttributeValue.objects.filter(attribute__category=category)

        attribute_type_serializer = AttributeTypeSerializer(attribute_types, many=True)
        attribute_value_serializer = AttributeValueSerializer(
            attribute_values, many=True
        )

        response_data = {
            "attribute_types": attribute_type_serializer.data,
            "attribute_values": attribute_value_serializer.data,
        }

        return Response(response_data, status=status.HTTP_200_OK)


class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend, SearchFilter]
    search_fields = ["secret_key"]  # Allows searching by secret_key

    def get_queryset(self):
        user = self.request.user
        print(f"User role: {user.role}")

        if user.role in [0, 2]:
            return Order.objects.all()

        if user.role == 3:  # SuperDesigner
            queryset = Order.objects.filter(designer=user)
            print(
                f"SuperDesigner orders: {queryset}"
            )  # Debugging output for SuperDesigner orders
            return queryset

        if user.role == 1:  # Designer
            return Order.objects.filter(designer=user)

        if user.role == 4:  # Printer
            return Order.objects.filter(Q(printer=user) | Q(printer__isnull=True))

        return Order.objects.none()

    def perform_create(self, serializer):
        user = self.request.user
        print(f"User role: {user.role}")  # Debugging output for user role

        # You can remove the role checks for creation if you want all users to create orders
        # For now, keeping the check to ensure only Designers/Admins can create orders
        if user.role != 1 and user.role != 3:
            raise PermissionDenied(
                "You must be a Designer or Admin to create an order."
            )

        # Save the order and trigger Celery task asynchronously
        order = serializer.save(designer=user)
        process_order_saving.delay(order.id)

    def perform_update(self, serializer):
        user = self.request.user
        order = serializer.save()

        # Trigger Celery task asynchronously to process the updated order
        process_order_update.delay(order.id)

    def perform_destroy(self, instance):
        # Trigger Celery task asynchronously to process the deleted order
        # process_order_deletion.delay(instance.id)

        super().perform_destroy(instance)

    def list(self, request, *args, **kwargs):
        """
        List all orders, possibly filtered by search query.
        """
        queryset = self.get_queryset()

        # Apply search if query parameters are present
        search_key = request.query_params.get("search", None)
        if search_key:
            queryset = queryset.filter(secret_key__icontains=search_key)

        print(f"Final queryset: {queryset}")  # Debugging output for final queryset

        # Serialize and return the response
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


class OrderListView(generics.ListAPIView):
    serializer_class = OrderSerializer
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend, SearchFilter]
    search_fields = ["secret_key"]

    def get_queryset(self):
        queryset = Order.objects.all()

        # Get the status parameter from URL kwargs (if available)
        status_param = self.kwargs.get("status")

        if status_param:
            # If the status parameter is provided, filter by status
            queryset = queryset.filter(status=status_param)
        else:
            # If no status param, exclude 'pending' orders by default
            queryset = queryset.exclude(status="pending")

        return queryset

    def list(self, request, *args, **kwargs):
        # Get the filtered queryset
        queryset = self.get_queryset()

        # Handle search parameter if it exists
        if "search" in request.query_params:
            search_key = request.query_params["search"]
            queryset = queryset.filter(secret_key__icontains=search_key)

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)

        if queryset.exists():
            return Response(serializer.data, status=status.HTTP_200_OK)
        else:

            message = (
                f"Order with status '{status_param}' is not found"
                if status_param
                else "No orders found except pending"
            )
            return Response({"message": message}, status=status.HTTP_200_OK)


class ReceptionOrderViewSet(viewsets.ModelViewSet):
    queryset = ReceptionOrder.objects.all()
    serializer_class = ReceptionOrderSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):

        queryset = ReceptionOrder.objects.all()

        order_id = self.request.query_params.get("order", None)
        if order_id is not None:
            queryset = queryset.filter(order__id=order_id)

        return queryset

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    def perform_create(self, serializer):
        user = self.request.user
        reception_order = serializer.save()

        process_reception_order_creation.delay(
            reception_order.id
        )  # Trigger Celery task

    def perform_update(self, serializer):
        reception_order = serializer.save()

        process_reception_order_update.delay(
            reception_order.id
        )  # Trigger Celery task for update

    def perform_destroy(self, instance):
        # Trigger Celery task for background processing before deletion (e.g., logging, cleanup)
        process_reception_order_deletion.delay(
            instance.id
        )  # Trigger Celery task for deletion

        super().perform_destroy(instance)


# xskMPsNOOK,@


class OrderStatusUpdateView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = OrderStatusUpdateSerializer(data=request.data)

        if serializer.is_valid():
            order_id = serializer.validated_data["order_id"]
            status_value = serializer.validated_data["status"]
            order = Order.objects.get(id=order_id)
            order.status = status_value
            order.save()

            return Response(
                {"message": "Order status updated successfully."},
                status=status.HTTP_200_OK,
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ReceptionOrderByPriceViewSet(viewsets.ModelViewSet):
    queryset = ReceptionOrder.objects.all()
    serializer_class = ReceptionOrderSerializerByPrice
    permission_classes = [AllowAny]

    def get_queryset(self):
        queryset = ReceptionOrder.objects.all()

        # Filtering by order_id
        order_id = self.request.query_params.get("order", None)
        if order_id is not None:
            try:
                order_id = int(order_id)  # Ensure order_id is an integer
                queryset = queryset.filter(order__id=order_id)
            except ValueError:
                raise ValidationError("Invalid order ID provided.")

        # Filtering by price
        price_min = self.request.query_params.get("price_min", None)
        price_max = self.request.query_params.get("price_max", None)

        if price_min is not None:
            try:
                price_min = float(price_min)  # Ensure price_min is a valid float
                queryset = queryset.filter(price__gte=price_min)
            except ValueError:
                raise ValidationError("Invalid value for price_min.")

        if price_max is not None:
            try:
                price_max = float(price_max)  # Ensure price_max is a valid float
                queryset = queryset.filter(price__lte=price_max)
            except ValueError:
                raise ValidationError("Invalid value for price_max.")

        return queryset

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


class OrderListByCategoryView(generics.ListAPIView):
    serializer_class = OrderSerializer

    def get_queryset(self):
        category_id = self.kwargs["category_id"]
        # Filter orders by category_id
        return Order.objects.filter(category_id=category_id)
