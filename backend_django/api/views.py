from rest_framework import viewsets, status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from django.core.validators import validate_email
from django.core.exceptions import ValidationError
from .models import Category, Product, Subscription, Order, OrderItem, Payment
from .serializers import CategorySerializer, ProductSerializer, SubscriptionSerializer, OrderSerializer, UserSerializer


def normalize_and_validate_email(raw_email):
    email = (raw_email or '').strip().lower()
    if not email:
        raise ValidationError('Email is required')

    validate_email(email)
    local_part, _, domain = email.partition('@')
    if not local_part or '.' not in domain:
        raise ValidationError('Enter a valid email address')
    return email

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
    raw_email = request.data.get('email')
    password = request.data.get('password')

    if not raw_email or not password:
        return Response({'error': 'Email and password are required'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        email = normalize_and_validate_email(raw_email)
    except ValidationError as exc:
        return Response({'error': exc.message}, status=status.HTTP_400_BAD_REQUEST)

    username = email

    if User.objects.filter(username=username).exists():
        return Response({'error': 'User already exists'}, status=status.HTTP_400_BAD_REQUEST)

    user = User.objects.create_user(username=username, email=email, password=password)
    return Response({'id': user.id, 'email': user.email, 'role': 'customer'})

@api_view(['POST'])
def login(request):
    raw_email = request.data.get('email')
    password = request.data.get('password')

    try:
        username = normalize_and_validate_email(raw_email)
    except ValidationError as exc:
        return Response({'error': exc.message}, status=status.HTTP_400_BAD_REQUEST)

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

@api_view(['POST'])
def purchase_subscription(request):
    user_id = request.data.get('user_id')
    subscription_id = request.data.get('subscription_id')

    try:
        user = User.objects.get(id=user_id)
        subscription = Subscription.objects.get(id=subscription_id)

        product_name = f"Subscription: {subscription.name} - {subscription.category}"
        product_description = f"Plan for {subscription.duration_days} days @ Rs.{subscription.price_per_liter}/L"
        active_statuses = ['pending', 'paid', Payment.STATUS_COD]

        existing_subscription = OrderItem.objects.filter(
            order__user=user,
            order__status__in=active_statuses,
            product__name=product_name,
        ).exists()
        if existing_subscription:
            return Response(
                {'error': 'This subscription is already active for your account.'},
                status=status.HTTP_409_CONFLICT,
            )

        category, _ = Category.objects.get_or_create(
            name=subscription.category,
            defaults={'image': f'/images/subscriptions/{subscription.category.lower().replace(" ", "-")}.jpg'}
        )
        product, _ = Product.objects.get_or_create(
            name=product_name,
            category=category,
            defaults={
                'price': subscription.total_price,
                'description': product_description,
                'image': category.image,
            },
        )

        order = Order.objects.create(
            user=user,
            total_amount=subscription.total_price,
            status='pending',
        )
        OrderItem.objects.create(
            order=order,
            product=product,
            quantity=1,
            price=subscription.total_price,
        )

        return Response({
            'id': order.id,
            'total_amount': order.total_amount,
            'message': 'Subscription order created',
        })
    except (User.DoesNotExist, Subscription.DoesNotExist) as e:
        return Response({'error': str(e)}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
def create_payment_intent(request):
    order_id = request.data.get('order_id')

    try:
        order = Order.objects.get(id=order_id)
        if order.status != 'pending':
            return Response({'error': 'Order not pending'}, status=status.HTTP_400_BAD_REQUEST)

        payment = Payment.objects.create(
            order=order,
            amount=order.total_amount,
            status=Payment.STATUS_PENDING,
        )
        return Response({
            'payment_id': payment.id,
            'amount': payment.amount,
            'status': payment.status,
        })
    except Order.DoesNotExist:
        return Response({'error': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
def confirm_payment(request):
    payment_id = request.data.get('payment_id')
    outcome = request.data.get('outcome')

    try:
        payment = Payment.objects.get(id=payment_id)
        if payment.status != Payment.STATUS_PENDING:
            return Response({'error': 'Payment already processed'}, status=status.HTTP_400_BAD_REQUEST)

        if outcome == 'success':
            payment.status = Payment.STATUS_PAID
            payment.order.status = 'paid'
        elif outcome == 'cod':
            payment.status = Payment.STATUS_COD
            payment.order.status = 'pending'
        else:
            payment.status = Payment.STATUS_FAILED
            payment.order.status = 'failed'

        payment.save()
        payment.order.save()

        return Response({'status': payment.status})
    except Payment.DoesNotExist:
        return Response({'error': 'Payment not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def get_user_orders(request, user_id):
    orders = Order.objects.filter(user_id=user_id).order_by('-created_at')
    serializer = OrderSerializer(orders, many=True)
    return Response(serializer.data)
