import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, Alert } from 'react-native';
import { styled } from 'nativewind';
import { useNavigation, useRoute } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, CardSelectionModal } from '../../ui';
import { VIRAL_CARDS } from '../../ui/ViralCard';
import { transactionsAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { NetworkService } from '../../services/networkService';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTouchableOpacity = styled(TouchableOpacity);
const StyledTextInput = styled(TextInput);
const StyledScrollView = styled(ScrollView);
const StyledSafeAreaView = styled(SafeAreaView);

interface Contact {
  recordID: string;
  displayName: string;
  phoneNumbers: Array<{ number: string; label: string }>;
}

export default function SendMoneyScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { user } = useAuth();
  
  // Debug logging for user state changes
  useEffect(() => {
    console.log('💰 SendMoneyScreen - User state changed:', user ? `Authenticated (${user.phone_number})` : 'Not authenticated');
  }, [user]);
  
  const [phone, setPhone] = useState(route.params?.recipient?.phone ?? '');
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');
  const [selectedContact, setSelectedContact] = useState(route.params?.recipient ?? null);
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [showCardModal, setShowCardModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'send' | 'receive'>('send');
  const [showContacts, setShowContacts] = useState(false);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loadingContacts, setLoadingContacts] = useState(false);
  const [sending, setSending] = useState(false);

  const loadContacts = async () => {
    setLoadingContacts(true);
    try {
      // For demo purposes, use mock contacts
      const mockContacts: Contact[] = [
        {
          recordID: '1',
          displayName: 'John Mwanza',
          phoneNumbers: [{ number: '+260971234567', label: 'mobile' }]
        },
        {
          recordID: '2', 
          displayName: 'Sarah Banda',
          phoneNumbers: [{ number: '+260977654321', label: 'mobile' }]
        },
        {
          recordID: '3',
          displayName: 'Peter Phiri', 
          phoneNumbers: [{ number: '+260965551234', label: 'mobile' }]
        },
        {
          recordID: '4',
          displayName: 'Mary Lungu',
          phoneNumbers: [{ number: '+260979876543', label: 'mobile' }]
        },
        {
          recordID: '5',
          displayName: 'James Chipeta',
          phoneNumbers: [{ number: '+260966123456', label: 'mobile' }]
        }
      ];
      
      setTimeout(() => {
        setContacts(mockContacts);
        setShowContacts(true);
        setLoadingContacts(false);
      }, 500); // Simulate loading
      
    } catch (error) {
      Alert.alert('Error', 'Unable to load contacts. Please enter phone number manually.');
      setLoadingContacts(false);
    }
  };

  const selectContact = (contact: Contact) => {
    const phoneNumber = contact.phoneNumbers[0]?.number;
    if (phoneNumber) {
      setPhone(phoneNumber);
      setSelectedContact({ name: contact.displayName, phone: phoneNumber });
      setShowContacts(false);
    }
  };

  const handleContinue = async () => {
    if (!phone || !amount) {
      return;
    }

    // Check if user is authenticated before making API call
    if (!user) {
      Alert.alert('Authentication Required', 'Please log in to send money.', [
        {
          text: 'OK',
          onPress: () => navigation.navigate('Welcome')
        }
      ]);
      return;
    }

    setSending(true);
    try {
      console.log('💰 Attempting to send money:', { 
        recipient: phone, 
        amount: parseFloat(amount),
        user: user.phone_number 
      });

      const transactionData = {
        recipient_phone: phone,
        amount: parseFloat(amount),
        description: message || undefined
      };

      // Check if online
      const isOnline = await NetworkService.isOnline();
      
      if (!isOnline) {
        console.log('📱 Offline - queuing transaction');
        
        // Queue transaction for offline processing
        const queuedTx = await NetworkService.queueTransaction(transactionData);
        
        Alert.alert(
          'Transaction Queued',
          `Payment to ${selectedContact?.name || phone} has been queued. It will be sent automatically when internet connection is restored.`,
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack()
            }
          ]
        );
        
        return;
      }
      
      // Process normally if online
      const response = await transactionsAPI.sendMoney(transactionData);
      console.log('✅ Send money successful:', response);

      // Navigate to approval/waiting screen with transaction details
      navigation.navigate('Approval', {
        phone,
        amount,
        message,
        selectedCard,
        recipient: selectedContact,
        transactionId: response.transaction_id,
        referenceId: response.reference_id
      });
    } catch (error) {
      console.error('❌ Send money error:', error);
      
      let errorMessage = 'Unable to process payment. Please check your connection and try again.';
      
      if (error.response?.status === 401) {
        errorMessage = 'Your session has expired. Please log in again.';
        Alert.alert('Session Expired', errorMessage, [
          {
            text: 'Log In',
            onPress: () => navigation.navigate('Welcome')
          }
        ]);
        return;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.code === 'NETWORK_ERROR' || error.message.includes('Network')) {
        // Handle network errors by offering to queue transaction
        Alert.alert(
          'Network Error',
          'Unable to connect to the server. Would you like to queue this transaction to send when connection is restored?',
          [
            {
              text: 'Cancel',
              style: 'cancel'
            },
            {
              text: 'Queue Transaction',
              onPress: async () => {
                try {
                  const queuedTx = await NetworkService.queueTransaction({
                    recipient_phone: phone,
                    amount: parseFloat(amount),
                    description: message || undefined
                  });
                  
                  Alert.alert(
                    'Transaction Queued',
                    'Your payment has been queued and will be sent automatically when internet connection is restored.',
                    [{ text: 'OK', onPress: () => navigation.goBack() }]
                  );
                } catch (queueError) {
                  Alert.alert('Error', 'Failed to queue transaction. Please try again.');
                }
              }
            }
          ]
        );
        return;
      }
      
      Alert.alert('Payment Failed', errorMessage);
    } finally {
      setSending(false);
    }
  };

  return (
    <StyledSafeAreaView className="flex-1 bg-navy" edges={['bottom']}>
      {/* Header - Minimal spacing */}
      <StyledView className="flex-row items-center justify-between px-6 py-3 mt-2">
        <StyledTouchableOpacity onPress={() => navigation.goBack()}>
          <StyledText className="text-white text-2xl font-light">✕</StyledText>
        </StyledTouchableOpacity>
        <StyledTouchableOpacity>
          <StyledText className="text-white text-2xl font-light">?</StyledText>
        </StyledTouchableOpacity>
      </StyledView>

      {/* Tab Header */}
      <StyledView className="flex-row px-8 mb-4">
        <StyledTouchableOpacity 
          className={`flex-1 pb-4 border-b ${
            activeTab === 'send' ? 'border-sky' : 'border-white/10'
          }`}
          onPress={() => setActiveTab('send')}
        >
          <StyledText className={`text-center text-lg font-light ${
            activeTab === 'send' ? 'text-white' : 'text-white/50'
          }`}>
            Send
          </StyledText>
        </StyledTouchableOpacity>
        <StyledTouchableOpacity 
          className={`flex-1 pb-4 border-b ${
            activeTab === 'receive' ? 'border-sky' : 'border-white/10'
          }`}
          onPress={() => setActiveTab('receive')}
        >
          <StyledText className={`text-center text-lg font-light ${
            activeTab === 'receive' ? 'text-white' : 'text-white/50'
          }`}>
            Receive
          </StyledText>
        </StyledTouchableOpacity>
      </StyledView>

      {/* Scrollable Content */}
      <StyledView className="flex-1">
        <StyledScrollView 
          className="flex-1"
          contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 12, paddingBottom: 120 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
        {/* Recipient Card */}
        <StyledView className="bg-white/5 border border-white/10 rounded-3xl p-8 mb-8">
          <StyledText className="text-white/80 text-lg font-light mb-6">To</StyledText>
          {selectedContact ? (
            <StyledView className="flex-row items-center justify-between">
              <StyledView className="flex-row items-center flex-1">
                <StyledView className="w-10 h-10 bg-emerald rounded-full items-center justify-center mr-3">
                  <StyledText className="text-white font-bold text-sm">
                    {selectedContact.name?.charAt(0)?.toUpperCase() || '?'}
                  </StyledText>
                </StyledView>
                <StyledView className="flex-1">
                  <StyledText className="text-white font-semibold text-lg">
                    {selectedContact.name}
                  </StyledText>
                  <StyledText className="text-white/60">
                    {selectedContact.phone}
                  </StyledText>
                </StyledView>
              </StyledView>
              <StyledTouchableOpacity 
                onPress={() => {
                  setSelectedContact(null);
                  setPhone('');
                }}
              >
                <StyledText className="text-sky font-medium">Change</StyledText>
              </StyledTouchableOpacity>
            </StyledView>
          ) : (
            <StyledTextInput
              className="text-white text-lg bg-transparent border-0 p-0"
              placeholder="Phone number or name"
              placeholderTextColor="#6F8A9A"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />
          )}
          
          {/* Recipient Options */}
          <StyledView className="flex-row justify-around mt-6 pt-6 border-t border-divider">
            <StyledTouchableOpacity 
              className="items-center"
              onPress={loadContacts}
              disabled={loadingContacts}
            >
              <StyledView className="w-12 h-12 bg-sky/20 rounded-full items-center justify-center mb-2">
                <StyledText className="text-sky text-lg">
                  {loadingContacts ? '⏳' : '👤'}
                </StyledText>
              </StyledView>
              <StyledText className="text-sky text-sm">Contacts</StyledText>
            </StyledTouchableOpacity>
            
            <StyledTouchableOpacity className="items-center">
              <StyledView className="w-12 h-12 bg-sky/20 rounded-full items-center justify-center mb-2">
                <StyledText className="text-sky text-lg">❤️</StyledText>
              </StyledView>
              <StyledText className="text-sky text-sm">Favorites</StyledText>
            </StyledTouchableOpacity>
            
            <StyledTouchableOpacity className="items-center">
              <StyledView className="w-12 h-12 bg-emerald rounded-full items-center justify-center mb-2">
                <StyledText className="text-white text-lg">📱</StyledText>
              </StyledView>
              <StyledText className="text-emerald text-sm">Scan QR</StyledText>
            </StyledTouchableOpacity>
          </StyledView>
        </StyledView>

        {/* Contacts List */}
        {showContacts && (
          <StyledView className="bg-charcoal/50 border border-divider rounded-2xl p-4 mb-6 max-h-80">
            <StyledView className="flex-row items-center justify-between mb-4">
              <StyledText className="text-white text-lg font-semibold">Select Contact</StyledText>
              <StyledTouchableOpacity onPress={() => setShowContacts(false)}>
                <StyledText className="text-sky font-medium">Cancel</StyledText>
              </StyledTouchableOpacity>
            </StyledView>
            <StyledScrollView className="max-h-60" showsVerticalScrollIndicator={true}>
              {contacts.map((contact) => (
                <StyledTouchableOpacity
                  key={contact.recordID}
                  className="flex-row items-center py-3 border-b border-divider/30"
                  onPress={() => selectContact(contact)}
                >
                  <StyledView className="w-10 h-10 bg-emerald rounded-full items-center justify-center mr-3">
                    <StyledText className="text-white font-bold text-sm">
                      {contact.displayName?.charAt(0)?.toUpperCase() || '?'}
                    </StyledText>
                  </StyledView>
                  <StyledView className="flex-1">
                    <StyledText className="text-white font-medium">
                      {contact.displayName || 'Unknown'}
                    </StyledText>
                    <StyledText className="text-white/60 text-sm">
                      {contact.phoneNumbers[0]?.number || 'No phone'}
                    </StyledText>
                  </StyledView>
                </StyledTouchableOpacity>
              ))}
            </StyledScrollView>
          </StyledView>
        )}

        {/* Amount Card */}
        <StyledView className="bg-white/5 border border-white/10 rounded-3xl p-8 mb-8">
          <StyledText className="text-white/80 text-lg font-light mb-6">Amount</StyledText>
          <StyledView className="flex-row items-baseline">
            <StyledText className="text-white/60 text-xl font-light mr-3">ZMW</StyledText>
            <StyledTextInput
              className="text-white text-3xl font-light bg-transparent border-0 p-0 flex-1"
              placeholder="0.00"
              placeholderTextColor="#6F8A9A"
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
            />
          </StyledView>
        </StyledView>

        {/* Message Card */}
        <StyledView className="bg-white/5 border border-white/10 rounded-3xl p-8 mb-8">
          <StyledText className="text-white/80 text-lg font-light mb-6">Message (Optional)</StyledText>
          <StyledTextInput
            className="text-white text-lg font-light bg-transparent border-0 p-0"
            placeholder="Add a note..."
            placeholderTextColor="#6F8A9A"
            value={message}
            onChangeText={setMessage}
            multiline
          />
        </StyledView>

        {/* Include a Card - Viral Feature */}
        <StyledTouchableOpacity 
          className="flex-row items-center mb-8"
          onPress={() => setShowCardModal(true)}
        >
          <StyledText className="text-sky text-xl mr-3">💌</StyledText>
          <StyledText className="text-sky text-lg font-medium">Include a card</StyledText>
          {selectedCard && (
            <StyledView className="ml-3 px-3 py-1 bg-emerald rounded-full">
              <StyledText className="text-white text-xs font-bold">
                {VIRAL_CARDS.find(c => c.id === selectedCard)?.title}
              </StyledText>
            </StyledView>
          )}
        </StyledTouchableOpacity>
      </StyledScrollView>
      </StyledView>

      {/* Bottom Button - Fixed Position */}
      <StyledView className="absolute bottom-0 left-0 right-0 bg-navy px-8 py-6 border-t border-white/10">
        {!user ? (
          <StyledView className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 mb-4">
            <StyledText className="text-red-400 text-center font-light">
              🔒 Please log in to send money
            </StyledText>
          </StyledView>
        ) : null}
        <Button
          title={sending ? "Processing..." : user ? "Send Money" : "Log In Required"}
          onPress={handleContinue}
          disabled={!phone || !amount || sending || !user}
          loading={sending}
          size="lg"
          variant="primary"
        />
      </StyledView>

      {/* Card Selection Modal */}
      <CardSelectionModal
        visible={showCardModal}
        onClose={() => setShowCardModal(false)}
        selectedCard={selectedCard}
        onSelectCard={setSelectedCard}
      />
    </StyledSafeAreaView>
  );
}