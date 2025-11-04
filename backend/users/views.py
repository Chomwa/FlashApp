from rest_framework import generics, viewsets, status
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import logout
from django.utils import timezone
from datetime import timedelta
import random
from .models import User, UserProfile, UserContacts
from .serializers import (
    UserSerializer, RegisterSerializer, LoginSerializer, 
    UserProfileSerializer, UserContactsSerializer
)


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = []

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        # Create auth token
        token, created = Token.objects.get_or_create(user=user)
        
        # Create user profile
        UserProfile.objects.create(user=user)
        
        return Response({
            'token': token.key,
            'user': UserSerializer(user).data
        }, status=status.HTTP_201_CREATED)


class LoginView(generics.GenericAPIView):
    serializer_class = LoginSerializer
    permission_classes = []

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        
        token, created = Token.objects.get_or_create(user=user)
        
        return Response({
            'token': token.key,
            'user': UserSerializer(user).data
        })


class LogoutView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        try:
            request.user.auth_token.delete()
        except:
            pass
        logout(request)
        return Response({'detail': 'Successfully logged out'})


class CurrentUserView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user


class UserProfileViewSet(viewsets.ModelViewSet):
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return UserProfile.objects.filter(user=self.request.user)

    def get_object(self):
        profile, created = UserProfile.objects.get_or_create(user=self.request.user)
        return profile


class UserContactsViewSet(viewsets.ModelViewSet):
    serializer_class = UserContactsSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return UserContacts.objects.filter(user=self.request.user)


class SendOTPView(generics.GenericAPIView):
    permission_classes = []

    def post(self, request, *args, **kwargs):
        phone_number = request.data.get('phone_number')
        if not phone_number:
            return Response(
                {'error': 'Phone number is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        # Generate 6-digit OTP
        otp_code = str(random.randint(100000, 999999))
        
        # In development, always use 123456 for easy testing
        from django.conf import settings
        debug_mode = getattr(settings, 'DEBUG', True)
            
        if debug_mode:
            otp_code = '123456'

        # Find or create user
        user, created = User.objects.get_or_create(
            phone_number=phone_number,
            defaults={
                'username': phone_number,
                'full_name': f'User {phone_number}',
                'is_phone_verified': False
            }
        )

        # Store OTP (in production, use proper OTP storage)
        # For now, we'll store it in a simple way
        user.first_name = otp_code  # Temporary storage (not recommended for production)
        user.last_login = timezone.now()  # Mark OTP creation time
        user.save()

        # In production, send SMS here
        # sms_service.send_otp(phone_number, otp_code)

        return Response({
            'message': 'OTP sent successfully',
            'expires_in': 300,  # 5 minutes
            'debug_code': otp_code if debug_mode else None
        })


class VerifyOTPView(generics.GenericAPIView):
    permission_classes = []

    def post(self, request, *args, **kwargs):
        phone_number = request.data.get('phone_number')
        otp_code = request.data.get('otp_code')
        full_name = request.data.get('full_name', '')

        if not phone_number or not otp_code:
            return Response(
                {'error': 'Phone number and OTP code are required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            user = User.objects.get(phone_number=phone_number)
            
            # Check if OTP matches (stored in first_name temporarily)
            stored_otp = user.first_name
            otp_created_at = user.last_login
            
            # Check if OTP is valid and not expired (5 minutes)
            if (stored_otp == otp_code and 
                otp_created_at and 
                timezone.now() - otp_created_at < timedelta(minutes=5)):
                
                # OTP is valid, authenticate user
                user.is_phone_verified = True
                if full_name:
                    user.full_name = full_name
                user.first_name = ''  # Clear OTP
                user.save()

                # Create auth token
                token, created = Token.objects.get_or_create(user=user)

                # Create user profile if it doesn't exist
                profile, created = UserProfile.objects.get_or_create(user=user)

                return Response({
                    'token': token.key,
                    'user': UserSerializer(user).data,
                    'is_new_user': not user.date_joined or (timezone.now() - user.date_joined < timedelta(minutes=1))
                })
            else:
                return Response(
                    {'error': 'Invalid or expired OTP code'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
                
        except User.DoesNotExist:
            return Response(
                {'error': 'User not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )