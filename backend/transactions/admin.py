from django.contrib import admin
from .models import Transaction, P2PTransaction, TransactionFee, Wallet, PendingClaim, PaymentRequest, Referral


@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ('reference_id', 'transaction_type', 'payment_rail', 'amount', 'currency', 'status', 'sender', 'recipient', 'created_at')
    list_filter = ('transaction_type', 'payment_rail', 'status', 'currency', 'created_at')
    search_fields = ('reference_id', 'external_reference', 'sender__phone_number', 'recipient__phone_number')
    readonly_fields = ('id', 'reference_id', 'created_at', 'updated_at', 'completed_at')
    ordering = ['-created_at']


@admin.register(P2PTransaction)
class P2PTransactionAdmin(admin.ModelAdmin):
    list_display = ('transaction', 'is_payment_request', 'sender_name', 'recipient_name', 'created_at')
    list_filter = ('is_payment_request', 'created_at')
    search_fields = ('transaction__reference_id', 'sender_name', 'recipient_name')
    readonly_fields = ('created_at', 'qr_code_data', 'qr_code_image')


@admin.register(TransactionFee)
class TransactionFeeAdmin(admin.ModelAdmin):
    list_display = ('transaction_type', 'min_amount', 'max_amount', 'fixed_fee', 'percentage_fee', 'is_active')
    list_filter = ('transaction_type', 'is_active', 'created_at')
    ordering = ['transaction_type', 'min_amount']


@admin.register(Wallet)
class WalletAdmin(admin.ModelAdmin):
    list_display = ('user', 'escrow_balance', 'rewards_balance', 'currency', 'daily_limit', 'daily_spent', 'is_active', 'updated_at')
    list_filter = ('currency', 'is_active', 'created_at')
    search_fields = ('user__phone_number', 'user__full_name')
    readonly_fields = ('created_at', 'updated_at')


@admin.register(PendingClaim)
class PendingClaimAdmin(admin.ModelAdmin):
    list_display = ('transaction', 'recipient_phone', 'amount', 'currency', 'claimed_by', 'expires_at', 'created_at')
    list_filter = ('currency', 'claimed_by', 'expires_at', 'created_at')
    search_fields = ('recipient_phone', 'claim_token', 'transaction__reference_id')
    readonly_fields = ('claim_token', 'created_at')


@admin.register(PaymentRequest)
class PaymentRequestAdmin(admin.ModelAdmin):
    list_display = ('reference_id', 'requester', 'payer_phone', 'amount', 'currency', 'status', 'expires_at', 'created_at')
    list_filter = ('status', 'currency', 'expires_at', 'created_at')
    search_fields = ('reference_id', 'payer_phone', 'requester__phone_number')
    readonly_fields = ('reference_id', 'created_at', 'updated_at')


@admin.register(Referral)
class ReferralAdmin(admin.ModelAdmin):
    list_display = ('referral_code', 'referrer', 'referred_phone', 'referred_user', 'signup_completed', 'first_transaction_completed', 'rewards_paid', 'created_at')
    list_filter = ('signup_completed', 'first_transaction_completed', 'rewards_paid', 'created_at')
    search_fields = ('referral_code', 'referrer__phone_number', 'referred_phone')
    readonly_fields = ('referral_code', 'created_at')