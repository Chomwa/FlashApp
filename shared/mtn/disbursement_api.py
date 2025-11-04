import decimal
import logging
import uuid
from dataclasses import dataclass

import requests
import requests.auth
from django.conf import settings
from rest_framework import status, serializers

from .exceptions import MtnInvalidSetting, MtnUnexpectedResponseStatus

logger = logging.getLogger(__name__)


class MtnDisbursementAccessTokenResponseSerializer(serializers.Serializer):
    access_token = serializers.CharField()
    token_type = serializers.CharField()
    lifetime_seconds = serializers.IntegerField(source='expires_in')


class MtnDisbursementAccountBalanceResponseSerializer(serializers.Serializer):
    available_balance = serializers.DecimalField(max_digits=10, decimal_places=2)
    currency = serializers.CharField()


@dataclass
class MtnDisbursementRequest:
    amount: decimal.Decimal
    currency: str
    external_id: str
    payee_party_id: str  # Mobile number or account ID
    payer_message: str
    payee_note: str


class MtnDisbursementAPI:
    """MTN Mobile Money Disbursement API for sending payments"""
    
    def __init__(self):
        self.mtn_primary_key = settings.MTN_DISBURSEMENT_PRIMARY_KEY
        self.mtn_user_id = settings.MTN_USER_ID
        self.mtn_host_name = settings.MTN_HOST_NAME
        self.mtn_api_key = settings.MTN_API_KEY

        if not self.mtn_primary_key:
            raise MtnInvalidSetting('MTN_DISBURSEMENT_PRIMARY_KEY')
        if not self.mtn_user_id:
            raise MtnInvalidSetting('MTN_USER_ID')
        if not self.mtn_host_name:
            raise MtnInvalidSetting('MTN_HOST_NAME')
        if not self.mtn_api_key:
            raise MtnInvalidSetting('MTN_API_KEY')

    def create_access_token(self):
        """Create access token for Disbursement API"""
        auth = requests.auth.HTTPBasicAuth(self.mtn_user_id, self.mtn_api_key)
        response = requests.post(
            f'https://{self.mtn_host_name}/disbursement/token/',
            headers={
                'Ocp-Apim-Subscription-Key': self.mtn_primary_key,
                'Content-Type': 'application/json',
            },
            auth=auth,
        )
        if response.status_code != status.HTTP_200_OK:
            logger.debug(f'Got an unexpected response: {response.content}')
            raise MtnUnexpectedResponseStatus(response.status_code, status.HTTP_200_OK)
        
        token_serializer = MtnDisbursementAccessTokenResponseSerializer(data=response.json())
        token_serializer.is_valid(raise_exception=True)
        return token_serializer.validated_data

    def get_account_balance(self, target_environment='sandbox'):
        """Get account balance"""
        token_data = self.create_access_token()
        
        response = requests.get(
            f'https://{self.mtn_host_name}/disbursement/v1_0/account/balance',
            headers={
                'Authorization': f'Bearer {token_data["access_token"]}',
                'X-Target-Environment': target_environment,
                'Ocp-Apim-Subscription-Key': self.mtn_primary_key,
            }
        )
        
        if response.status_code != status.HTTP_200_OK:
            logger.error(f'Balance check failed: {response.content}')
            raise MtnUnexpectedResponseStatus(response.status_code, status.HTTP_200_OK)
        
        serializer = MtnDisbursementAccountBalanceResponseSerializer(data=response.json())
        serializer.is_valid(raise_exception=True)
        return serializer.validated_data

    def transfer(self, disbursement_request: MtnDisbursementRequest):
        """Send money to payee"""
        token_data = self.create_access_token()
        reference_id = str(uuid.uuid4())
        
        payload = {
            "amount": str(disbursement_request.amount),
            "currency": disbursement_request.currency,
            "externalId": disbursement_request.external_id,
            "payee": {
                "partyIdType": "MSISDN",
                "partyId": disbursement_request.payee_party_id
            },
            "payerMessage": disbursement_request.payer_message,
            "payeeNote": disbursement_request.payee_note
        }
        
        response = requests.post(
            f'https://{self.mtn_host_name}/disbursement/v1_0/transfer',
            headers={
                'Authorization': f'Bearer {token_data["access_token"]}',
                'X-Reference-Id': reference_id,
                'X-Target-Environment': 'sandbox',
                'Ocp-Apim-Subscription-Key': self.mtn_primary_key,
                'Content-Type': 'application/json',
            },
            json=payload
        )
        
        if response.status_code != status.HTTP_202_ACCEPTED:
            logger.error(f'Transfer failed: {response.content}')
            raise MtnUnexpectedResponseStatus(response.status_code, status.HTTP_202_ACCEPTED)
        
        return reference_id

    def get_transfer_status(self, reference_id: str):
        """Check transfer status"""
        token_data = self.create_access_token()
        
        response = requests.get(
            f'https://{self.mtn_host_name}/disbursement/v1_0/transfer/{reference_id}',
            headers={
                'Authorization': f'Bearer {token_data["access_token"]}',
                'X-Target-Environment': 'sandbox',
                'Ocp-Apim-Subscription-Key': self.mtn_primary_key,
            }
        )
        
        if response.status_code != status.HTTP_200_OK:
            logger.error(f'Transfer status check failed: {response.content}')
            raise MtnUnexpectedResponseStatus(response.status_code, status.HTTP_200_OK)
        
        return response.json()