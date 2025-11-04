from django.urls import path
from . import views

urlpatterns = [
    # Legacy MTN endpoints (now use payment orchestrator internally)
    path('mtn/balance/', views.MTNBalanceView.as_view(), name='mtn-balance'),
    path('mtn/send/', views.MTNSendView.as_view(), name='mtn-send'),
    path('mtn/receive/', views.MTNReceiveView.as_view(), name='mtn-receive'),
    path('mtn/status/<str:reference_id>/', views.MTNStatusView.as_view(), name='mtn-status'),
    
    # New payment orchestrator endpoints
    path('providers/', views.PaymentProvidersView.as_view(), name='payment-providers'),
    path('validate-phone/', views.ValidatePhoneView.as_view(), name='validate-phone'),
]