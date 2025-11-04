import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Share } from 'react-native';
import { styled } from 'nativewind';
import { useNavigation, useRoute } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTouchableOpacity = styled(TouchableOpacity);
const StyledScrollView = styled(ScrollView);
const StyledSafeAreaView = styled(SafeAreaView);

export default function TransactionDetailsScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { transaction } = route.params || {};

  if (!transaction) {
    return (
      <StyledSafeAreaView className="flex-1 bg-navy">
        <StyledView className="flex-1 items-center justify-center">
          <StyledText className="text-white text-lg">Transaction not found</StyledText>
        </StyledView>
      </StyledSafeAreaView>
    );
  }

  const getTransactionIcon = (type: string, status: string) => {
    if (status === 'failed') return '❌';
    if (status === 'pending') return '⏳';
    if (status === 'processing') return '🔄';
    if (type === 'sent') return '↗️';
    if (type === 'received') return '↙️';
    return '💳';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-400';
      case 'pending': return 'text-yellow-400';
      case 'processing': return 'text-blue-400';
      case 'failed': return 'text-red-400';
      default: return 'text-white/70';
    }
  };

  const getAmountColor = (type: string, status: string) => {
    if (status === 'failed') return 'text-red-400';
    if (status === 'pending' || status === 'processing') return 'text-yellow-400';
    return type === 'received' ? 'text-green-400' : 'text-white';
  };

  const formatAmount = (type: string, amount: string) => {
    const prefix = type === 'received' ? '+' : type === 'sent' ? '-' : '';
    return `${prefix}ZMW ${amount}`;
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-GB', { 
        day: '2-digit', 
        month: 'short', 
        year: 'numeric' 
      }),
      time: date.toLocaleTimeString('en-GB', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      })
    };
  };

  const handleShare = async () => {
    try {
      const shareContent = `Flash Payment Receipt\n\n` +
        `${transaction.type === 'sent' ? 'Sent to' : 'Received from'}: ${transaction.type === 'sent' ? transaction.recipient : transaction.sender}\n` +
        `Phone: ${transaction.phone}\n` +
        `Amount: ${formatAmount(transaction.type, transaction.amount)}\n` +
        `Status: ${transaction.status}\n` +
        `Reference: ${transaction.reference_id || transaction.id}\n` +
        `Date: ${formatDateTime(transaction.created_at).date} at ${formatDateTime(transaction.created_at).time}` +
        (transaction.description ? `\nNote: ${transaction.description}` : '');

      await Share.share({
        message: shareContent,
        title: 'Transaction Receipt'
      });
    } catch (error) {
      console.error('Error sharing transaction:', error);
    }
  };

  const { date, time } = formatDateTime(transaction.created_at);

  return (
    <StyledSafeAreaView className="flex-1 bg-navy">
      {/* Header */}
      <StyledView className="flex-row items-center justify-between px-6 py-3 mt-2">
        <StyledTouchableOpacity onPress={() => navigation.goBack()}>
          <StyledText className="text-white text-2xl font-light">✕</StyledText>
        </StyledTouchableOpacity>
        <StyledTouchableOpacity onPress={handleShare}>
          <StyledText className="text-sky text-lg font-light">Share</StyledText>
        </StyledTouchableOpacity>
      </StyledView>

      <StyledScrollView className="flex-1 px-8 pt-4">
        {/* Main Transaction Card */}
        <StyledView className="bg-white/5 border border-white/10 rounded-3xl p-8 mb-6">
          <StyledView className="items-center mb-6">
            <StyledView className="w-16 h-16 bg-emerald rounded-full items-center justify-center mb-4">
              <StyledText className="text-white font-bold text-xl">
                {transaction.type === 'sent' 
                  ? transaction.recipient?.charAt(0)?.toUpperCase() || '?' 
                  : transaction.sender?.charAt(0)?.toUpperCase() || '?'
                }
              </StyledText>
            </StyledView>
            
            <StyledText className={`font-thin text-4xl mb-2 ${getAmountColor(transaction.type, transaction.status)}`}>
              {formatAmount(transaction.type, transaction.amount)}
            </StyledText>
            
            <StyledText className="text-white/80 text-lg font-light mb-2">
              {transaction.type === 'sent' ? 'Sent to' : 'Received from'}
            </StyledText>
            
            <StyledText className="text-white font-semibold text-xl mb-1">
              {transaction.type === 'sent' ? transaction.recipient : transaction.sender}
            </StyledText>
            
            <StyledText className="text-white/60">
              {transaction.phone}
            </StyledText>
          </StyledView>

          {/* Details */}
          <StyledView className="space-y-4 pt-6 border-t border-white/10">
            <StyledView className="flex-row justify-between">
              <StyledText className="text-white/80 font-light">Date</StyledText>
              <StyledText className="text-white">{date}</StyledText>
            </StyledView>
            
            <StyledView className="flex-row justify-between">
              <StyledText className="text-white/80 font-light">Time</StyledText>
              <StyledText className="text-white">{time}</StyledText>
            </StyledView>

            {transaction.description && (
              <StyledView className="flex-row justify-between">
                <StyledText className="text-white/80 font-light">Note</StyledText>
                <StyledText className="text-white text-right flex-1 ml-4">
                  {transaction.description}
                </StyledText>
              </StyledView>
            )}

            <StyledView className="flex-row justify-between">
              <StyledText className="text-white/80 font-light">Status</StyledText>
              <StyledText className={`capitalize ${getStatusColor(transaction.status)}`}>
                {transaction.status}
              </StyledText>
            </StyledView>

            <StyledView className="flex-row justify-between">
              <StyledText className="text-white/80 font-light">Reference</StyledText>
              <StyledText className="text-white/70 text-xs font-mono">
                {transaction.reference_id || transaction.id}
              </StyledText>
            </StyledView>
          </StyledView>
        </StyledView>

        <StyledView className="h-20" />
      </StyledScrollView>
    </StyledSafeAreaView>
  );
}