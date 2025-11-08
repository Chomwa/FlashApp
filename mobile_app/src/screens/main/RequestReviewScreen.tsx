import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { styled } from 'nativewind';
import { useNavigation, useRoute } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { transactionsAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTouchableOpacity = styled(TouchableOpacity);
const StyledScrollView = styled(ScrollView);
const StyledSafeAreaView = styled(SafeAreaView);

interface RequestReviewParams {
  phone: string;
  amount: string;
  message: string;
  selectedContact?: {
    name: string;
    phone: string;
  };
}

export default function RequestReviewScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { user } = useAuth();
  const [sending, setSending] = useState(false);
  
  const { phone, amount, message, selectedContact }: RequestReviewParams = route.params;
  
  const contactName = selectedContact?.name || 'Unknown Contact';
  const displayPhone = phone.startsWith('+260') ? phone : `+260${phone.replace(/^0/, '')}`;

  const handleSendRequest = async () => {
    if (!user) {
      Alert.alert('Error', 'You must be logged in to send requests');
      return;
    }

    setSending(true);
    try {
      console.log('💰 Sending money request:', { 
        payer: phone, 
        amount: parseFloat(amount),
        from: user.phone_number 
      });

      const requestData = {
        payer_phone: phone,
        amount: parseFloat(amount),
        description: message || `Payment request from ${user.full_name}`
      };

      const response = await transactionsAPI.requestMoney(requestData);
      console.log('✅ Money request successful:', response);

      // Navigate to request tracking screen
      // FIRST PRINCIPLES: Alice is requesting money FROM phone number (payer)
      const navParams = {
        requestId: String(response.p2p_details?.id || response.transaction?.id || 'unknown'),
        transactionId: response.transaction?.id || 'unknown',
        amount: amount,
        payerName: selectedContact?.name || 'Unknown Contact', // Person who will pay Alice
        payerPhone: phone, // Phone of person who will pay Alice
        requesterName: user?.full_name || 'You', // Alice (current user requesting money)
        requesterPhone: user?.phone_number || '', // Alice's phone
        qrCode: response.qr_code
      };
      
      console.log('🧭 Navigating to RequestTracking with params:', navParams);
      navigation.navigate('RequestTracking', navParams);
      console.log('🧭 Navigation call completed');

    } catch (error) {
      console.error('❌ Request money error:', error);
      
      let errorMessage = 'Unable to send request. Please check your connection and try again.';
      
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      }
      
      Alert.alert('Request Failed', errorMessage);
    } finally {
      setSending(false);
    }
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  return (
    <StyledSafeAreaView className="flex-1 bg-navy">
      {/* Header */}
      <StyledView className="px-6 py-4 border-b border-white/10">
        <StyledText className="text-white text-xl font-semibold text-center">
          Review Request
        </StyledText>
      </StyledView>

      <StyledScrollView className="flex-1 px-6 py-8">
        {/* Amount Card */}
        <StyledView className="bg-white/5 border border-white/10 rounded-3xl p-8 mb-8 items-center">
          <StyledText className="text-white/80 text-lg mb-2">Request Amount</StyledText>
          <StyledText className="text-white text-4xl font-bold">
            K{amount}
          </StyledText>
          <StyledText className="text-emerald text-sm mt-2">
            + K0.00 fee
          </StyledText>
        </StyledView>

        {/* Request Details */}
        <StyledView className="bg-white/5 border border-white/10 rounded-3xl p-6 mb-8">
          <StyledText className="text-white text-lg font-semibold mb-6">
            Request Details
          </StyledText>
          
          {/* From */}
          <StyledView className="flex-row justify-between items-center py-4 border-b border-white/10">
            <StyledText className="text-white/80 text-base">From</StyledText>
            <StyledView className="items-end">
              <StyledText className="text-white text-base font-medium">
                {contactName}
              </StyledText>
              <StyledText className="text-white/60 text-sm">
                {displayPhone}
              </StyledText>
            </StyledView>
          </StyledView>

          {/* To */}
          <StyledView className="flex-row justify-between items-center py-4 border-b border-white/10">
            <StyledText className="text-white/80 text-base">To</StyledText>
            <StyledView className="items-end">
              <StyledText className="text-white text-base font-medium">
                {user?.full_name || 'You'}
              </StyledText>
              <StyledText className="text-white/60 text-sm">
                {user?.phone_number}
              </StyledText>
            </StyledView>
          </StyledView>

          {/* Message */}
          {message && (
            <StyledView className="flex-row justify-between items-start py-4">
              <StyledText className="text-white/80 text-base">Message</StyledText>
              <StyledText className="text-white text-base flex-1 text-right ml-4">
                {message}
              </StyledText>
            </StyledView>
          )}
        </StyledView>

        {/* Info Card */}
        <StyledView className="bg-amber/10 border border-amber/20 rounded-2xl p-4 mb-8">
          <StyledView className="flex-row items-start">
            <StyledText className="text-amber text-lg mr-3">ℹ️</StyledText>
            <StyledView className="flex-1">
              <StyledText className="text-amber text-sm font-medium mb-1">
                What happens next?
              </StyledText>
              <StyledText className="text-amber/80 text-sm leading-5">
                {contactName} will receive a notification to approve your request. You can track the status and share a QR code for quick payment.
              </StyledText>
            </StyledView>
          </StyledView>
        </StyledView>
      </StyledScrollView>

      {/* Bottom Actions */}
      <StyledView className="px-6 py-6 bg-navy border-t border-white/10">
        <StyledTouchableOpacity 
          className={`bg-emerald rounded-2xl py-4 mb-4 ${sending ? 'opacity-50' : ''}`}
          onPress={handleSendRequest}
          disabled={sending}
        >
          <StyledText className="text-white text-center text-lg font-semibold">
            {sending ? 'Sending Request...' : 'Send Request'}
          </StyledText>
        </StyledTouchableOpacity>
        
        <StyledTouchableOpacity 
          className="border border-white/20 rounded-2xl py-4"
          onPress={handleCancel}
          disabled={sending}
        >
          <StyledText className="text-white/80 text-center text-lg font-medium">
            Cancel
          </StyledText>
        </StyledTouchableOpacity>
      </StyledView>
    </StyledSafeAreaView>
  );
}