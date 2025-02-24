from django.contrib.auth import get_user_model
from collections import deque
import time

User = get_user_model()


class OrderSystem:
    def __init__(self):
        self.orders = {}
        self.order_queue = deque()
        self.order_counter = 1

    def generate_order_id(self):
        """Generate an incremental order ID."""
        order_id = f"ORD-{self.order_counter:06d}"
        self.order_counter += 1
        return order_id

    def create_order(self):
        """Create an order and assign it to an available user."""
        order_id = self.generate_order_id()
        print(f"Generating Order ID: {order_id}")

        # Find an available user who is free
        available_user = self.find_available_user()

        if available_user:
            # Mark the user as busy
            available_user.is_free = False
            available_user.save()

            # Assign order to the found user
            self.orders[order_id] = available_user
            print(
                f"Order {order_id} assigned to {available_user.first_name} {available_user.last_name} ({available_user.get_role()})"
            )
        else:
            # If no users are available, add to the waiting list
            self.order_queue.append(order_id)
            print(f"Order {order_id} is waiting for a user.")

    def find_available_user(self):
        """Find an available user with is_free=True."""
        # Find users that are free and are active
        available_users = User.objects.filter(is_free=True, is_active=True)

        if available_users.exists():
            # For simplicity, choose the first available user
            return available_users.first()
        return None

    def user_available(self):
        """Simulate a user becoming available."""
        if self.order_queue:
            order_id = self.order_queue.popleft()
            user = self.find_available_user()
            if user:
                # Mark the user as busy
                user.is_free = False
                user.save()

                self.orders[order_id] = user
                print(
                    f"Order {order_id} is now assigned to {user.first_name} {user.last_name}"
                )
        else:
            print("No orders are waiting.")

    def checkout_order(self, order_id):
        """Simulate completing the checkout and marking the user as free again."""
        if order_id in self.orders:
            user = self.orders.pop(order_id)
            # Mark the user as free again
            user.is_free = True
            user.save()
            print(
                f"Order {order_id} completed by {user.first_name} {user.last_name} ({user.get_role()})."
            )
        else:
            print(f"Order {order_id} not found.")


# Example of how the system would work
order_system = OrderSystem()

# Create orders
order_system.create_order()
time.sleep(1)  # Simulate waiting time
order_system.create_order()
time.sleep(1)
order_system.create_order()

# Simulate users becoming available
time.sleep(2)
order_system.user_available()  # User becomes available and takes the next order

# Check out orders
time.sleep(1)
order_system.checkout_order("ORD-123456")  # Checkout the specific order
