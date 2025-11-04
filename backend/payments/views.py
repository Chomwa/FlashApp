"""
Payment views using the new payment orchestrator architecture
Provides provider-agnostic payment endpoints that automatically route to the appropriate provider
"""

from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
import logging

# Import the new payment orchestrator
from .router import PaymentRouter
from .providers.base import PaymentProviderError

logger = logging.getLogger(__name__)


class MTNBalanceView(generics.GenericAPIView):
    """Get MTN account balance via payment orchestrator"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            balance = PaymentRouter.get_provider_balance("mtn-zambia")
            return Response(balance)
        except Exception as e:
            logger.error(f"Balance check error: {str(e)}")
            return Response(
                {'error': f'Service error: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class MTNSendView(generics.GenericAPIView):
    """Send money via payment orchestrator (provider-agnostic)"""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            amount = request.data.get('amount')
            recipient_phone = request.data.get('recipient_phone')
            external_id = request.data.get('external_id')
            message = request.data.get('message', '')

            if not all([amount, recipient_phone, external_id]):
                return Response(
                    {'error': 'amount, recipient_phone, and external_id are required'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Create payment request using router
            payment_request = PaymentRouter.create_payment_request(
                sender=request.user.phone_number,
                recipient=recipient_phone,
                amount=float(amount),
                currency="ZMW",
                note=message,
                external_id=external_id
            )

            # Route payment automatically
            result = PaymentRouter.send_payment(payment_request)
            
            return Response({
                'reference_id': result.get('external_id'),
                'provider': result.get('provider_used'),
                'message': result.get('message', 'Transfer initiated successfully')
            })

        except PaymentProviderError as e:
            logger.error(f"Payment provider error: {str(e)}")
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            logger.error(f"Send money error: {str(e)}")
            return Response(
                {'error': f'Service error: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class MTNReceiveView(generics.GenericAPIView):
    """Request payment via payment orchestrator"""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            amount = request.data.get('amount')
            payer_phone = request.data.get('payer_phone')
            external_id = request.data.get('external_id')
            message = request.data.get('message', '')

            if not all([amount, payer_phone, external_id]):
                return Response(
                    {'error': 'amount, payer_phone, and external_id are required'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Create payment request (from payer to current user)
            payment_request = PaymentRouter.create_payment_request(
                sender=payer_phone,
                recipient=request.user.phone_number,
                amount=float(amount),
                currency="ZMW",
                note=message,
                external_id=external_id
            )

            # Route payment request automatically
            result = PaymentRouter.send_payment(payment_request)
            
            return Response({
                'reference_id': result.get('external_id'),
                'provider': result.get('provider_used'),
                'message': result.get('message', 'Payment request sent successfully')
            })

        except PaymentProviderError as e:
            logger.error(f"Payment request error: {str(e)}")
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            logger.error(f"Request money error: {str(e)}")
            return Response(
                {'error': f'Service error: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class MTNStatusView(generics.GenericAPIView):
    """Check payment status via payment orchestrator"""
    permission_classes = [IsAuthenticated]

    def get(self, request, reference_id):
        try:
            # Use user's phone number to determine provider
            msisdn = request.user.phone_number
            
            status_result = PaymentRouter.check_payment_status(reference_id, msisdn)
            
            return Response({
                'external_id': status_result.external_id,
                'provider_txn_id': status_result.provider_txn_id,
                'status': status_result.status,
                'failure_reason': status_result.failure_reason,
                'raw_response': status_result.raw_response
            })

        except PaymentProviderError as e:
            logger.error(f"Status check error: {str(e)}")
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            logger.error(f"Status check error: {str(e)}")
            return Response(
                {'error': f'Service error: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class PaymentProvidersView(generics.GenericAPIView):
    """List available payment providers"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """Get list of available payment providers"""
        try:
            providers = PaymentRouter.list_providers()
            return Response({
                'providers': providers,
                'total': len(providers)
            })
        except Exception as e:
            logger.error(f"Provider list error: {str(e)}")
            return Response(
                {'error': f'Service error: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class ValidatePhoneView(generics.GenericAPIView):
    """Validate phone number and identify provider"""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            phone_number = request.data.get('phone_number')
            if not phone_number:
                return Response(
                    {'error': 'phone_number is required'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )

            validation_result = PaymentRouter.validate_phone_number(phone_number)
            return Response(validation_result)

        except Exception as e:
            logger.error(f"Phone validation error: {str(e)}")
            return Response(
                {'error': f'Service error: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )