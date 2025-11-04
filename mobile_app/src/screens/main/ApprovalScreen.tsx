import React, { useEffect, useState } from 'react';
import { View, Text, Linking } from 'react-native';
import { styled } from 'nativewind';
import { useNavigation, useRoute } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Loader, Card } from '../../ui';
import { transactionsAPI } from '../../services/api';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledSafeAreaView = styled(SafeAreaView);

export default function ApprovalScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const [waiting, setWaiting] = useState(true);
  const [status, setStatus] = useState<'pending' | 'approved' | 'declined' | 'timeout'>('pending');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [startTime] = useState(Date.now());

  const { phone, amount, note, recipient, transactionId, referenceId } = route.params || {};

  useEffect(() => {
    if (!transactionId && !referenceId) {
      console.error('❌ No transaction ID provided to ApprovalScreen');
      setStatus('declined');
      setErrorMessage('Transaction ID missing');
      setWaiting(false);
      return;
    }

    let pollCount = 0;
    const maxPolls = 24; // 2 minutes with 5-second intervals
    
    const pollTransactionStatus = async () => {
      try {
        console.log(`🔍 Polling transaction status (${pollCount + 1}/${maxPolls})`);
        const txId = transactionId || referenceId;
        const transaction = await transactionsAPI.getTransaction(txId);
        
        console.log('📊 Transaction status:', transaction.status);
        
        if (transaction.status === 'completed') {
          setStatus('approved');
          setWaiting(false);
          return;
        } else if (transaction.status === 'failed') {
          setStatus('declined');
          setErrorMessage(transaction.failure_reason || 'Payment was declined');
          setWaiting(false);
          return;
        } else if (transaction.status === 'cancelled') {
          setStatus('declined');
          setErrorMessage('Payment was cancelled');
          setWaiting(false);
          return;
        }
        
        // Continue polling if still pending/processing
        pollCount++;
        
        // Demo mode: Auto-complete after 5 seconds (1 poll)
        if (__DEV__ && pollCount >= 1 && Date.now() - startTime >= 5000) {
          console.log('🎭 Demo mode: Auto-completing transaction after 5 seconds');
          setStatus('approved');
          setWaiting(false);
          return;
        }
        
        if (pollCount < maxPolls) {
          setTimeout(pollTransactionStatus, 5000);
        } else {
          // Timeout after 2 minutes
          setStatus('timeout');
          setErrorMessage('Payment approval timed out. Please check your mobile money app.');
          setWaiting(false);
        }
      } catch (error) {
        console.error('❌ Error polling transaction status:', error);
        pollCount++;
        if (pollCount < maxPolls) {
          // Retry on error
          setTimeout(pollTransactionStatus, 5000);
        } else {
          setStatus('declined');
          setErrorMessage('Unable to check payment status. Please try again.');
          setWaiting(false);
        }
      }
    };

    // Start polling
    pollTransactionStatus();
  }, [transactionId, referenceId]);

  const handleOpenMTN = () => {
    // Try to open MTN MoMo app
    Linking.openURL('mtnmomo://').catch(() => {
      // Fallback to app store or USSD
      Linking.openURL('tel:*115#');
    });
  };

  const handleViewReceipt = () => {
    navigation.replace('Receipt', {
      phone,
      amount,
      note,
      recipient,
      status
    });
  };

  const handleTryAgain = () => {
    setWaiting(true);
    setStatus('pending');
    
    const timer = setTimeout(() => {
      const success = Math.random() > 0.3;
      setStatus(success ? 'approved' : 'declined');
      setWaiting(false);
    }, 3000);
  };

  if (waiting) {
    return (
      <StyledSafeAreaView className="flex-1 bg-navy">
        <StyledView className="flex-1 px-6 pt-6 items-center justify-center">
          <Card padding="lg" className="w-full items-center">
            <Loader text="Waiting for approval in your mobile money app..." />
            
            <StyledView className="mt-8 items-center">
              <StyledText className="text-white text-lg font-semibold mb-2">
                Sending ZMW {amount}
              </StyledText>
              <StyledText className="text-white/70 text-center mb-6">
                To: {recipient?.name || phone}
              </StyledText>
              
              {/* Disabled for demo mode */}
              {!__DEV__ && (
                <Button
                  title="Open Mobile Money App"
                  onPress={handleOpenMTN}
                  variant="secondary"
                  size="md"
                />
              )}
            </StyledView>
            
            <StyledView className="mt-8 bg-gold/10 p-4 rounded-xl">
              <StyledText className="text-gold text-sm text-center">
                💡 Check your messages if you don't see the mobile money prompt
              </StyledText>
            </StyledView>
          </Card>
        </StyledView>
      </StyledSafeAreaView>
    );
  }

  return (
    <StyledSafeAreaView className="flex-1 bg-navy">
      <StyledView className="flex-1 px-6 pt-6 items-center justify-center">
        <Card padding="lg" className="w-full items-center">
          {status === 'approved' ? (
            <>
              <StyledView className="w-20 h-20 bg-success rounded-full items-center justify-center mb-6">
                <StyledText className="text-white text-4xl">✓</StyledText>
              </StyledView>
              
              <StyledText className="text-white text-2xl font-bold mb-2">
                Payment Sent!
              </StyledText>
              <StyledText className="text-white/70 text-center mb-6">
                ZMW {amount} has been sent to {recipient?.name || phone}
              </StyledText>
              
              <Button
                title="View Receipt"
                onPress={handleViewReceipt}
                variant="primary"
              />
            </>
          ) : (
            <>
              <StyledView className="w-20 h-20 bg-danger rounded-full items-center justify-center mb-6">
                <StyledText className="text-white text-4xl">✕</StyledText>
              </StyledView>
              
              <StyledText className="text-white text-2xl font-bold mb-2">
                Payment Failed
              </StyledText>
              <StyledText className="text-white/70 text-center mb-6">
                {errorMessage || (status === 'timeout' 
                  ? 'Payment approval timed out. Please check your mobile money app.'
                  : 'Payment was declined in your mobile money app'
                )}
              </StyledText>
              
              <StyledView className="space-y-3 w-full">
                <Button
                  title="Try Again"
                  onPress={handleTryAgain}
                  variant="primary"
                />
                <Button
                  title="Cancel"
                  onPress={() => navigation.goBack()}
                  variant="ghost"
                />
              </StyledView>
            </>
          )}
        </Card>
      </StyledView>
    </StyledSafeAreaView>
  );
}