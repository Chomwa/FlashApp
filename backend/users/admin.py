from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, UserProfile, UserContacts


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ('username', 'phone_number', 'full_name', 'is_phone_verified', 'is_active', 'created_at')
    list_filter = ('is_phone_verified', 'is_active', 'is_staff', 'created_at')
    search_fields = ('username', 'phone_number', 'full_name', 'email')
    ordering = ('-created_at',)
    
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Personal Info', {
            'fields': ('phone_number', 'full_name', 'avatar', 'default_currency')
        }),
        ('Verification', {
            'fields': ('is_phone_verified', 'pin_hash')
        }),
        ('Limits', {
            'fields': ('daily_limit',)
        }),
    )


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'country', 'is_kyc_verified', 'kyc_verified_at', 'created_at')
    list_filter = ('is_kyc_verified', 'country', 'created_at')
    search_fields = ('user__username', 'user__phone_number', 'id_number')
    readonly_fields = ('created_at', 'updated_at')


@admin.register(UserContacts)
class UserContactsAdmin(admin.ModelAdmin):
    list_display = ('user', 'contact_name', 'contact_phone', 'is_favorite', 'created_at')
    list_filter = ('is_favorite', 'created_at')
    search_fields = ('user__username', 'contact_name', 'contact_phone')
    readonly_fields = ('created_at', 'updated_at')