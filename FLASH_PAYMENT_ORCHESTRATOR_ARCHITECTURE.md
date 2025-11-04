# Flash Payment Orchestrator - Correct Architecture

## Core Principle: Flash Never Holds Money

Flash is a **pure payment orchestrator** that facilitates mobile money transfers between users' existing wallets (MTN, Airtel, etc.) without ever holding or managing actual money.

## Real Money Flow

```
User A's MTN Wallet → MTN Mobile Money API → User B's MTN Wallet
                           ↑
                    Flash Backend
                 (orchestrates only)
```

## What Flash Does

1. **Payment Orchestration**: Send payment requests to mobile money providers
2. **Status Tracking**: Monitor if payments succeed/fail via provider APIs
3. **User Notifications**: Notify recipients when money is received
4. **Transaction History**: Show past orchestrated payments
5. **Better UX**: Simplified interface over complex USSD flows

## What Flash Does NOT Do

- ❌ Hold user money in Flash wallets
- ❌ Manage user balances 
- ❌ Store value like traditional digital wallets
- ❌ Process actual money transfers

## Correct Implementation

### Transaction Model
```python
class Transaction(models.Model):
    # Identity
    reference_id = models.CharField(unique=True)
    
    # Parties (for notification/history only)
    sender = models.ForeignKey(User)
    recipient_phone = models.CharField()
    
    # Payment Details
    amount = models.DecimalField()
    currency = models.CharField(default='ZMW')
    
    # Orchestration Status
    status = models.CharField()  # pending/processing/completed/failed
    provider_reference = models.CharField()  # MTN/Airtel transaction ID
    failure_reason = models.TextField(null=True)
    
    # NO BALANCE FIELDS - money stays in mobile money wallets
```

### Wallet Model (Tracking Only)
```python
class Wallet(models.Model):
    user = models.OneToOneField(User)
    
    # Limits only (not actual balances)
    daily_limit = models.DecimalField(default=5000)
    daily_spent = models.DecimalField(default=0)  # resets daily
    
    # NO balance fields - users check MTN/Airtel apps for actual money
    
    def can_send(self, amount):
        # Check daily limits only
        return (self.daily_spent + amount) <= self.daily_limit
        
    def track_send(self, amount):
        # Track spending for limits (not actual debit)
        self.daily_spent += amount
        self.save()
```

### Payment Flow
```python
def send_money(sender, recipient_phone, amount):
    # 1. Check daily limits
    if not sender.wallet.can_send(amount):
        raise ValueError("Daily limit exceeded")
    
    # 2. Create transaction record
    transaction = Transaction.objects.create(
        sender=sender,
        recipient_phone=recipient_phone,
        amount=amount,
        status='pending'
    )
    
    # 3. Orchestrate via mobile money API
    result = mtn_api.request_to_pay(
        payer=sender.phone_number,
        payee=recipient_phone,
        amount=amount,
        external_id=transaction.reference_id
    )
    
    # 4. Update transaction with provider reference
    transaction.provider_reference = result['reference_id']
    transaction.status = 'processing'
    transaction.save()
    
    # 5. Track for limits (not actual debit)
    sender.wallet.track_send(amount)
    
    # 6. User gets USSD prompt on their phone
    # 7. User approves with MTN PIN
    # 8. Money transfers directly between MTN wallets
    # 9. Flash receives status update via webhook/polling
    
    return transaction

def on_payment_success(transaction):
    # Update status
    transaction.status = 'completed'
    transaction.save()
    
    # Notify recipient
    send_push_notification(
        phone=transaction.recipient_phone,
        message=f"You received {transaction.amount} ZMW from {transaction.sender.name}"
    )
```

## User Experience

### User Checks Balance
- **Wrong**: Flash app shows wallet balance
- **Correct**: User checks MTN/Airtel app for real balance

### Transaction History
- Flash shows: "You sent 100 ZMW to Bob via MTN" (orchestration history)
- MTN app shows: Actual debit/credit in mobile money wallet

### Failed Payments
- Flash shows: "Payment failed - insufficient MTN balance"
- No money was ever in Flash system to "refund"

## Benefits of Correct Architecture

1. **Regulatory Compliance**: Flash doesn't need money transmitter licenses
2. **Security**: No money to steal from Flash
3. **User Trust**: Money stays in familiar MTN/Airtel wallets
4. **Scalability**: No reconciliation or settlement complexity
5. **Simplicity**: Pure orchestration layer

## Implementation Status

- ✅ MTN Collections API integration working
- ✅ Transaction orchestration functional
- ❌ **NEEDS FIX**: Remove wallet balance management
- ❌ **NEEDS FIX**: Implement pure tracking model
- ❌ **NEEDS FIX**: Update mobile app to not show Flash balances

Flash should be like "smart SMS" - making mobile money transfers easier without ever touching the actual money.