import React from 'react';
import { View, Text, Share, TouchableOpacity, ScrollView } from 'react-native';
import { styled } from 'nativewind';
import { useRoute, useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Card } from '../../ui';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTouchableOpacity = styled(TouchableOpacity);
const StyledScrollView = styled(ScrollView);
const StyledSafeAreaView = styled(SafeAreaView);

export default function ReceiptScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { 
    phone, 
    amount, 
    message, 
    recipient, 
    transactionId, 
    referenceId,
    status = 'completed',
    selectedCard 
  } = route.params || {};
  
  const timestamp = new Date().toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const formatTransactionId = (id: string) => {
    if (!id) return `FL${Date.now().toString().slice(-8)}`;
    return id.length > 12 ? `${id.slice(0, 8)}...${id.slice(-4)}` : id;
  };

  const getStatusConfig = () => {
    switch (status) {
      case 'completed':
      case 'successful':
        return {
          icon: '✓',
          color: 'text-emerald',
          bgColor: 'bg-emerald/20',
          title: 'Payment Successful',
          subtitle: 'Your money has been sent'
        };
      case 'processing':
        return {
          icon: '⏳',
          color: 'text-gold',
          bgColor: 'bg-gold/20',
          title: 'Payment Processing',
          subtitle: 'Please wait for confirmation'
        };
      case 'failed':
        return {
          icon: '✕',
          color: 'text-danger',
          bgColor: 'bg-danger/20',
          title: 'Payment Failed',
          subtitle: 'Transaction could not be completed'
        };
      default:
        return {
          icon: '✓',
          color: 'text-emerald',
          bgColor: 'bg-emerald/20',
          title: 'Payment Complete',
          subtitle: 'Transaction processed successfully'
        };
    }
  };

  const statusConfig = getStatusConfig();

  const handleShare = async () => {
    try {
      const receiptText = `
🧾 Flash Payment Receipt

━━━━━━━━━━━━━━━━━━━━━━━━━
💰 Amount: ZMW ${amount}
👤 To: ${recipient?.name || phone}
${message ? `💬 Note: ${message}` : ''}
🆔 Transaction: ${formatTransactionId(transactionId || referenceId)}
📅 Date: ${timestamp}
✅ Status: ${statusConfig.title}
━━━━━━━━━━━━━━━━━━━━━━━━━
⚡ Powered by Flash Payment
      `;

      await Share.share({
        message: receiptText.trim(),
        title: 'Flash Payment Receipt'
      });
    } catch (error) {
      console.error('Error sharing receipt:', error);
    }
  };

  return (
    <StyledSafeAreaView className="flex-1 bg-gradient-to-b from-navy to-slate-900">
      {/* Professional Header */}
      <StyledView className="flex-row items-center justify-between px-6 py-4 bg-navy/95 backdrop-blur-xl border-b border-white/5">
        <StyledTouchableOpacity 
          className="w-10 h-10 items-center justify-center rounded-full bg-white/10 active:bg-white/20"
          onPress={() => navigation.goBack()}
        >
          <StyledText className="text-white text-lg font-light">×</StyledText>
        </StyledTouchableOpacity>
        
        <StyledView className="flex-row items-center gap-3">
          <StyledTouchableOpacity 
            className="px-4 py-2 bg-sky/20 rounded-full border border-sky/30 active:bg-sky/30"
            onPress={handleShare}
          >
            <StyledText className="text-sky text-sm font-medium">
              Share Receipt
            </StyledText>
          </StyledTouchableOpacity>
        </StyledView>
      </StyledView>

      <StyledScrollView 
        className="flex-1" 
        contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 24, paddingBottom: 60 }}
        showsVerticalScrollIndicator={false}
      >
        
        {/* Status Section */}
        <StyledView className="items-center mb-8 bg-emerald/5 rounded-2xl p-6 border border-emerald/20">
          <StyledView className="w-16 h-16 rounded-full bg-emerald/20 items-center justify-center mb-4">
            <StyledText className="text-emerald text-2xl">✓</StyledText>
          </StyledView>
          
          <StyledText className="text-emerald text-lg font-semibold mb-2">
            Payment Successful
          </StyledText>
          <StyledText className="text-white/70 text-center text-sm">
            Your payment was processed securely
          </StyledText>
        </StyledView>

        {/* Premium Amount Display */}
        <StyledView className="items-center mb-8 bg-white/5 rounded-2xl p-6 border border-white/10">
          <StyledText className="text-white/60 text-sm font-medium mb-3 tracking-wide uppercase">
            Amount Transferred
          </StyledText>
          <StyledView className="flex-row items-baseline">
            <StyledText className="text-white/80 text-lg font-light mr-2">ZMW</StyledText>
            <StyledText 
              className="text-white text-4xl font-thin tracking-tight" 
              numberOfLines={1}
              adjustsFontSizeToFit
            >
              {amount}
            </StyledText>
          </StyledView>
          <StyledView className="w-12 h-px bg-white/20 mt-4" />
        </StyledView>

        {/* Professional Transaction Details */}
        <StyledView className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden mb-6">
          {/* Section Header */}
          <StyledView className="bg-white/5 px-6 py-4 border-b border-white/10">
            <StyledText className="text-white text-lg font-semibold">
              Transaction Details
            </StyledText>
          </StyledView>

          {/* Details Grid */}
          <StyledView className="p-6 space-y-6">
            {/* Recipient */}
            <StyledView className="flex-row items-start">
              <StyledView className="w-1 h-12 rounded-full bg-blue-400 mr-4 mt-1" />
              <StyledView className="flex-1">
                <StyledText className="text-white/60 text-xs font-medium mb-1 tracking-wide uppercase">
                  Recipient
                </StyledText>
                <StyledText className="text-white text-base font-medium mb-1" numberOfLines={2}>
                  {recipient?.name || 'Unknown Contact'}
                </StyledText>
                <StyledText className="text-white/50 text-sm font-mono" numberOfLines={1}>
                  {phone}
                </StyledText>
              </StyledView>
            </StyledView>

            {/* Message */}
            {message && (
              <StyledView className="flex-row items-start">
                <StyledView className="w-1 h-12 rounded-full bg-purple-400 mr-4 mt-1" />
                <StyledView className="flex-1">
                  <StyledText className="text-white/60 text-xs font-medium mb-1 tracking-wide uppercase">
                    Message
                  </StyledText>
                  <StyledText className="text-white text-sm leading-relaxed italic" numberOfLines={3}>
                    "{message}"
                  </StyledText>
                </StyledView>
              </StyledView>
            )}

            {/* Transaction ID */}
            <StyledView className="flex-row items-start">
              <StyledView className="w-1 h-12 rounded-full bg-amber-400 mr-4 mt-1" />
              <StyledView className="flex-1">
                <StyledText className="text-white/60 text-xs font-medium mb-1 tracking-wide uppercase">
                  Transaction ID
                </StyledText>
                <StyledText className="text-white font-mono text-sm" numberOfLines={1}>
                  {formatTransactionId(transactionId || referenceId)}
                </StyledText>
              </StyledView>
            </StyledView>

            {/* Date & Time */}
            <StyledView className="flex-row items-start">
              <StyledView className="w-1 h-12 rounded-full bg-green-400 mr-4 mt-1" />
              <StyledView className="flex-1">
                <StyledText className="text-white/60 text-xs font-medium mb-1 tracking-wide uppercase">
                  Date & Time
                </StyledText>
                <StyledText className="text-white text-sm" numberOfLines={2}>
                  {timestamp}
                </StyledText>
              </StyledView>
            </StyledView>

            {/* Transaction Fee */}
            <StyledView className="flex-row items-start">
              <StyledView className="w-1 h-12 rounded-full bg-emerald-400 mr-4 mt-1" />
              <StyledView className="flex-1">
                <StyledText className="text-white/60 text-xs font-medium mb-1 tracking-wide uppercase">
                  Transaction Fee
                </StyledText>
                <StyledView className="flex-row items-center">
                  <StyledText className="text-emerald font-semibold text-sm mr-2">
                    FREE
                  </StyledText>
                  <StyledView className="px-2 py-1 bg-emerald/20 rounded-md">
                    <StyledText className="text-emerald text-xs font-medium">
                      Promo
                    </StyledText>
                  </StyledView>
                </StyledView>
              </StyledView>
            </StyledView>
          </StyledView>
        </StyledView>

        {/* Professional Action Buttons */}
        <StyledView className="space-y-4 mb-8">
          <Button
            title="Send Another Payment"
            onPress={() => navigation.navigate('SendMoney')}
            size="lg"
            variant="primary"
          />
          
          <StyledView className="flex-row gap-3">
            <StyledTouchableOpacity 
              className="flex-1 py-3 px-4 rounded-xl border border-white/20 items-center bg-white/5 active:bg-white/10"
              onPress={() => navigation.navigate('MainTabs', { screen: 'Activity' })}
            >
              <StyledText className="text-white/90 font-medium text-sm">
                View History
              </StyledText>
            </StyledTouchableOpacity>
            
            <StyledTouchableOpacity 
              className="flex-1 py-3 px-4 rounded-xl border border-white/20 items-center bg-white/5 active:bg-white/10"
              onPress={handleShare}
            >
              <StyledText className="text-white/90 font-medium text-sm">
                Export PDF
              </StyledText>
            </StyledTouchableOpacity>
          </StyledView>
        </StyledView>

      </StyledScrollView>
    </StyledSafeAreaView>
  );
}