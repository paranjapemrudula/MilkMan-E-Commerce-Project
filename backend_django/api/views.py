from rest_framework import viewsets, status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from .models import Category, Product, Subscription, Order, OrderItem
from .serializers import CategorySerializer, ProductSerializer, SubscriptionSerializer, OrderSerializer, UserSerializer

class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

class ProductViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer

class SubscriptionViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Subscription.objects.all()
    serializer_class = SubscriptionSerializer

@api_view(['POST'])
def signup(request):
    username = request.data.get('email')
    email = request.data.get('email')
    password = request.data.get('password')
    
    if not email or not password:
        return Response({'error': 'Email and password are required'}, status=status.HTTP_400_BAD_REQUEST)
    
    if User.objects.filter(username=username).exists():
        return Response({'error': 'User already exists'}, status=status.HTTP_400_BAD_REQUEST)
    
    user = User.objects.create_user(username=username, email=email, password=password)
    return Response({'id': user.id, 'email': user.email, 'role': 'customer'})

@api_view(['POST'])
def login(request):
    username = request.data.get('email')
    password = request.data.get('password')
    
    user = authenticate(username=username, password=password)
    if user:
        return Response({'id': user.id, 'email': user.email, 'role': 'customer'})
    return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

@api_view(['POST'])
def create_order(request):
    user_id = request.data.get('user_id')
    items_data = request.data.get('items')
    total_amount = request.data.get('total_amount')
    
    try:
        user = User.objects.get(id=user_id)
        order = Order.objects.create(user=user, total_amount=total_amount)
        
        for item in items_data:
            product = Product.objects.get(id=item['id'])
            OrderItem.objects.create(
                order=order,
                product=product,
                quantity=item['quantity'],
                price=item['price']
            )
        return Response({'id': order.id, 'message': 'Order placed successfully'})
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def get_user_orders(request, user_id):
    orders = Order.objects.filter(user_id=user_id).order_by('-created_at')
    serializer = OrderSerializer(orders, many=True)
    return Response(serializer.data)
