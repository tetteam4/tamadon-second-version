from django.db import models
from django.contrib.auth import get_user_model
from collections import deque

User = get_user_model()

class Order(models.Model):
    STATUS_CHOICES = [
        ('waiting', 'Waiting'),
        ('assigned', 'Assigned'),
        ('completed', 'Completed'),
    ]
    
    order_id = models.CharField(max_length=20, unique=True) 
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='waiting')
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Order {self.order_id} - {self.status}"

    def assign_user(self, user):
        """Assign a user to this order."""
        self.user = user
        self.status = 'assigned'
        self.save()

    def complete_order(self):
        """Complete the order and free the user."""
        if self.user:
            self.user.is_free = True
            self.user.save()
        self.status = 'completed'
        self.save()


class OrderSystem:
    def __init__(self):
        self.order_queue = deque()  # Queue for orders waiting for a user
        self.order_counter = 1  # Start from 1 for the order ID

    def generate_order_id(self):
        """Generate an incremental order ID."""
        order_id = f"ORD-{self.order_counter:06d}"
        self.order_counter += 1
        return order_id

    def create_order(self):
        """Create an order and assign it to an available user."""
        
        # Delete all previous 'waiting' orders when a new order is created
        self.delete_previous_waiting_orders()

        # Create the new order
        order_id = self.generate_order_id()
        order = Order.objects.create(order_id=order_id, status='waiting')
        
        # Check if there is an available user to assign the order
        available_user = self.find_available_user()

        if available_user:
            order.assign_user(available_user)  # Assign user to the order
        else:
            self.order_queue.append(order)  # Add to queue if no user is available
        
        return order

    def delete_previous_waiting_orders(self):
        """Delete all existing orders with 'waiting' status."""
        # Delete all 'waiting' orders from the database
        waiting_orders = Order.objects.filter(status='waiting')
        waiting_orders.delete()

    def find_available_user(self):
        """Find an available user with is_free=True."""
        available_users = User.objects.filter(is_free=True, is_active=True)
        if available_users.exists():
            # For simplicity, choose the first available user
            user = available_users.first()
            user.is_free = False
            user.save()
            return user
        return None

    def user_available(self):
        """Simulate a user becoming available."""
        # Fetch waiting orders in the order they were created
        waiting_orders = Order.objects.filter(status='waiting').order_by('created_at')  # Sort by created_at to prioritize earliest orders
        
        if waiting_orders.exists():
            # Get the first waiting order (earliest created)
            order = waiting_orders.first()

            # Find an available user to assign this order
            user = self.find_available_user()
            
            if user:
                # Assign the waiting order to the available user
                order.assign_user(user)
                return order

        return None

    def complete_order(self, order_id):
        """Complete the order and mark the user as free again."""
        try:
            order = Order.objects.get(order_id=order_id)
            order.complete_order()  # Mark as completed
            return order
        except Order.DoesNotExist:
            return None
