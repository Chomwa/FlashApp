from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import User, UserProfile, UserContacts


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'phone_number', 'full_name', 'email', 
                 'avatar', 'is_phone_verified', 'default_currency', 'created_at')
        read_only_fields = ('id', 'is_phone_verified', 'created_at')


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)
    password_confirm = serializers.CharField(write_only=True)
    otp_code = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = User
        fields = ('phone_number', 'full_name', 'password', 'password_confirm', 'otp_code')

    def validate(self, data):
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError("Passwords don't match")
        
        # Validate OTP if provided
        otp_code = data.get('otp_code')
        if otp_code:
            # For production testing: always accept 123456 as valid OTP
            if otp_code != '123456':
                # Try to find user with stored OTP
                phone_number = data.get('phone_number')
                try:
                    from django.utils import timezone
                    from datetime import timedelta
                    
                    user = User.objects.get(phone_number=phone_number)
                    stored_otp = user.first_name  # OTP stored temporarily in first_name
                    otp_created_at = user.last_login
                    
                    # Check if OTP is valid and not expired
                    if not (stored_otp == otp_code and 
                           otp_created_at and 
                           timezone.now() - otp_created_at < timedelta(minutes=5)):
                        raise serializers.ValidationError("Invalid or expired OTP code")
                        
                except User.DoesNotExist:
                    raise serializers.ValidationError("User not found for OTP validation")
        
        return data

    def create(self, validated_data):
        validated_data.pop('password_confirm')
        validated_data.pop('otp_code', None)  # Remove OTP code from user creation data
        
        phone_number = validated_data['phone_number']
        
        # Check if user already exists (from verify-otp workflow)
        try:
            user = User.objects.get(phone_number=phone_number)
            
            # User exists, update with registration data
            user.set_password(validated_data['password'])
            if validated_data.get('full_name'):
                user.full_name = validated_data['full_name']
            
            # Mark phone as verified if OTP was provided
            if 'otp_code' in self.initial_data:
                user.is_phone_verified = True
                user.first_name = ''  # Clear the stored OTP
                
            user.save()
            return user
            
        except User.DoesNotExist:
            # User doesn't exist, create new one
            user = User.objects.create_user(
                username=validated_data['phone_number'],  # Use phone as username
                phone_number=validated_data['phone_number'],
                full_name=validated_data.get('full_name', ''),
                password=validated_data['password']
            )
            
            # Mark phone as verified if OTP was provided
            if 'otp_code' in self.initial_data:
                user.is_phone_verified = True
                user.first_name = ''  # Clear the stored OTP
                user.save()
                
            return user


class LoginSerializer(serializers.Serializer):
    phone_number = serializers.CharField()
    password = serializers.CharField()

    def validate(self, data):
        phone_number = data.get('phone_number')
        password = data.get('password')

        if phone_number and password:
            # Try to authenticate with phone number as username
            user = authenticate(username=phone_number, password=password)
            if not user:
                # Try to find user by phone and authenticate
                try:
                    user_obj = User.objects.get(phone_number=phone_number)
                    user = authenticate(username=user_obj.username, password=password)
                except User.DoesNotExist:
                    pass
            
            if user:
                if not user.is_active:
                    raise serializers.ValidationError('User account is disabled.')
                data['user'] = user
            else:
                raise serializers.ValidationError('Invalid phone number or password.')
        else:
            raise serializers.ValidationError('Must include phone number and password.')

        return data


class UserProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = UserProfile
        fields = '__all__'
        read_only_fields = ('user', 'is_kyc_verified', 'kyc_verified_at', 'created_at', 'updated_at')


class UserContactsSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserContacts
        fields = '__all__'
        read_only_fields = ('user', 'created_at', 'updated_at')

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)