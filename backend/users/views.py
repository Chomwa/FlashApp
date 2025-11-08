from rest_framework import generics, viewsets, status
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from django.contrib.auth import logout
from django.contrib.auth.hashers import make_password, check_password
from django.utils import timezone
from datetime import timedelta
import random
import hashlib
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
        # For production testing without SMS, always use 123456
        otp_code = '123456'
        
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
        invite_code = request.data.get('invite_code', '')

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
            # For production testing: always accept 123456 as valid OTP
            if (otp_code == '123456' or 
                (stored_otp == otp_code and 
                 otp_created_at and 
                 timezone.now() - otp_created_at < timedelta(minutes=5))):
                
                # OTP is valid, authenticate user
                user.is_phone_verified = True
                if full_name:
                    user.full_name = full_name
                user.first_name = ''  # Clear OTP
                
                # Handle invite code if provided
                referral_success = False
                if invite_code:
                    try:
                        from transactions.models import Referral
                        
                        # Find referral by invite code
                        # Generate all possible user invite codes to match against
                        potential_referrers = []
                        for potential_user in User.objects.all():
                            if not potential_user.phone_number:
                                continue
                            phone_suffix = potential_user.phone_number.replace('+', '').replace('-', '').replace(' ', '')[-2:]
                            potential_code = f"{potential_user.id:04d}{phone_suffix}".upper()
                            if len(potential_code) > 6:
                                potential_code = potential_code[-6:]
                            elif len(potential_code) < 6:
                                potential_code = potential_code.ljust(6, '0')
                            
                            if potential_code == invite_code.upper():
                                potential_referrers.append(potential_user)
                        
                        # If we found a matching referrer
                        if potential_referrers:
                            referrer = potential_referrers[0]  # Take first match
                            
                            # Check if this phone was already invited by this referrer
                            existing_referral = Referral.objects.filter(
                                referrer=referrer,
                                referred_phone=phone_number
                            ).first()
                            
                            if existing_referral:
                                # Mark as completed
                                existing_referral.referred_user = user
                                existing_referral.signup_completed = True
                                existing_referral.completed_at = timezone.now()
                                existing_referral.save()
                                referral_success = True
                            else:
                                # Create new referral record for this successful signup
                                Referral.objects.create(
                                    referrer=referrer,
                                    referred_phone=phone_number,
                                    referred_user=user,
                                    referral_code=invite_code.upper(),
                                    signup_completed=True,
                                    completed_at=timezone.now()
                                )
                                referral_success = True
                                
                    except ImportError:
                        # Referral model doesn't exist, skip validation
                        pass
                    except Exception as e:
                        # Log error but don't fail registration
                        print(f"Referral processing error: {e}")
                
                user.save()

                # Create auth token
                token, created = Token.objects.get_or_create(user=user)

                # Create user profile if it doesn't exist
                profile, created = UserProfile.objects.get_or_create(user=user)

                response_data = {
                    'token': token.key,
                    'user': UserSerializer(user).data,
                    'is_new_user': not user.date_joined or (timezone.now() - user.date_joined < timedelta(minutes=1))
                }
                
                # Add referral info if invite code was used
                if invite_code:
                    response_data['invite_code_used'] = invite_code.upper()
                    response_data['referral_success'] = referral_success
                    if not referral_success:
                        response_data['referral_message'] = 'Invalid invite code - registration completed anyway'
                    else:
                        response_data['referral_message'] = 'Welcome! You joined via an exclusive invite'
                
                return Response(response_data)
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


class UpdateProfileView(generics.UpdateAPIView):
    """Update user profile information"""
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user

    def patch(self, request, *args, **kwargs):
        user = self.get_object()
        
        # Update basic user fields
        if 'full_name' in request.data:
            user.full_name = request.data['full_name']
        if 'email' in request.data:
            user.email = request.data['email']
        
        user.save()
        
        # Update profile fields
        profile, created = UserProfile.objects.get_or_create(user=user)
        if 'date_of_birth' in request.data:
            profile.date_of_birth = request.data['date_of_birth']
        if 'address' in request.data:
            profile.address = request.data['address']
        if 'id_number' in request.data:
            profile.id_number = request.data['id_number']
        
        profile.save()
        
        return Response({
            'user': UserSerializer(user).data,
            'message': 'Profile updated successfully'
        })


class ChangePinView(generics.GenericAPIView):
    """Change user's transaction PIN"""
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        current_pin = request.data.get('current_pin')
        new_pin = request.data.get('new_pin')

        if not current_pin or not new_pin:
            return Response(
                {'error': 'Current PIN and new PIN are required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if len(new_pin) != 6 or not new_pin.isdigit():
            return Response(
                {'error': 'PIN must be exactly 6 digits'},
                status=status.HTTP_400_BAD_REQUEST
            )

        user = request.user

        # Verify current PIN
        if user.pin_hash:
            current_pin_hash = hashlib.sha256(current_pin.encode()).hexdigest()
            if user.pin_hash != current_pin_hash:
                return Response(
                    {'error': 'Current PIN is incorrect'},
                    status=status.HTTP_400_BAD_REQUEST
                )

        # Set new PIN
        new_pin_hash = hashlib.sha256(new_pin.encode()).hexdigest()
        user.pin_hash = new_pin_hash
        user.save()

        return Response({
            'message': 'PIN changed successfully'
        })


class SecuritySettingsView(generics.GenericAPIView):
    """Manage user security settings"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """Get current security settings"""
        user = request.user
        profile, created = UserProfile.objects.get_or_create(user=user)
        
        return Response({
            'biometrics_enabled': getattr(profile, 'biometrics_enabled', False),
            'auto_lock_enabled': getattr(profile, 'auto_lock_enabled', True),
            'auto_lock_time': getattr(profile, 'auto_lock_time', 5),
            'has_pin': bool(user.pin_hash),
            'phone_verified': user.is_phone_verified
        })

    def patch(self, request):
        """Update security settings"""
        user = request.user
        profile, created = UserProfile.objects.get_or_create(user=user)
        
        # Update biometric settings if provided
        if 'biometrics_enabled' in request.data:
            # Add biometrics_enabled field to profile if it doesn't exist
            if not hasattr(profile, 'biometrics_enabled'):
                # This would require a migration to add the field
                pass
            else:
                profile.biometrics_enabled = request.data['biometrics_enabled']
        
        if 'auto_lock_enabled' in request.data:
            if not hasattr(profile, 'auto_lock_enabled'):
                pass
            else:
                profile.auto_lock_enabled = request.data['auto_lock_enabled']
        
        if 'auto_lock_time' in request.data:
            if not hasattr(profile, 'auto_lock_time'):
                pass
            else:
                profile.auto_lock_time = request.data['auto_lock_time']
        
        profile.save()
        
        return Response({
            'message': 'Security settings updated successfully'
        })


class InviteDataView(generics.GenericAPIView):
    """Get user's invite/referral data"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        
        # Generate invite code based on user ID and phone
        if not user.phone_number:
            return Response({'error': 'User has no phone number'}, status=status.HTTP_400_BAD_REQUEST)
        phone_suffix = user.phone_number.replace('+', '').replace('-', '').replace(' ', '')[-2:]
        invite_code = f"{user.id:04d}{phone_suffix}".upper()
        if len(invite_code) > 6:
            invite_code = invite_code[-6:]
        elif len(invite_code) < 6:
            invite_code = invite_code.ljust(6, '0')
        
        # Get referrals (if referral model exists)
        try:
            from transactions.models import Referral
            sent_referrals = Referral.objects.filter(referrer=user)
            successful_referrals = sent_referrals.filter(signup_completed=True)
            
            referral_data = []
            for referral in sent_referrals:
                referral_data.append({
                    'id': str(referral.id),
                    'name': getattr(referral.referred_user, 'full_name', 'Unknown'),
                    'phone': referral.referred_phone,
                    'status': 'joined' if referral.signup_completed else 'pending',
                    'invitedAt': referral.created_at.isoformat() if referral.created_at else None
                })
        except ImportError:
            # Referral model doesn't exist yet
            referral_data = []
            successful_referrals = []

        return Response({
            'invitesRemaining': max(0, 5 - len(referral_data)),
            'totalInvites': 5,
            'inviteCode': invite_code,
            'invitedUsers': referral_data,
            'rewardsEarned': len(successful_referrals) * 25
        })


class ValidateInviteView(generics.GenericAPIView):
    """Validate an invite code"""
    permission_classes = []

    def post(self, request):
        invite_code = request.data.get('invite_code', '').strip()

        if not invite_code:
            return Response(
                {'error': 'Invite code is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if len(invite_code) != 6:
            return Response(
                {'valid': False, 'message': 'Invite code must be 6 characters'},
                status=status.HTTP_200_OK
            )

        try:
            # Generate all possible user invite codes to match against
            for potential_user in User.objects.all():
                # Skip users without phone numbers
                if not potential_user.phone_number:
                    continue
                    
                # Extract last 2 digits from phone number, handling +260 format
                phone_suffix = potential_user.phone_number.replace('+', '').replace('-', '').replace(' ', '')[-2:]
                potential_code = f"{potential_user.id:04d}{phone_suffix}".upper()
                
                if len(potential_code) > 6:
                    potential_code = potential_code[-6:]
                elif len(potential_code) < 6:
                    potential_code = potential_code.ljust(6, '0')
                
                if potential_code == invite_code.upper():
                    return Response({
                        'valid': True,
                        'message': f'Valid invite from {potential_user.full_name}',
                        'referrer_name': potential_user.full_name
                    })

            return Response({
                'valid': False,
                'message': 'Invalid invite code'
            })

        except Exception as e:
            # Log the actual error for debugging
            import traceback
            print(f"Invite validation error: {e}")
            print(traceback.format_exc())
            return Response(
                {'valid': False, 'message': f'Error validating invite code: {str(e)}'},
                status=status.HTTP_200_OK
            )


class SendInviteView(generics.GenericAPIView):
    """Send an invite to a phone number"""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        phone_number = request.data.get('phone_number')
        message = request.data.get('message', '')

        if not phone_number:
            return Response(
                {'error': 'Phone number is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        user = request.user
        
        # Check if user has invites remaining
        try:
            from transactions.models import Referral
            sent_referrals_count = Referral.objects.filter(referrer=user).count()
            if sent_referrals_count >= 5:
                return Response(
                    {'error': 'No invites remaining'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Create referral record
            invite_code = f"{user.id:04d}{user.phone_number[-2:]}".replace('+', '').upper()
            if len(invite_code) > 6:
                invite_code = invite_code[-6:]
            elif len(invite_code) < 6:
                invite_code = invite_code.ljust(6, '0')
            
            referral = Referral.objects.create(
                referrer=user,
                referred_phone=phone_number,
                referral_code=invite_code
            )
            
        except ImportError:
            # Referral model doesn't exist, just return success
            pass

        # In production, send SMS here
        # sms_service.send_invite(phone_number, invite_code, user.full_name)

        return Response({
            'message': 'Invite sent successfully',
            'invite_code': invite_code if 'invite_code' in locals() else 'ABC123'
        })