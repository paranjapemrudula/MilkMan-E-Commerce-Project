from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Category, Product, Subscription, Order, OrderItem

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email']

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'

class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = '__all__'

class SubscriptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subscription
        fields = '__all__'

class OrderItemSerializer(serializers.ModelSerializer):
    order_id = serializers.ReadOnlyField(source='order.id')
    product_id = serializers.ReadOnlyField(source='product.id')
    name = serializers.ReadOnlyField(source='product.name')
    image = serializers.ReadOnlyField(source='product.image')

    class Meta:
        model = OrderItem
        fields = ['id', 'order_id', 'product_id', 'quantity', 'price', 'name', 'image']

class OrderSerializer(serializers.ModelSerializer):
    user_id = serializers.ReadOnlyField(source='user.id')
    items = OrderItemSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = ['id', 'user_id', 'total_amount', 'status', 'created_at', 'items']
