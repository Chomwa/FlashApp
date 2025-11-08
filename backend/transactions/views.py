from rest_framework import viewsets, generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, permission_classes, action
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.db import models
from datetime import timedelta
from decimal import Decimal
import logging
import json
import qrcode
from io import BytesIO
import base64

from .models import Transaction, P2PTransaction, Wallet, TransactionType, TransactionStatus
from .serializers import (
    TransactionSerializer, P2PTransactionSerializer, WalletSerializer,
    SendMoneySerializer, RequestMoneySerializer
)

# Import the new payment orchestrator
from payments.router import PaymentRouter
from payments.providers.base import PaymentProviderError

logger = logging.getLogger(__name__)

User = get_user_model()


class TransactionViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = TransactionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Transaction.objects.filter(
            models.Q(sender=user) | models.Q(recipient=user)
        ).order_by('-created_at')


class P2PTransactionViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = P2PTransactionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return P2PTransaction.objects.filter(
            models.Q(transaction__sender=user) | models.Q(transaction__recipient=user)
        ).order_by('-created_at')

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        """Approve a payment request"""
        try:
            p2p_transaction = self.get_object()
            transaction = p2p_transaction.transaction
            
            # Verify this is a payment request that can be approved
            if not p2p_transaction.is_payment_request:
                return Response(
                    {'error': 'This is not a payment request'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Verify the current user is the one who should pay (sender)
            if transaction.sender != request.user:
                return Response(
                    {'error': 'You are not authorized to approve this request'},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            # Check if request is still pending
            if transaction.status != TransactionStatus.PENDING:
                return Response(
                    {'error': f'Request is already {transaction.status.lower()}'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Check if request has expired
            if p2p_transaction.request_expires_at and p2p_transaction.request_expires_at < timezone.now():
                transaction.status = TransactionStatus.EXPIRED
                transaction.save()
                return Response(
                    {'error': 'This payment request has expired'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Create a new send transaction to fulfill this request
            try:
                # Get sender wallet
                sender_wallet, _ = Wallet.objects.get_or_create(user=request.user)
                
                # Check if sender can spend
                if not sender_wallet.can_spend(transaction.amount):
                    return Response(
                        {'error': 'Insufficient balance or daily limit exceeded'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                
                # Route payment through payment orchestrator
                payment_request = PaymentRouter.create_payment_request(
                    sender=request.user.phone_number,
                    recipient=transaction.recipient_phone,
                    amount=float(transaction.amount),
                    currency=transaction.currency,
                    note=f"Fulfilling payment request: {transaction.description}",
                    external_id=transaction.reference_id
                )
                
                logger.info(f"Approving payment request: {request.user.phone_number} -> {transaction.recipient_phone}, Amount: {transaction.amount}")
                
                # Submit to payment provider via router
                payment_result = PaymentRouter.send_payment(payment_request)
                
                # Update transaction status
                transaction.status = TransactionStatus.PROCESSING
                transaction.provider_transaction_id = payment_result.get("external_id")
                transaction.payment_rail = payment_result.get("provider_used", "UNKNOWN").upper()
                transaction.provider_response = payment_result
                transaction.save()
                
                # Track spending in wallet
                sender_wallet.debit(transaction.amount, f"Payment to {transaction.recipient_phone}")
                
                # Credit recipient wallet if user exists (for tracking)
                if transaction.recipient:
                    recipient_wallet, _ = Wallet.objects.get_or_create(user=transaction.recipient)
                    recipient_wallet.credit(transaction.amount, f"Payment from {request.user.display_name}")
                
                return Response({
                    'message': 'Payment request approved and payment initiated',
                    'transaction_id': str(transaction.id),
                    'provider_reference': payment_result.get("external_id"),
                    'provider': payment_result.get("provider_used"),
                    'status': 'processing'
                }, status=status.HTTP_200_OK)
                
            except PaymentProviderError as e:
                logger.error(f"Payment provider error: {str(e)}")
                transaction.status = TransactionStatus.FAILED
                transaction.failure_reason = str(e)
                transaction.save()
                
                return Response(
                    {'error': f'Payment failed: {str(e)}'},
                    status=status.HTTP_400_BAD_REQUEST
                )
                
        except Exception as e:
            logger.error(f"Error approving payment request: {str(e)}")
            return Response(
                {'error': 'Failed to approve payment request'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=True, methods=['post'])
    def decline(self, request, pk=None):
        """Decline a payment request"""
        try:
            p2p_transaction = self.get_object()
            transaction = p2p_transaction.transaction
            
            # Verify this is a payment request that can be declined
            if not p2p_transaction.is_payment_request:
                return Response(
                    {'error': 'This is not a payment request'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Verify the current user is the one who should pay (sender)
            if transaction.sender != request.user:
                return Response(
                    {'error': 'You are not authorized to decline this request'},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            # Check if request is still pending
            if transaction.status != TransactionStatus.PENDING:
                return Response(
                    {'error': f'Request is already {transaction.status.lower()}'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Update transaction status
            reason = request.data.get('reason', 'Declined by user')
            transaction.status = TransactionStatus.DECLINED
            transaction.failure_reason = reason
            transaction.save()
            
            return Response({
                'message': 'Payment request declined',
                'transaction_id': str(transaction.id)
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Error declining payment request: {str(e)}")
            return Response(
                {'error': 'Failed to decline payment request'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class WalletView(generics.RetrieveAPIView):
    serializer_class = WalletSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        wallet, created = Wallet.objects.get_or_create(user=self.request.user)
        return wallet


class SendMoneyView(generics.CreateAPIView):
    serializer_class = SendMoneySerializer
    permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        sender = request.user
        recipient_phone = serializer.validated_data['recipient_phone']
        amount = serializer.validated_data['amount']
        description = serializer.validated_data.get('description', '')

        # Get or create sender wallet
        sender_wallet, _ = Wallet.objects.get_or_create(user=sender)

        # Check if sender can spend
        if not sender_wallet.can_spend(amount):
            return Response(
                {'error': 'Insufficient balance or daily limit exceeded'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Try to find recipient user
        try:
            recipient = User.objects.get(phone_number=recipient_phone)
        except User.DoesNotExist:
            recipient = None

        # Create transaction
        transaction = Transaction.objects.create(
            transaction_type=TransactionType.P2P_SEND,
            amount=amount,
            sender=sender,
            recipient=recipient,
            recipient_phone=recipient_phone,
            description=description,
            status=TransactionStatus.PROCESSING
        )

        # Create P2P details
        p2p_transaction = P2PTransaction.objects.create(
            transaction=transaction,
            sender_name=sender.display_name,
            recipient_name=recipient.display_name if recipient else recipient_phone
        )

        try:
            # Track spending in wallet (no actual debit - payment orchestration)
            sender_wallet.debit(amount, f"Send to {recipient_phone}")
            
            # Route payment through payment orchestrator
            payment_request = PaymentRouter.create_payment_request(
                sender=sender.phone_number,
                recipient=recipient_phone,
                amount=float(amount),
                currency="ZMW",
                note=description,
                external_id=transaction.reference_id
            )
            
            logger.info(f"Routing payment: {sender.phone_number} -> {recipient_phone}, Amount: {amount}")
            
            # Submit to payment provider via router
            payment_result = PaymentRouter.send_payment(payment_request)
            
            # Update transaction with provider details
            transaction.provider_transaction_id = payment_result.get("external_id")
            transaction.payment_rail = payment_result.get("provider_used", "UNKNOWN").upper()
            transaction.status = TransactionStatus.PROCESSING
            transaction.provider_response = payment_result
            transaction.save()
            
            # Credit recipient wallet if user exists (for tracking)
            if recipient:
                recipient_wallet, _ = Wallet.objects.get_or_create(user=recipient)
                recipient_wallet.credit(amount, f"Pending from {sender.display_name}")

            return Response({
                'transaction_id': str(transaction.id),
                'reference_id': transaction.reference_id,
                'provider_reference': payment_result.get("external_id"),
                'provider': payment_result.get("provider_used"),
                'status': 'processing',
                'message': payment_result.get("message", "Payment initiated successfully")
            }, status=status.HTTP_201_CREATED)

        except PaymentProviderError as e:
            logger.error(f"Payment provider error: {str(e)}")
            transaction.status = TransactionStatus.FAILED
            transaction.failure_reason = str(e)
            transaction.save()
            
            return Response(
                {'error': f'Payment failed: {str(e)}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            logger.error(f"Unexpected transaction error: {str(e)}")
            transaction.status = TransactionStatus.FAILED
            transaction.failure_reason = str(e)
            transaction.save()
            
            return Response(
                {'error': f'Transaction failed: {str(e)}'},
                status=status.HTTP_400_BAD_REQUEST
            )


class RequestMoneyView(generics.CreateAPIView):
    serializer_class = RequestMoneySerializer
    permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        recipient = request.user
        payer_phone = serializer.validated_data['payer_phone']
        amount = serializer.validated_data['amount']
        description = serializer.validated_data.get('description', '')
        expires_in_hours = serializer.validated_data['expires_in_hours']

        # Try to find payer user
        try:
            payer = User.objects.get(phone_number=payer_phone)
        except User.DoesNotExist:
            payer = None

        # Create transaction
        transaction = Transaction.objects.create(
            transaction_type=TransactionType.P2P_RECEIVE,
            amount=amount,
            sender=payer,
            recipient=recipient,
            recipient_phone=recipient.phone_number,
            description=description,
            status=TransactionStatus.PENDING
        )

        # Create P2P details with payment request
        expires_at = timezone.now() + timedelta(hours=expires_in_hours)
        p2p_transaction = P2PTransaction.objects.create(
            transaction=transaction,
            is_payment_request=True,
            request_expires_at=expires_at,
            sender_name=payer.display_name if payer else payer_phone,
            recipient_name=recipient.display_name
        )

        # Generate QR code
        p2p_transaction.generate_qr_code()

        return Response({
            'transaction': TransactionSerializer(transaction).data,
            'p2p_details': P2PTransactionSerializer(p2p_transaction).data,
            'qr_code': p2p_transaction.qr_code_image,
            'message': 'Payment request created successfully'
        }, status=status.HTTP_201_CREATED)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def generate_receive_qr_code(request):
    """
    Generate a QR code for the user to receive money.
    POST data:
    {
        "amount": "100.00" (optional),
        "message": "Payment for..." (optional)
    }
    """
    user = request.user
    amount = request.data.get('amount')
    message = request.data.get('message', '')
    
    # Create QR code data
    qr_data = {
        'type': 'flash_payment',
        'phone': user.phone_number,
        'name': user.full_name,
    }
    
    if amount:
        qr_data['amount'] = str(amount)
    
    if message:
        qr_data['message'] = message
    
    # Convert to JSON string
    qr_json = json.dumps(qr_data)
    
    # Generate QR code image
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=10,
        border=4,
    )
    qr.add_data(qr_json)
    qr.make(fit=True)
    
    img = qr.make_image(fill_color="black", back_color="white")
    
    # Convert to base64
    buffer = BytesIO()
    img.save(buffer, format='PNG')
    img_str = base64.b64encode(buffer.getvalue()).decode()
    
    return Response({
        'qr_code_data': qr_data,
        'qr_code_image': f'data:image/png;base64,{img_str}',
        'qr_code_base64': img_str
    })
