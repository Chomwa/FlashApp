import uuid
from decimal import Decimal
from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone
import qrcode
from io import BytesIO
import base64

User = get_user_model()


class TransactionStatus(models.TextChoices):
    PENDING = 'pending', 'Pending'
    PROCESSING = 'processing', 'Processing'
    COMPLETED = 'completed', 'Completed'
    FAILED = 'failed', 'Failed'
    CANCELLED = 'cancelled', 'Cancelled'
    DECLINED = 'declined', 'Declined'
    EXPIRED = 'expired', 'Expired'


class TransactionType(models.TextChoices):
    P2P_SEND = 'p2p_send', 'Send Money'
    P2P_RECEIVE = 'p2p_receive', 'Receive Money'
    TOP_UP = 'top_up', 'Top Up'
    WITHDRAWAL = 'withdrawal', 'Withdrawal'
    PAYMENT = 'payment', 'Payment'


class PaymentRail(models.TextChoices):
    MTN = 'MTN', 'MTN Mobile Money'
    AIRTEL = 'AIRTEL', 'Airtel Money'
    BANK = 'BANK', 'Bank Transfer'


class Transaction(models.Model):
    """Core transaction model for all Flash payment transactions"""
    
    # Identifiers
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    reference_id = models.CharField(max_length=100, unique=True)
    external_reference = models.CharField(max_length=100, null=True, blank=True)
    
    # Transaction details
    transaction_type = models.CharField(max_length=20, choices=TransactionType.choices)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    currency = models.CharField(max_length=3, default='ZMW')
    description = models.TextField(null=True, blank=True)
    
    # Parties
    sender = models.ForeignKey(
        User, 
        on_delete=models.PROTECT, 
        related_name='sent_transactions',
        null=True, blank=True
    )
    recipient = models.ForeignKey(
        User, 
        on_delete=models.PROTECT, 
        related_name='received_transactions',
        null=True, blank=True
    )
    recipient_phone = models.CharField(max_length=20, null=True, blank=True)  # For non-users
    
    # Status and metadata
    status = models.CharField(max_length=20, choices=TransactionStatus.choices, default=TransactionStatus.PENDING)
    failure_reason = models.TextField(null=True, blank=True)
    
    # Payment rail and provider details
    payment_rail = models.CharField(max_length=20, choices=PaymentRail.choices, default=PaymentRail.MTN)
    provider_transaction_id = models.CharField(max_length=200, null=True, blank=True)
    provider_response = models.JSONField(null=True, blank=True)
    
    # Fees
    fee_amount = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))
    total_amount = models.DecimalField(max_digits=12, decimal_places=2)  # amount + fee
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.transaction_type} - {self.amount} {self.currency} - {self.status}"

    def save(self, *args, **kwargs):
        if not self.reference_id:
            self.reference_id = self.generate_reference_id()
        self.total_amount = self.amount + self.fee_amount
        
        if self.status == TransactionStatus.COMPLETED and not self.completed_at:
            self.completed_at = timezone.now()
        
        super().save(*args, **kwargs)

    def generate_reference_id(self):
        """Generate unique reference ID"""
        return f"FL{timezone.now().strftime('%Y%m%d')}{uuid.uuid4().hex[:8].upper()}"

    @property
    def is_successful(self):
        return self.status == TransactionStatus.COMPLETED

    @property
    def is_pending(self):
        return self.status == TransactionStatus.PENDING

    @property
    def can_be_cancelled(self):
        return self.status in [TransactionStatus.PENDING, TransactionStatus.PROCESSING]


class P2PTransaction(models.Model):
    """Peer-to-peer transaction details"""
    
    transaction = models.OneToOneField(Transaction, on_delete=models.CASCADE, related_name='p2p_details')
    
    # QR Code for payment request
    qr_code_data = models.TextField(null=True, blank=True)
    qr_code_image = models.TextField(null=True, blank=True)  # Base64 encoded image
    
    # Payment request details
    is_payment_request = models.BooleanField(default=False)
    request_expires_at = models.DateTimeField(null=True, blank=True)
    
    # Contact information
    sender_name = models.CharField(max_length=200, null=True, blank=True)
    recipient_name = models.CharField(max_length=200, null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)

    def generate_qr_code(self):
        """Generate QR code for payment request"""
        if not self.qr_code_data:
            qr_data = {
                'type': 'flash_payment',
                'transaction_id': str(self.transaction.id),
                'amount': str(self.transaction.amount),
                'currency': self.transaction.currency,
                'recipient': self.recipient_name or self.transaction.recipient.display_name,
                'expires': self.request_expires_at.isoformat() if self.request_expires_at else None
            }
            self.qr_code_data = str(qr_data)
            
            # Generate QR code image
            qr = qrcode.QRCode(version=1, box_size=10, border=5)
            qr.add_data(self.qr_code_data)
            qr.make(fit=True)
            
            img = qr.make_image(fill_color="black", back_color="white")
            buffer = BytesIO()
            img.save(buffer, format='PNG')
            img_str = base64.b64encode(buffer.getvalue()).decode()
            self.qr_code_image = img_str
            
            self.save()

    def __str__(self):
        return f"P2P: {self.transaction.reference_id}"


class TransactionFee(models.Model):
    """Transaction fee structure"""
    
    transaction_type = models.CharField(max_length=20, choices=TransactionType.choices)
    min_amount = models.DecimalField(max_digits=12, decimal_places=2)
    max_amount = models.DecimalField(max_digits=12, decimal_places=2)
    
    # Fee calculation
    fixed_fee = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))
    percentage_fee = models.DecimalField(max_digits=5, decimal_places=4, default=Decimal('0.00'))  # 0.0150 = 1.5%
    
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['transaction_type', 'min_amount']

    def calculate_fee(self, amount):
        """Calculate fee for given amount"""
        percentage_amount = amount * (self.percentage_fee / 100)
        return self.fixed_fee + percentage_amount

    def __str__(self):
        return f"{self.transaction_type}: {self.min_amount}-{self.max_amount}"


class Wallet(models.Model):
    """User wallet for escrow and rewards only (no stored value)"""
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='wallet')
    escrow_balance = models.DecimalField(max_digits=15, decimal_places=2, default=Decimal('0.00'))
    rewards_balance = models.DecimalField(max_digits=15, decimal_places=2, default=Decimal('0.00'))
    currency = models.CharField(max_length=3, default='ZMW')
    
    # Limits based on KYC tier
    daily_limit = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('5000.00'))  # Tier 1 default
    daily_spent = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'))
    last_reset_date = models.DateField(auto_now_add=True)
    
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.display_name}: Escrow {self.escrow_balance}, Rewards {self.rewards_balance} {self.currency}"

    def can_spend(self, amount):
        """Check if user can spend the amount (based on daily limits)"""
        from django.conf import settings
        
        # Demo mode: No limits
        if settings.DEBUG:
            return self.is_active
        
        # Reset daily spent if new day
        today = timezone.now().date()
        if self.last_reset_date < today:
            self.daily_spent = Decimal('0.00')
            self.last_reset_date = today
            self.save()
        
        return (
            self.is_active and 
            (self.daily_spent + amount) <= self.daily_limit
        )

    def add_to_escrow(self, amount, description=""):
        """Add amount to escrow balance"""
        self.escrow_balance += amount
        self.save()

    def release_from_escrow(self, amount, description=""):
        """Release amount from escrow"""
        if self.escrow_balance < amount:
            raise ValueError("Insufficient escrow balance")
        self.escrow_balance -= amount
        self.save()

    def add_rewards(self, amount, description=""):
        """Add rewards to user balance"""
        self.rewards_balance += amount
        self.save()

    def spend_rewards(self, amount, description=""):
        """Spend from rewards balance"""
        if self.rewards_balance < amount:
            raise ValueError("Insufficient rewards balance")
        self.rewards_balance -= amount
        self.save()

    def debit(self, amount, description=""):
        """Track spending (payment orchestration - no actual debit from wallet)"""
        if not self.can_spend(amount):
            raise ValueError("Insufficient balance or daily limit exceeded")
        self.daily_spent += amount
        self.save()

    def credit(self, amount, description=""):
        """Credit to escrow balance (for incoming payments)"""
        self.escrow_balance += amount
        self.save()


class PendingClaim(models.Model):
    """Pending claims for unregistered recipients"""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    transaction = models.OneToOneField(Transaction, on_delete=models.CASCADE, related_name='pending_claim')
    recipient_phone = models.CharField(max_length=20)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    currency = models.CharField(max_length=3, default='ZMW')
    message = models.TextField(null=True, blank=True)
    
    # Claim details
    claim_token = models.CharField(max_length=64, unique=True)
    expires_at = models.DateTimeField()
    claimed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    claimed_at = models.DateTimeField(null=True, blank=True)
    
    # Invitation tracking
    invite_sent = models.BooleanField(default=False)
    invite_sent_at = models.DateTimeField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Pending: {self.amount} {self.currency} for {self.recipient_phone}"

    @property
    def is_expired(self):
        return timezone.now() > self.expires_at

    @property
    def is_claimed(self):
        return self.claimed_by is not None


class PaymentRequest(models.Model):
    """Request-to-Pay objects"""
    
    REQUEST_STATUS = [
        ('PENDING', 'Pending'),
        ('FULFILLED', 'Fulfilled'),
        ('DECLINED', 'Declined'),
        ('EXPIRED', 'Expired'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    reference_id = models.CharField(max_length=100, unique=True)
    
    # Request details
    requester = models.ForeignKey(User, on_delete=models.CASCADE, related_name='payment_requests_sent')
    payer_phone = models.CharField(max_length=20)
    payer = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='payment_requests_received')
    
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    currency = models.CharField(max_length=3, default='ZMW')
    message = models.TextField(null=True, blank=True)
    
    # Status
    status = models.CharField(max_length=20, choices=REQUEST_STATUS, default='PENDING')
    expires_at = models.DateTimeField()
    
    # Fulfillment
    fulfilled_transaction = models.ForeignKey(Transaction, on_delete=models.SET_NULL, null=True, blank=True)
    fulfilled_at = models.DateTimeField(null=True, blank=True)
    decline_reason = models.TextField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Request: {self.amount} {self.currency} from {self.payer_phone}"

    def save(self, *args, **kwargs):
        if not self.reference_id:
            self.reference_id = f"REQ{timezone.now().strftime('%Y%m%d')}{uuid.uuid4().hex[:8].upper()}"
        super().save(*args, **kwargs)

    @property
    def is_expired(self):
        return timezone.now() > self.expires_at


class Referral(models.Model):
    """Referral tracking for growth"""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    referrer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='referrals_sent')
    referred_phone = models.CharField(max_length=20)
    referred_user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='referrals_received')
    
    referral_code = models.CharField(max_length=16, unique=True)
    
    # Rewards
    referrer_reward = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))
    referred_reward = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))
    rewards_paid = models.BooleanField(default=False)
    
    # Tracking
    signup_completed = models.BooleanField(default=False)
    first_transaction_completed = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"Referral: {self.referrer.display_name} → {self.referred_phone}"

    def save(self, *args, **kwargs):
        if not self.referral_code:
            self.referral_code = f"FL{uuid.uuid4().hex[:6].upper()}"
        super().save(*args, **kwargs)