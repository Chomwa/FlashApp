from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register('profile', views.UserProfileViewSet, basename='userprofile')
router.register('contacts', views.UserContactsViewSet, basename='usercontacts')

urlpatterns = [
    path('register/', views.RegisterView.as_view(), name='register'),
    path('login/', views.LoginView.as_view(), name='login'),
    path('logout/', views.LogoutView.as_view(), name='logout'),
    path('me/', views.CurrentUserView.as_view(), name='current-user'),
    path('send-otp/', views.SendOTPView.as_view(), name='send-otp'),
    path('verify-otp/', views.VerifyOTPView.as_view(), name='verify-otp'),
    
    # Profile Management
    path('update-profile/', views.UpdateProfileView.as_view(), name='update-profile'),
    path('change-pin/', views.ChangePinView.as_view(), name='change-pin'),
    path('security-settings/', views.SecuritySettingsView.as_view(), name='security-settings'),
    
    # Invite System
    path('invite-data/', views.InviteDataView.as_view(), name='invite-data'),
    path('send-invite/', views.SendInviteView.as_view(), name='send-invite'),
    path('validate-invite/', views.ValidateInviteView.as_view(), name='validate-invite'),
    
    path('', include(router.urls)),
]