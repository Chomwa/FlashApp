"""
Base payment provider interface for Flash payment orchestrator
Enables easy integration of multiple payment rails (MTN, Airtel, Banks, etc.)
"""

from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import Optional, Dict, Any
from decimal import Decimal


@dataclass
class PaymentRequest:
    """Unified payment request structure for all providers"""
    amount: Decimal
    currency: str
    sender: str  # Phone number or identifier
    recipient: str  # Phone number or identifier
    note: Optional[str] = None
    external_id: str = None  # Our transaction reference
    

@dataclass
class PaymentStatusResponse:
    """Unified payment status response from providers"""
    external_id: str
    provider_txn_id: Optional[str] = None
    status: str = "PENDING"  # PENDING, SUCCESS, FAILED, EXPIRED
    failure_reason: Optional[str] = None
    raw_response: Optional[Dict[Any, Any]] = None


class PaymentProviderError(Exception):
    """Base exception for payment provider errors"""
    pass


class UnsupportedRecipientError(PaymentProviderError):
    """Raised when provider doesn't support the recipient"""
    pass


class PaymentProviderConnectionError(PaymentProviderError):
    """Raised when provider API is unreachable"""
    pass


class IPaymentProvider(ABC):
    """
    Abstract interface for payment providers
    
    Each payment provider (MTN, Airtel, Banks) implements this interface
    to provide a unified way to process payments across different rails.
    """
    
    name: str = ""
    country: str = ""
    currency: str = ""
    
    @abstractmethod
    def supports(self, msisdn: str) -> bool:
        """
        Check if this provider supports payments for the given phone number
        
        Args:
            msisdn: Phone number in E.164 format (e.g. +260971234567)
            
        Returns:
            True if provider can handle this phone number
        """
        pass
    
    @abstractmethod
    def init_payment(self, request: PaymentRequest) -> Dict[str, Any]:
        """
        Initiate a payment request with the provider
        
        Args:
            request: PaymentRequest with amount, sender, recipient, etc.
            
        Returns:
            Dict with at least 'external_id' key
            
        Raises:
            PaymentProviderError: If payment initiation fails
            UnsupportedRecipientError: If recipient not supported
        """
        pass
    
    @abstractmethod
    def get_payment_status(self, external_id: str) -> PaymentStatusResponse:
        """
        Check the status of a payment
        
        Args:
            external_id: The payment reference ID
            
        Returns:
            PaymentStatusResponse with current status
            
        Raises:
            PaymentProviderError: If status check fails
        """
        pass
    
    def get_balance(self) -> Dict[str, Any]:
        """
        Get account balance (optional for providers that support it)
        
        Returns:
            Dict with balance information
        """
        return {"balance": "0.00", "currency": self.currency}
    
    def validate_phone_number(self, msisdn: str) -> bool:
        """
        Validate phone number format for this provider
        
        Args:
            msisdn: Phone number to validate
            
        Returns:
            True if phone number is valid for this provider
        """
        return len(msisdn) > 10  # Basic validation, override in subclasses