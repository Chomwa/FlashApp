# Flash Payment Orchestrator - Architecture Upgrade Plan

## Current vs Recommended Architecture

### ✅ What We Have (Good)
- Payment orchestration (no stored value)
- MTN Zambia integration 
- Comprehensive transaction tracking
- Professional mobile UI
- Real-time API integration

### 🚀 What We Should Add (Payment Orchestrator Pattern)

## 1. Unified Provider Interface

**Benefit**: Easy expansion to Airtel, banks, other countries

```python
# /backend/payments/providers/base.py
from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import Optional

@dataclass
class PaymentRequest:
    amount: float
    currency: str
    sender: str
    recipient: str
    note: Optional[str] = None
    external_id: str

@dataclass 
class PaymentStatusResponse:
    external_id: str
    provider_txn_id: Optional[str]
    status: str  # PENDING, SUCCESS, FAILED, EXPIRED
    raw_response: Optional[dict] = None

class IPaymentProvider(ABC):
    name: str
    country: str
    
    @abstractmethod
    def supports(self, msisdn: str) -> bool:
        pass
    
    @abstractmethod
    def init_payment(self, request: PaymentRequest) -> dict:
        pass
    
    @abstractmethod
    def get_payment_status(self, external_id: str) -> PaymentStatusResponse:
        pass
```

## 2. MTN Provider Refactor

**Benefit**: Standardized interface, easier testing, cleaner code

```python
# /backend/payments/providers/mtn_zambia.py
from .base import IPaymentProvider, PaymentRequest, PaymentStatusResponse

class MTNZambiaProvider(IPaymentProvider):
    name = "mtn-zambia"
    country = "ZM"
    
    def supports(self, msisdn: str) -> bool:
        return msisdn.startswith("+26097") or msisdn.startswith("+26076")
    
    def init_payment(self, request: PaymentRequest) -> dict:
        # Use our existing MTN Collections API
        mtn_api = MtnCollectionsAPI()
        mtn_request = MtnCollectionRequest(
            amount=request.amount,
            currency=request.currency,
            external_id=request.external_id,
            payer_party_id_type=MtnPartyIdType.MSISDN,
            payer_party_id=request.sender,
            payer_message=request.note or "Flash payment",
            payee_note="Incoming transfer"
        )
        
        reference_id = mtn_api.request_to_pay(mtn_request)
        return {"external_id": reference_id}
    
    def get_payment_status(self, external_id: str) -> PaymentStatusResponse:
        mtn_api = MtnCollectionsAPI()
        status_data = mtn_api.get_payment_status(external_id)
        
        status_map = {
            "PENDING": "PENDING",
            "SUCCESSFUL": "SUCCESS", 
            "FAILED": "FAILED"
        }
        
        return PaymentStatusResponse(
            external_id=external_id,
            provider_txn_id=status_data.get("financialTransactionId"),
            status=status_map.get(status_data.get("status"), "FAILED"),
            raw_response=status_data
        )
```

## 3. Payment Router

**Benefit**: Automatic provider selection, easy multi-provider support

```python
# /backend/payments/router.py
from .providers.mtn_zambia import MTNZambiaProvider
from .providers.base import IPaymentProvider, PaymentRequest

class PaymentRouter:
    providers = [
        MTNZambiaProvider(),
        # Future: AirtelZambiaProvider(),
        # Future: MTNGhanaProvider(),
    ]
    
    @classmethod
    def get_provider(cls, msisdn: str) -> IPaymentProvider:
        for provider in cls.providers:
            if provider.supports(msisdn):
                return provider
        raise ValueError(f"No payment provider supports {msisdn}")
    
    @classmethod
    def send_payment(cls, request: PaymentRequest):
        provider = cls.get_provider(request.sender)
        return provider.init_payment(request)
    
    @classmethod
    def check_status(cls, external_id: str, msisdn: str):
        provider = cls.get_provider(msisdn)
        return provider.get_payment_status(external_id)
```

## 4. Updated Transaction Views

**Benefit**: Cleaner code, easier testing, provider-agnostic

```python
# /backend/transactions/views.py (updated)
from payments.router import PaymentRouter
from payments.providers.base import PaymentRequest

class SendMoneyView(generics.CreateAPIView):
    def create(self, request, *args, **kwargs):
        # ... validation logic ...
        
        # Create payment request
        payment_request = PaymentRequest(
            amount=float(amount),
            currency="ZMW",
            sender=sender.phone_number,
            recipient=recipient_phone,
            note=description,
            external_id=transaction.reference_id
        )
        
        try:
            # Route through payment orchestrator
            result = PaymentRouter.send_payment(payment_request)
            
            transaction.provider_transaction_id = result["external_id"]
            transaction.status = TransactionStatus.PROCESSING
            transaction.save()
            
            return Response({
                'transaction_id': str(transaction.id),
                'reference_id': transaction.reference_id,
                'status': 'processing'
            })
            
        except Exception as e:
            transaction.status = TransactionStatus.FAILED
            transaction.failure_reason = str(e)
            transaction.save()
            raise
```

## Implementation Priority

### Phase 1: Foundation (1-2 days)
1. ✅ Create provider interface (`IPaymentProvider`)
2. ✅ Refactor MTN integration to use provider pattern
3. ✅ Create payment router
4. ✅ Update transaction views to use router

### Phase 2: Expansion Ready (Future)
1. 🔄 Add Airtel Zambia provider
2. 🔄 Add MTN Ghana/Nigeria providers  
3. 🔄 Add bank transfer providers
4. 🔄 Add multi-currency support

## Benefits of Upgrade

### ✅ Immediate Benefits
- **Cleaner Architecture**: Separation of concerns
- **Easier Testing**: Mock providers for unit tests
- **Better Error Handling**: Standardized error responses
- **Provider Agnostic**: Views don't know about specific providers

### 🚀 Future Benefits
- **Multi-Provider**: Add Airtel, banks, etc. easily
- **Multi-Country**: Expand to Ghana, Nigeria, Kenya
- **A/B Testing**: Route payments to different providers
- **Failover**: Automatic fallback if one provider fails

## Recommendation: **IMPLEMENT**

This architecture upgrade would:
1. **Strengthen our MVP** with cleaner, more maintainable code
2. **Position us for growth** across Africa
3. **Reduce technical debt** before scaling
4. **Improve testing** and reliability

The upgrade aligns perfectly with our payment orchestration vision and would make Flash a true "universal money movement layer" for Africa.