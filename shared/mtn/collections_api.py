import decimal
import logging
import uuid
from dataclasses import dataclass
from enum import Enum

import requests
import requests.auth
from django.conf import settings
from rest_framework import status, serializers

from .exceptions import MtnInvalidSetting, MtnUnexpectedResponseStatus

logger = logging.getLogger(__name__)


class MtnCollectionsAccessTokenResponseSerializer(serializers.Serializer):
    access_token = serializers.CharField()
    lifetime_seconds = serializers.IntegerField(source='expires_in')
    token_type = serializers.CharField()


class MtnPartyIdType(Enum):
    """Party ID types for MTN Mobile Money"""
    MSISDN = 'MSISDN'  # Mobile phone, validated according to ITU-T E.164
    EMAIL = 'EMAIL'    # Email address
    PARTY_CODE = 'PARTY_CODE'  # UUID


@dataclass
class MtnCollectionRequest:
    amount: decimal.Decimal
    currency: str
    external_id: str
    payer_party_id_type: MtnPartyIdType
    payer_party_id: str
    payer_message: str
    payee_note: str


class MtnCollectionsAPI:
    """MTN Mobile Money Collections API for receiving payments"""
    
    def __init__(self):
        # Primary subscription key
        self.mtn_primary_key = getattr(settings, 'MTN_COLLECTIONS_PRIMARY_KEY', None)
        self.mtn_sub_key = getattr(settings, 'MTN_COLLECTIONS_SUB_KEY', None)
        self.mtn_sub_key_alt = getattr(settings, 'MTN_COLLECTIONS_SUB_KEY_ALT', None)
        
        # Use the most specific key available
        self.subscription_key = self.mtn_sub_key or self.mtn_primary_key
        
        # API configuration
        self.mtn_user_id = getattr(settings, 'MTN_USER_ID', None)
        self.mtn_host_name = getattr(settings, 'MTN_HOST_NAME', 'sandbox.momodeveloper.mtn.com')
        self.mtn_api_key = getattr(settings, 'MTN_API_KEY', None)
        self.base_url = getattr(settings, 'MTN_COLLECTIONS_BASE_URL', 'https://sandbox.momodeveloper.mtn.com')
        self.target_env = getattr(settings, 'MTN_COLLECTIONS_TARGET_ENV', 'sandbox')
        
        # Validate required settings
        if not self.subscription_key:
            raise MtnInvalidSetting('MTN_COLLECTIONS_SUB_KEY or MTN_COLLECTIONS_PRIMARY_KEY required')
        if not self.mtn_user_id:
            raise MtnInvalidSetting('MTN_USER_ID required')
        if not self.mtn_api_key:
            raise MtnInvalidSetting('MTN_API_KEY required')
        
        logger.info(f"MTN Collections API initialized with subscription key: {self.subscription_key[:8]}...")

    def create_access_token(self):
        """Create access token for Collections API"""
        auth = requests.auth.HTTPBasicAuth(self.mtn_user_id, self.mtn_api_key)
        
        url = f'{self.base_url}/collection/token/'
        headers = {
            'Ocp-Apim-Subscription-Key': self.subscription_key,
            'Content-Type': 'application/json',
        }
        
        logger.info(f"Creating MTN Collections access token: {url}")
        response = requests.post(url, headers=headers, auth=auth)
        if response.status_code != status.HTTP_200_OK:
            logger.debug(f'Got an unexpected response: {response.content}')
            raise MtnUnexpectedResponseStatus(response.status_code, status.HTTP_200_OK)
        
        token_serializer = MtnCollectionsAccessTokenResponseSerializer(data=response.json())
        token_serializer.is_valid(raise_exception=True)
        return token_serializer.validated_data

    def request_to_pay(self, collection_request: MtnCollectionRequest):
        """Request payment from payer"""
        token_data = self.create_access_token()
        reference_id = str(uuid.uuid4())
        
        payload = {
            "amount": str(collection_request.amount),
            "currency": collection_request.currency,
            "externalId": collection_request.external_id,
            "payer": {
                "partyIdType": collection_request.payer_party_id_type.value,
                "partyId": collection_request.payer_party_id
            },
            "payerMessage": collection_request.payer_message,
            "payeeNote": collection_request.payee_note
        }
        
        url = f'{self.base_url}/collection/v1_0/requesttopay'
        headers = {
            'Authorization': f'Bearer {token_data["access_token"]}',
            'X-Reference-Id': reference_id,
            'X-Target-Environment': self.target_env,
            'Ocp-Apim-Subscription-Key': self.subscription_key,
            'Content-Type': 'application/json',
        }
        
        logger.info(f"Requesting payment: {url} with reference {reference_id}")
        response = requests.post(url, headers=headers, json=payload)
        
        if response.status_code != status.HTTP_202_ACCEPTED:
            logger.error(f'Payment request failed: {response.content}')
            raise MtnUnexpectedResponseStatus(response.status_code, status.HTTP_202_ACCEPTED)
        
        return reference_id

    def get_payment_status(self, reference_id: str):
        """Check payment status"""
        token_data = self.create_access_token()
        
        url = f'{self.base_url}/collection/v1_0/requesttopay/{reference_id}'
        headers = {
            'Authorization': f'Bearer {token_data["access_token"]}',
            'X-Target-Environment': self.target_env,
            'Ocp-Apim-Subscription-Key': self.subscription_key,
        }
        
        logger.info(f"Checking payment status: {url}")
        response = requests.get(url, headers=headers)
        
        if response.status_code != status.HTTP_200_OK:
            logger.error(f'Status check failed: {response.content}')
            raise MtnUnexpectedResponseStatus(response.status_code, status.HTTP_200_OK)
        
        return response.json()