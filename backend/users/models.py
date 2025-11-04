from django.contrib.auth.models import AbstractUser
from django.db import models
import phonenumbers
from phonenumbers import NumberParseException


class User(AbstractUser):
    """Custom user model for Flash payment app"""
    
    # Personal information
    phone_number = models.CharField(max_length=20, unique=True, null=True, blank=True)
    full_name = models.CharField(max_length=200, null=True, blank=True)
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)
    
    # Account settings
    is_phone_verified = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    pin_hash = models.CharField(max_length=128, null=True, blank=True)
    
    # Payment preferences
    default_currency = models.CharField(max_length=3, default='ZMW')
    daily_limit = models.DecimalField(max_digits=10, decimal_places=2, default=25000)  # 25K ZMW (Tier 2)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.full_name or self.username or self.phone_number or f"User {self.id}"
    
    @property
    def display_name(self):
        """Return the best available display name"""
        return self.full_name or self.username or self.phone_number
    
    def clean_phone_number(self):
        """Validate and format phone number"""
        if self.phone_number:
            try:
                parsed = phonenumbers.parse(self.phone_number, "ZM")  # Default to Zambia
                if phonenumbers.is_valid_number(parsed):
                    self.phone_number = phonenumbers.format_number(parsed, phonenumbers.PhoneNumberFormat.E164)
                else:
                    raise ValueError("Invalid phone number")
            except NumberParseException:
                raise ValueError("Invalid phone number format")

    def save(self, *args, **kwargs):
        if self.phone_number:
            self.clean_phone_number()
        super().save(*args, **kwargs)


class UserProfile(models.Model):
    """Extended user profile information"""
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    date_of_birth = models.DateField(null=True, blank=True)
    address = models.TextField(null=True, blank=True)
    city = models.CharField(max_length=100, null=True, blank=True)
    country = models.CharField(max_length=100, default='Zambia')
    
    # KYC information
    id_number = models.CharField(max_length=50, null=True, blank=True)  # NRC number
    id_document = models.ImageField(upload_to='kyc/', null=True, blank=True)
    proof_of_address = models.ImageField(upload_to='kyc/poa/', null=True, blank=True)
    selfie_document = models.ImageField(upload_to='kyc/selfie/', null=True, blank=True)
    
    # KYC tiers
    kyc_tier = models.IntegerField(default=1, choices=[(1, 'Tier 1'), (2, 'Tier 2'), (3, 'Tier 3')])
    is_kyc_verified = models.BooleanField(default=False)
    kyc_verified_at = models.DateTimeField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Profile for {self.user.display_name}"


class UserContacts(models.Model):
    """User's saved contacts for easy transfers"""
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='contacts')
    contact_name = models.CharField(max_length=200)
    contact_phone = models.CharField(max_length=20)
    is_favorite = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ['user', 'contact_phone']
        ordering = ['-is_favorite', 'contact_name']

    def __str__(self):
        return f"{self.contact_name} ({self.contact_phone})"