"""
MTN Zambia Mobile Money provider implementation
Handles payments via MTN MoMo Collections and Disbursement APIs
"""

import sys
import os
from decimal import Decimal
from typing import Dict, Any

# Add shared directory to Python path
shared_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../../shared'))
if shared_path not in sys.path:
    sys.path.insert(0, shared_path)

from .base import IPaymentProvider, PaymentRequest, PaymentStatusResponse, PaymentProviderError

try:
    from mtn.collections_api import MtnCollectionsAPI, MtnCollectionRequest, MtnPartyIdType
    from mtn.disbursement_api import MtnDisbursementAPI, MtnDisbursementRequest
    from mtn.exceptions import MtnException
except ImportError:
    # Fallback for development/testing
    class MtnException(Exception):
        pass
    
    class MtnCollectionsAPI:
        def request_to_pay(self, request):
            return 'mock-reference-id'
        
        def get_payment_status(self, reference_id):
            return {'status': 'SUCCESSFUL', 'financialTransactionId': 'mock-txn-id'}
    
    class MtnDisbursementAPI:
        def transfer(self, request):
            return 'mock-reference-id'
        
        def get_transfer_status(self, reference_id):
            return {'status': 'SUCCESSFUL', 'financialTransactionId': 'mock-txn-id'}
        
        def get_account_balance(self):
            return {'available_balance': '1000.00', 'currency': 'ZMW'}
    
    class MtnCollectionRequest:
        def __init__(self, **kwargs):
            pass
    
    class MtnDisbursementRequest:
        def __init__(self, **kwargs):
            pass
    
    class MtnPartyIdType:
        MSISDN = 'MSISDN'


class MTNZambiaProvider(IPaymentProvider):
    """
    MTN Zambia Mobile Money provider
    
    Supports MTN MoMo transactions in Zambia using Collections and Disbursement APIs.
    Handles phone numbers starting with +26096 and +26076.
    """
    
    name = "mtn-zambia"
    country = "ZM"
    currency = "ZMW"
    
    def __init__(self):
        self.collections_api = MtnCollectionsAPI()
        self.disbursement_api = MtnDisbursementAPI()
    
    def supports(self, msisdn: str) -> bool:
        """
        Check if phone number is supported by MTN Zambia
        
        MTN Zambia prefixes: +26096, +26076
        """
        if not msisdn.startswith('+260'):
            return False
        
        # Extract network prefix (96, 76)
        if len(msisdn) >= 8:
            prefix = msisdn[4:6]  # Characters after +260 (2 digits)
            return prefix in ['96', '76']
        
        return False
    
    def validate_phone_number(self, msisdn: str) -> bool:
        """Validate MTN Zambia phone number format"""
        return (
            msisdn.startswith('+260') and 
            len(msisdn) == 13 and  # +260963254253 = 13 chars
            self.supports(msisdn)
        )
    
    def init_payment(self, request: PaymentRequest) -> Dict[str, Any]:
        """
        Initiate payment request via MTN Collections API
        
        This creates a request-to-pay that the sender must approve in their MTN MoMo app/USSD
        """
        if not self.supports(request.sender):
            raise PaymentProviderError(f"MTN Zambia does not support sender: {request.sender}")
        
        try:
            # Create MTN Collections request
            mtn_request = MtnCollectionRequest(
                amount=request.amount,
                currency=request.currency,
                external_id=request.external_id,
                payer_party_id_type=MtnPartyIdType.MSISDN,
                payer_party_id=request.sender,
                payer_message=request.note or "Flash payment",
                payee_note="Incoming transfer via Flash"
            )
            
            # Submit to MTN API
            reference_id = self.collections_api.request_to_pay(mtn_request)
            
            return {
                "external_id": reference_id,
                "provider": self.name,
                "message": "Payment request sent to MTN MoMo. User will receive USSD prompt to approve."
            }
            
        except MtnException as e:
            raise PaymentProviderError(f"MTN API error: {str(e)}")
        except Exception as e:
            raise PaymentProviderError(f"Unexpected error: {str(e)}")
    
    def get_payment_status(self, external_id: str) -> PaymentStatusResponse:
        """
        Check payment status via MTN Collections API
        """
        try:
            status_data = self.collections_api.get_payment_status(external_id)
            
            # Map MTN status to our unified status
            status_map = {
                "PENDING": "PENDING",
                "SUCCESSFUL": "SUCCESS",
                "FAILED": "FAILED",
                "TIMEOUT": "EXPIRED"
            }
            
            mtn_status = status_data.get("status", "UNKNOWN")
            unified_status = status_map.get(mtn_status, "FAILED")
            
            return PaymentStatusResponse(
                external_id=external_id,
                provider_txn_id=status_data.get("financialTransactionId"),
                status=unified_status,
                failure_reason=status_data.get("reason") if unified_status == "FAILED" else None,
                raw_response=status_data
            )
            
        except MtnException as e:
            return PaymentStatusResponse(
                external_id=external_id,
                status="FAILED",
                failure_reason=f"MTN API error: {str(e)}"
            )
        except Exception as e:
            return PaymentStatusResponse(
                external_id=external_id,
                status="FAILED", 
                failure_reason=f"Unexpected error: {str(e)}"
            )
    
    def get_balance(self) -> Dict[str, Any]:
        """
        Get MTN account balance via Disbursement API
        """
        try:
            balance_data = self.disbursement_api.get_account_balance()
            return {
                "balance": balance_data.get("available_balance", "0.00"),
                "currency": balance_data.get("currency", self.currency),
                "provider": self.name
            }
        except Exception as e:
            return {
                "balance": "0.00",
                "currency": self.currency,
                "error": str(e),
                "provider": self.name
            }
    
    def send_money(self, request: PaymentRequest) -> Dict[str, Any]:
        """
        Send money via MTN Disbursement API (for outgoing transfers)
        
        This is for when Flash needs to send money TO users (disbursements)
        """
        try:
            mtn_request = MtnDisbursementRequest(
                amount=request.amount,
                currency=request.currency,
                external_id=request.external_id,
                payee_party_id_type=MtnPartyIdType.MSISDN,
                payee_party_id=request.recipient,
                payer_message=request.note or "Flash transfer",
                payee_note="Money from Flash"
            )
            
            reference_id = self.disbursement_api.transfer(mtn_request)
            
            return {
                "external_id": reference_id,
                "provider": self.name,
                "message": "Disbursement initiated to MTN MoMo"
            }
            
        except MtnException as e:
            raise PaymentProviderError(f"MTN disbursement error: {str(e)}")
        except Exception as e:
            raise PaymentProviderError(f"Unexpected disbursement error: {str(e)}")