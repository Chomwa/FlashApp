from rest_framework import viewsets, generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.db import models
from datetime import timedelta
from decimal import Decimal
import logging

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
            recipient_phone=payer_phone,
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