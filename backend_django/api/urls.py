from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CategoryViewSet, ProductViewSet, SubscriptionViewSet, signup, login, create_order, get_user_orders

router = DefaultRouter()
router.register(r'categories', CategoryViewSet)
router.register(r'products', ProductViewSet)
router.register(r'subscriptions', SubscriptionViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('auth/signup', signup),
    path('auth/login', login),
    path('orders', create_order),
    path('orders/<int:user_id>', get_user_orders),
]
