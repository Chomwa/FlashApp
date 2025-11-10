"""
Payment Router - The core orchestrator for Flash payment platform

This router automatically selects the appropriate payment provider based on
phone numbers and handles all payment operations through a unified interface.
"""

import logging
from typing import List, Optional, Dict, Any
from decimal import Decimal

from .providers.base import IPaymentProvider, PaymentRequest, PaymentStatusResponse, PaymentProviderError
from .providers.mtn_zambia import MTNZambiaProvider
from .providers.airtel_zambia import AirtelZambiaProvider

logger = logging.getLogger(__name__)


class PaymentRouter:
    """
    Central payment orchestrator for Flash
    
    Automatically routes payments to the appropriate provider based on
    phone number patterns. Supports multiple providers and easy expansion.
    """
    
    # Registry of all available payment providers
    _providers: List[IPaymentProvider] = [
        MTNZambiaProvider(),
        AirtelZambiaProvider(),
        # Future providers will be added here:
        # MTNGhanaProvider(),
        # StandardBankProvider(),
    ]
    
    @classmethod
    def get_provider(cls, msisdn: str) -> Optional[IPaymentProvider]:
        """
        Find the appropriate payment provider for a phone number
        
        Args:
            msisdn: Phone number in E.164 format (e.g. +260971234567)
            
        Returns:
            Provider that supports this phone number, or None if none found
        """
        for provider in cls._providers:
            if provider.supports(msisdn):
                logger.info(f"Selected provider {provider.name} for {msisdn}")
                return provider
        
        logger.warning(f"No provider found for {msisdn}")
        return None
    
    @classmethod
    def get_provider_by_name(cls, provider_name: str) -> Optional[IPaymentProvider]:
        """
        Get provider by name
        
        Args:
            provider_name: Name of the provider (e.g. 'mtn-zambia')
            
        Returns:
            Provider instance or None if not found
        """
        for provider in cls._providers:
            if provider.name == provider_name:
                return provider
        return None
    
    @classmethod
    def list_providers(cls) -> List[Dict[str, str]]:
        """
        Get list of all available providers
        
        Returns:
            List of provider info dicts
        """
        return [
            {
                "name": provider.name,
                "country": provider.country,
                "currency": provider.currency
            }
            for provider in cls._providers
        ]
    
    @classmethod
    def send_payment(cls, request: PaymentRequest) -> Dict[str, Any]:
        """
        Route payment to appropriate provider
        
        Args:
            request: PaymentRequest with sender, recipient, amount, etc.
            
        Returns:
            Dict with payment initiation result
            
        Raises:
            PaymentProviderError: If no provider or payment fails
        """
        # Find provider for sender's phone number
        provider = cls.get_provider(request.sender)
        if not provider:
            available_providers = [p.name for p in cls._providers]
            raise PaymentProviderError(
                f"No payment provider supports sender {request.sender}. "
                f"Available providers: {available_providers}"
            )
        
        logger.info(f"Routing payment via {provider.name}: {request.sender} -> {request.recipient}")
        
        try:
            result = provider.init_payment(request)
            result["provider_used"] = provider.name
            return result
            
        except PaymentProviderError:
            raise  # Re-raise provider errors as-is
        except Exception as e:
            logger.error(f"Unexpected error in {provider.name}: {str(e)}")
            raise PaymentProviderError(f"Payment failed: {str(e)}")
    
    @classmethod
    def check_payment_status(cls, external_id: str, msisdn: str) -> PaymentStatusResponse:
        """
        Check payment status using appropriate provider
        
        Args:
            external_id: Payment reference ID
            msisdn: Phone number to determine which provider to use
            
        Returns:
            PaymentStatusResponse with current status
            
        Raises:
            PaymentProviderError: If no provider or status check fails
        """
        provider = cls.get_provider(msisdn)
        if not provider:
            raise PaymentProviderError(f"No provider found for status check: {msisdn}")
        
        try:
            return provider.get_payment_status(external_id)
        except Exception as e:
            logger.error(f"Status check failed for {external_id} via {provider.name}: {str(e)}")
            return PaymentStatusResponse(
                external_id=external_id,
                status="FAILED",
                failure_reason=f"Status check error: {str(e)}"
            )
    
    @classmethod
    def get_provider_balance(cls, provider_name: str) -> Dict[str, Any]:
        """
        Get balance from specific provider
        
        Args:
            provider_name: Name of provider to check
            
        Returns:
            Balance information dict
        """
        provider = cls.get_provider_by_name(provider_name)
        if not provider:
            return {"error": f"Provider {provider_name} not found"}
        
        try:
            return provider.get_balance()
        except Exception as e:
            logger.error(f"Balance check failed for {provider_name}: {str(e)}")
            return {"error": str(e), "provider": provider_name}
    
    @classmethod
    def validate_phone_number(cls, msisdn: str) -> Dict[str, Any]:
        """
        Validate phone number and identify supporting provider
        
        Args:
            msisdn: Phone number to validate
            
        Returns:
            Dict with validation result and provider info
        """
        provider = cls.get_provider(msisdn)
        
        if provider:
            is_valid = provider.validate_phone_number(msisdn)
            return {
                "valid": is_valid,
                "provider": provider.name,
                "country": provider.country,
                "currency": provider.currency
            }
        else:
            return {
                "valid": False,
                "provider": None,
                "reason": "No provider supports this phone number"
            }
    
    @classmethod
    def create_payment_request(
        cls, 
        sender: str, 
        recipient: str, 
        amount: float, 
        currency: str = "ZMW",
        note: str = None,
        external_id: str = None
    ) -> PaymentRequest:
        """
        Helper to create a standardized PaymentRequest
        
        Args:
            sender: Sender phone number
            recipient: Recipient phone number  
            amount: Amount to send
            currency: Currency code (default ZMW)
            note: Optional message
            external_id: Transaction reference
            
        Returns:
            PaymentRequest object ready for routing
        """
        return PaymentRequest(
            amount=Decimal(str(amount)),
            currency=currency,
            sender=sender,
            recipient=recipient,
            note=note,
            external_id=external_id
        )