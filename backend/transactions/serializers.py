from rest_framework import serializers
from .models import Transaction, P2PTransaction, Wallet, TransactionFee


class TransactionSerializer(serializers.ModelSerializer):
    sender_name = serializers.CharField(source='sender.display_name', read_only=True)
    recipient_name = serializers.CharField(source='recipient.display_name', read_only=True)
    
    # Mobile app expects these fields
    type = serializers.SerializerMethodField()
    recipient = serializers.SerializerMethodField() 
    sender = serializers.SerializerMethodField()
    phone = serializers.SerializerMethodField()

    class Meta:
        model = Transaction
        fields = '__all__'
        read_only_fields = ('id', 'reference_id', 'status', 'provider_transaction_id', 
                          'provider_response', 'created_at', 'updated_at', 'completed_at')
    
    def get_type(self, obj):
        """Convert transaction type to mobile app format"""
        user = self.context.get('request').user if self.context.get('request') else None
        if not user:
            return 'unknown'
            
        if obj.sender == user:
            return 'sent'
        elif obj.recipient == user:
            return 'received'
        else:
            return 'other'
    
    def get_recipient(self, obj):
        """Get recipient name for sent transactions"""
        if obj.recipient:
            return obj.recipient.display_name
        return obj.recipient_phone
    
    def get_sender(self, obj):
        """Get sender name for received transactions"""
        if obj.sender:
            return obj.sender.display_name
        return 'Unknown'
    
    def get_phone(self, obj):
        """Get the other party's phone number"""
        user = self.context.get('request').user if self.context.get('request') else None
        if not user:
            return obj.recipient_phone
            
        if obj.sender == user:
            return obj.recipient_phone
        elif obj.recipient == user:
            return obj.sender.phone_number if obj.sender else 'Unknown'
        else:
            return obj.recipient_phone


class P2PTransactionSerializer(serializers.ModelSerializer):
    transaction = TransactionSerializer(read_only=True)

    class Meta:
        model = P2PTransaction
        fields = '__all__'
        read_only_fields = ('created_at', 'qr_code_data', 'qr_code_image')


class WalletSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.display_name', read_only=True)

    class Meta:
        model = Wallet
        fields = '__all__'
        read_only_fields = ('user', 'created_at', 'updated_at')


class SendMoneySerializer(serializers.Serializer):
    recipient_phone = serializers.CharField(max_length=20)
    amount = serializers.DecimalField(max_digits=12, decimal_places=2, min_value=1)
    description = serializers.CharField(max_length=500, required=False, allow_blank=True)

    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("Amount must be greater than 0")
        return value


class RequestMoneySerializer(serializers.Serializer):
    payer_phone = serializers.CharField(max_length=20)
    amount = serializers.DecimalField(max_digits=12, decimal_places=2, min_value=1)
    description = serializers.CharField(max_length=500, required=False, allow_blank=True)
    expires_in_hours = serializers.IntegerField(default=24, min_value=1, max_value=168)

    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("Amount must be greater than 0")
        return value