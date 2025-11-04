from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register('transactions', views.TransactionViewSet, basename='transaction')
router.register('p2p', views.P2PTransactionViewSet, basename='p2ptransaction')

urlpatterns = [
    path('wallet/', views.WalletView.as_view(), name='wallet'),
    path('send/', views.SendMoneyView.as_view(), name='send-money'),
    path('request/', views.RequestMoneyView.as_view(), name='request-money'),
    path('', include(router.urls)),
]