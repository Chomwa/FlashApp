import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, Share, ScrollView, ActivityIndicator } from 'react-native';
import { styled } from 'nativewind';
import { useRoute, useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import QRCode from 'react-native-qrcode-svg';
import { transactionsAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTouchableOpacity = styled(TouchableOpacity);
const StyledScrollView = styled(ScrollView);
const StyledSafeAreaView = styled(SafeAreaView);

// QR Code Component using existing working functionality
const QRCodeDisplay = ({ data, loading }: { data: any; loading: boolean }) => {
  if (loading) {
    return (
      <StyledView className="bg-white rounded-2xl p-4 items-center justify-center" style={{ width: 200, height: 200 }}>
        <ActivityIndicator size="large" color="#0EA5E9" />
        <StyledText className="text-navy/60 text-sm mt-2">Loading...</StyledText>
      </StyledView>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <StyledView className="bg-white rounded-2xl p-4">
      <QRCode
        value={JSON.stringify(data)}
        size={200}
        color="#02121B"
        backgroundColor="#FFFFFF"
      />
    </StyledView>
  );
};

interface RequestTrackingScreenProps {
  route: {
    params: {
      requestId: string;
      transactionId: string;
      amount: string;
      payerName: string;        // Person who will pay
      payerPhone: string;       // Phone of person who will pay  
      requesterName: string;    // Person requesting (current user)
      requesterPhone: string;   // Phone of requester (current user)
      qrCode?: string;
    };
  };
}

export default function RequestTrackingScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const { requestId, transactionId, amount, payerName, payerPhone, requesterName, requesterPhone, qrCode } = route.params;

  const [status, setStatus] = useState('pending');
  const [loading, setLoading] = useState(false);
  const [qrData, setQrData] = useState<any>(null);
  const [qrLoading, setQrLoading] = useState(true);

  useEffect(() => {
    // Load initial data
    loadQRData();
    
    // Poll for status updates every 30 seconds
    const interval = setInterval(() => {
      checkRequestStatus();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const loadQRData = async () => {
    try {
      setQrLoading(true);
      // Create QR data structure that matches backend format
      // FIRST PRINCIPLES: Current user requests money FROM payer
      const qrPayload = {
        type: 'flash_payment_request',
        transaction_id: transactionId,
        amount: amount,
        currency: user?.default_currency || 'ZMW',
        recipient: requesterName, // Current user will receive money
        recipient_phone: requesterPhone, // Current user's phone
        payer_phone: payerPhone, // The person who will pay
        payer_name: payerName, // Name of person who will pay
        description: `Payment request from ${requesterName} for ${amount}`
      };
      setQrData(qrPayload);
    } catch (error) {
      console.error('Error loading QR data:', error);
    } finally {
      setQrLoading(false);
    }
  };

  const checkRequestStatus = async () => {
    try {
      const response = await transactionsAPI.getTransaction(transactionId);
      setStatus(response.status);
    } catch (error) {
      console.error('Error checking status:', error);
    }
  };

  const shareRequest = async () => {
    try {
      // Use the same QR data structure as loadQRData function
      const qrDataToShare = JSON.stringify({
        type: 'flash_payment_request',
        transaction_id: transactionId,
        amount: amount,
        currency: user?.default_currency || 'ZMW',
        recipient: requesterName, // Current user will receive money
        recipient_phone: requesterPhone, // Current user's phone
        payer_phone: payerPhone, // The person who will pay
        payer_name: payerName, // Name of person who will pay
        description: `Payment request from ${requesterName} for ${amount}`
      });
      
      const currency = user?.default_currency || 'ZMW';
      const message = `Hi! ${requesterName} has sent you a Flash payment request for ${currency} ${amount}. 

Request Details:
• Amount: ${currency} ${amount}
• To: ${requesterName}
• Request ID: #${requestId ? String(requestId).slice(-8).toUpperCase() : 'N/A'}

Scan the QR code in Flash app to pay directly, or check your Flash app to approve the payment.

QR Data: ${qrDataToShare}`;
      
      await Share.share({
        message,
        title: 'Flash Payment Request',
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const cancelRequest = () => {
    Alert.alert(
      'Cancel Request',
      'Are you sure you want to cancel this payment request?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: () => {
            // TODO: Implement cancel request API
            navigation.goBack();
          },
        },
      ]
    );
  };

  const getStatusInfo = () => {
    switch (status) {
      case 'pending':
        return {
          icon: '⏳',
          color: 'text-amber',
          bgColor: 'bg-amber/10',
          borderColor: 'border-amber/20',
          title: 'Request Sent',
          description: `Waiting for ${payerName} to pay you`,
          actionText: 'Send Reminder',
        };
      case 'processing':
        return {
          icon: '🔄',
          color: 'text-sky',
          bgColor: 'bg-sky/10',
          borderColor: 'border-sky/20',
          title: 'Processing',
          description: 'Payment is being processed',
          actionText: null,
        };
      case 'completed':
        return {
          icon: '✅',
          color: 'text-emerald',
          bgColor: 'bg-emerald/10',
          borderColor: 'border-emerald/20',
          title: 'Completed',
          description: `${payerName} paid you ${user?.default_currency || 'ZMW'} ${amount}`,
          actionText: null,
        };
      case 'declined':
        return {
          icon: '❌',
          color: 'text-red-400',
          bgColor: 'bg-red-400/10',
          borderColor: 'border-red-400/20',
          title: 'Declined',
          description: `${payerName} declined to pay your request`,
          actionText: 'Send New Request',
        };
      case 'expired':
        return {
          icon: '⏰',
          color: 'text-white/60',
          bgColor: 'bg-white/5',
          borderColor: 'border-white/10',
          title: 'Expired',
          description: 'This request has expired',
          actionText: 'Send New Request',
        };
      default:
        return {
          icon: '❓',
          color: 'text-white/60',
          bgColor: 'bg-white/5',
          borderColor: 'border-white/10',
          title: 'Unknown',
          description: 'Status unknown',
          actionText: null,
        };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <StyledSafeAreaView className="flex-1 bg-navy">
      {/* Header */}
      <StyledView className="px-6 py-4 border-b border-white/10">
        <StyledText className="text-white text-xl font-semibold text-center">
          Request Status
        </StyledText>
      </StyledView>

      <StyledScrollView className="flex-1 px-6 py-8">
        {/* Status Card */}
        <StyledView className={`${statusInfo.bgColor} border ${statusInfo.borderColor} rounded-3xl p-8 mb-8 items-center`}>
          <StyledText className="text-6xl mb-4">{statusInfo.icon}</StyledText>
          
          <StyledText className={`${statusInfo.color} text-2xl font-bold mb-2`}>
            {statusInfo.title}
          </StyledText>
          <StyledText className="text-white/80 text-center mb-6 leading-6">
            {statusInfo.description}
          </StyledText>
          
          <StyledView className="items-center">
            <StyledText className="text-white/80 text-sm mb-2">Requested Amount</StyledText>
            <StyledText className="text-white text-3xl font-bold">
              {user?.default_currency || 'ZMW'} {amount}
            </StyledText>
          </StyledView>
        </StyledView>

        {/* Request Details */}
        <StyledView className="bg-white/5 border border-white/10 rounded-3xl p-6 mb-8">
          <StyledText className="text-white text-lg font-semibold mb-6">
            Request Details
          </StyledText>
          
          {/* Requesting From */}
          <StyledView className="flex-row justify-between items-center py-4 border-b border-white/10">
            <StyledText className="text-white/80 text-base">Requesting From</StyledText>
            <StyledView className="items-end">
              <StyledText className="text-white text-base font-medium">
                {payerName}
              </StyledText>
              <StyledText className="text-white/60 text-sm">
                {payerPhone}
              </StyledText>
            </StyledView>
          </StyledView>

          {/* Request ID */}
          <StyledView className="flex-row justify-between items-center py-4 border-b border-white/10">
            <StyledText className="text-white/80 text-base">Request ID</StyledText>
            <StyledText className="text-white text-base font-mono">
              #{requestId ? String(requestId).slice(-8).toUpperCase() : 'N/A'}
            </StyledText>
          </StyledView>
          
          {/* Created */}
          <StyledView className="flex-row justify-between items-center py-4">
            <StyledText className="text-white/80 text-base">Created</StyledText>
            <StyledText className="text-white text-base">Just now</StyledText>
          </StyledView>
        </StyledView>

        {/* QR Code Card */}
        {status === 'pending' && (
          <StyledView className="bg-white/5 border border-white/10 rounded-3xl p-6 mb-8 items-center">
            <StyledText className="text-white text-lg font-semibold mb-2">
              Share QR Code
            </StyledText>
            <StyledText className="text-white/80 text-center mb-6 leading-5">
              Share this QR code with {payerName} so they can pay you directly
            </StyledText>
            
            <StyledView className="mb-6">
              <QRCodeDisplay data={qrData} loading={qrLoading} />
            </StyledView>
            
            <StyledTouchableOpacity 
              className="bg-sky/20 border border-sky/30 rounded-xl px-6 py-3 flex-row items-center"
              onPress={shareRequest}
            >
              <StyledText className="text-sky text-lg mr-2">🔗</StyledText>
              <StyledText className="text-sky text-base font-medium">
                Share QR Code
              </StyledText>
            </StyledTouchableOpacity>
          </StyledView>
        )}
      </StyledScrollView>

      {/* Bottom Actions */}
      <StyledView className="px-6 py-6 bg-navy border-t border-white/10">
        {status === 'pending' && (
          <StyledView className="space-y-4">
            {statusInfo.actionText && (
              <StyledTouchableOpacity 
                className="bg-emerald rounded-2xl py-4"
                onPress={shareRequest}
              >
                <StyledText className="text-white text-center text-lg font-semibold">
                  {statusInfo.actionText}
                </StyledText>
              </StyledTouchableOpacity>
            )}
            
            <StyledTouchableOpacity 
              className="border border-white/20 rounded-2xl py-4"
              onPress={cancelRequest}
            >
              <StyledText className="text-white/80 text-center text-lg font-medium">
                Cancel Request
              </StyledText>
            </StyledTouchableOpacity>
          </StyledView>
        )}
        
        {(status === 'declined' || status === 'expired') && statusInfo.actionText && (
          <StyledTouchableOpacity 
            className="bg-emerald rounded-2xl py-4"
            onPress={() => navigation.navigate('SendMoney', { 
              recipient: { name: payerName, phone: payerPhone },
              prefilledAmount: amount 
            })}
          >
            <StyledText className="text-white text-center text-lg font-semibold">
              {statusInfo.actionText}
            </StyledText>
          </StyledTouchableOpacity>
        )}
        
        {status === 'completed' && (
          <StyledTouchableOpacity 
            className="bg-emerald rounded-2xl py-4"
            onPress={() => navigation.navigate('MainTabs', { screen: 'Home' })}
          >
            <StyledText className="text-white text-center text-lg font-semibold">
              Back to Home
            </StyledText>
          </StyledTouchableOpacity>
        )}
      </StyledView>
    </StyledSafeAreaView>
  );
}