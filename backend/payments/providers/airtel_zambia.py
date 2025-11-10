"""
Airtel Zambia Mobile Money provider implementation
Handles payments via Airtel Money API
"""

from decimal import Decimal
from typing import Dict, Any
from .base import IPaymentProvider, PaymentRequest, PaymentStatusResponse, PaymentProviderError


class AirtelZambiaProvider(IPaymentProvider):
    """
    Airtel Zambia Mobile Money provider
    
    Supports Airtel Money transactions in Zambia.
    Handles phone numbers starting with +26097, +26077, +26057.
    """
    
    name = "airtel-zambia"
    country = "ZM"
    currency = "ZMW"
    
    def __init__(self):
        # TODO: Initialize Airtel Money API client when available
        self.api_client = None
    
    def supports(self, msisdn: str) -> bool:
        """
        Check if phone number is supported by Airtel Zambia
        
        Airtel Zambia prefixes: +26097, +26077, +26057
        """
        if not msisdn.startswith('+260'):
            return False
        
        # Extract network prefix (97, 77, 57)
        if len(msisdn) >= 8:
            prefix = msisdn[4:6]  # Characters after +260
            return prefix in ['97', '77', '57']
        
        return False
    
    def validate_phone_number(self, msisdn: str) -> bool:
        """Validate Airtel Zambia phone number format"""
        return (
            msisdn.startswith('+260') and 
            len(msisdn) == 13 and  # +260971234567 = 13 chars
            self.supports(msisdn)
        )
    
    def init_payment(self, request: PaymentRequest) -> Dict[str, Any]:
        """
        Initiate payment request via Airtel Money API
        
        Currently returns mock response until Airtel API is integrated
        """
        if not self.supports(request.sender):
            raise PaymentProviderError(f"Airtel Zambia does not support sender: {request.sender}")
        
        # TODO: Implement actual Airtel Money API integration
        # For now, return mock success for development
        return {
            "external_id": f"airtel-mock-{request.external_id}",
            "provider": self.name,
            "message": "Airtel Money payment request initiated (mock implementation)"
        }
    
    def get_payment_status(self, external_id: str) -> PaymentStatusResponse:
        """
        Check payment status via Airtel Money API
        
        Currently returns mock success until API is integrated
        """
        # TODO: Implement actual status checking
        return PaymentStatusResponse(
            external_id=external_id,
            provider_txn_id=f"airtel-txn-{external_id}",
            status="SUCCESS",
            failure_reason=None,
            raw_response={"status": "SUCCESS", "message": "Mock Airtel transaction"}
        )
    
    def get_balance(self) -> Dict[str, Any]:
        """
        Get Airtel account balance
        
        Currently returns mock balance until API is integrated
        """
        return {
            "balance": "1000.00",
            "currency": self.currency,
            "provider": self.name,
            "note": "Mock balance - Airtel API integration pending"
        }
    
    def send_money(self, request: PaymentRequest) -> Dict[str, Any]:
        """
        Send money via Airtel Money API
        
        Currently returns mock success until API is integrated
        """
        return {
            "external_id": f"airtel-disbursement-{request.external_id}",
            "provider": self.name,
            "message": "Airtel Money disbursement initiated (mock implementation)"
        }