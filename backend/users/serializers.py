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

    class Meta:
        model = User
        fields = ('phone_number', 'full_name', 'password', 'password_confirm')

    def validate(self, data):
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError("Passwords don't match")
        return data

    def create(self, validated_data):
        validated_data.pop('password_confirm')
        user = User.objects.create_user(
            username=validated_data['phone_number'],  # Use phone as username
            phone_number=validated_data['phone_number'],
            full_name=validated_data.get('full_name', ''),
            password=validated_data['password']
        )
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