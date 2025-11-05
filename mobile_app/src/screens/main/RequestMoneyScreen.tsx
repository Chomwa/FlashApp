import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, Alert, Platform, Linking } from 'react-native';
import { styled } from 'nativewind';
import { useNavigation, useRoute } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../ui';
import { ViralCard, VIRAL_CARDS } from '../../ui/ViralCard';
import { transactionsAPI, contactsAPI } from '../../services/api';
import Contacts from 'react-native-contacts';
import { request, PERMISSIONS, RESULTS } from 'react-native-permissions';

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

export default function RequestMoneyScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  
  const [phone, setPhone] = useState(route.params?.recipient?.phone ?? '');
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');
  const [selectedContact, setSelectedContact] = useState(route.params?.recipient ?? null);
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [showCards, setShowCards] = useState(false);
  const [activeTab, setActiveTab] = useState<'flash' | 'request'>('request');
  const [showContacts, setShowContacts] = useState(false);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loadingContacts, setLoadingContacts] = useState(false);
  const [requesting, setRequesting] = useState(false);

  const loadContacts = async () => {
    setLoadingContacts(true);
    try {
      console.log('📇 Requesting contacts permission...');

      // Request contacts permission based on platform
      const permission = Platform.OS === 'ios'
        ? PERMISSIONS.IOS.CONTACTS
        : PERMISSIONS.ANDROID.READ_CONTACTS;

      const result = await request(permission);
      console.log('📱 Permission result:', result);

      if (result === RESULTS.GRANTED) {
        console.log('📇 Loading phone contacts...');

        // Load all phone contacts
        const phoneContacts = await Contacts.getAll();
        console.log('✅ Phone contacts loaded:', phoneContacts.length, 'contacts');

        // Filter contacts that have phone numbers
        const validContacts: Contact[] = phoneContacts
          .filter(contact => contact.phoneNumbers && contact.phoneNumbers.length > 0)
          .map(contact => ({
            recordID: contact.recordID,
            displayName: contact.displayName || contact.givenName || 'Unknown',
            phoneNumbers: contact.phoneNumbers.map(phone => ({
              number: phone.number,
              label: phone.label || 'mobile'
            }))
          }));

        setContacts(validContacts);
        setShowContacts(true);
        console.log('✅ Contacts filtered and set:', validContacts.length);

      } else if (result === RESULTS.DENIED || result === RESULTS.BLOCKED) {
        console.log('❌ Contacts permission denied');

        Alert.alert(
          'Contacts Permission Required',
          'Flash needs access to your contacts to help you request money quickly. You can still enter phone numbers manually.',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Open Settings',
              onPress: () => Linking.openSettings()
            }
          ]
        );

        setContacts([]);
        setShowContacts(false);
      }

    } catch (error) {
      console.error('❌ Failed to load phone contacts:', error);

      Alert.alert(
        'Unable to Load Contacts',
        'Could not access your phone contacts. You can still enter a phone number manually.',
        [{ text: 'OK' }]
      );

      setContacts([]);
      setShowContacts(false);
    } finally {
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

  const handleRequestPayment = async () => {
    if (!phone || !amount) {
      return;
    }

    setRequesting(true);
    try {
      const response = await transactionsAPI.requestMoney({
        payer_phone: phone,
        amount: parseFloat(amount),
        description: message || undefined
      });

      // Navigate to confirmation screen
      navigation.navigate('Approval', {
        phone,
        amount,
        message,
        selectedCard,
        recipient: selectedContact,
        type: 'request',
        transactionId: response.transaction_id,
        referenceId: response.reference_id
      });
    } catch (error) {
      Alert.alert(
        'Request Failed', 
        'Unable to send payment request. Please check your connection and try again.'
      );
    } finally {
      setRequesting(false);
    }
  };

  return (
    <StyledSafeAreaView className="flex-1 bg-navy" edges={['bottom']}>
      {/* Header */}
      <StyledView className="flex-row items-center justify-between px-6 py-3 mt-2">
        <StyledTouchableOpacity onPress={() => navigation.goBack()}>
          <StyledText className="text-white text-2xl">✕</StyledText>
        </StyledTouchableOpacity>
        <StyledTouchableOpacity>
          <StyledText className="text-white text-2xl">?</StyledText>
        </StyledTouchableOpacity>
      </StyledView>

      {/* Tab Header */}
      <StyledView className="flex-row px-6">
        <StyledTouchableOpacity 
          className={`flex-1 pb-3 border-b-2 ${
            activeTab === 'flash' ? 'border-sky' : 'border-transparent'
          }`}
          onPress={() => {
            setActiveTab('flash');
            navigation.navigate('SendMoney');
          }}
        >
          <StyledText className={`text-center text-xl font-semibold ${
            activeTab === 'flash' ? 'text-white' : 'text-white/50'
          }`}>
            Flash
          </StyledText>
        </StyledTouchableOpacity>
        <StyledTouchableOpacity 
          className={`flex-1 pb-3 border-b-2 ${
            activeTab === 'request' ? 'border-sky' : 'border-transparent'
          }`}
          onPress={() => setActiveTab('request')}
        >
          <StyledText className={`text-center text-xl font-semibold ${
            activeTab === 'request' ? 'text-white' : 'text-white/50'
          }`}>
            Request
          </StyledText>
        </StyledTouchableOpacity>
      </StyledView>

      {/* Scrollable Content */}
      <StyledScrollView 
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 12, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Recipient Card */}
        <StyledView className="bg-charcoal/50 border border-divider rounded-2xl p-6 mb-6">
          <StyledText className="text-white/70 text-lg mb-4">Request from</StyledText>
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
              <StyledText className="text-emerald text-sm">Share QR</StyledText>
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
        <StyledView className="bg-charcoal/50 border border-divider rounded-2xl p-6 mb-6">
          <StyledText className="text-white/70 text-lg mb-4">Amount</StyledText>
          <StyledTextInput
            className="text-white text-2xl bg-transparent border-0 p-0"
            placeholder="0"
            placeholderTextColor="#6F8A9A"
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
          />
        </StyledView>

        {/* Message Card */}
        <StyledView className="bg-charcoal/50 border border-divider rounded-2xl p-6 mb-6">
          <StyledText className="text-white/70 text-lg mb-4">Message</StyledText>
          <StyledTextInput
            className="text-white text-lg bg-transparent border-0 p-0"
            placeholder="What's this for?"
            placeholderTextColor="#6F8A9A"
            value={message}
            onChangeText={setMessage}
            multiline
          />
        </StyledView>

        {/* Include a Card - Viral Feature */}
        <StyledTouchableOpacity 
          className="flex-row items-center mb-8"
          onPress={() => setShowCards(!showCards)}
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

        {/* Viral Cards Selection */}
        {showCards && (
          <StyledView className="mb-6">
            <StyledText className="text-white text-lg font-semibold mb-4">Choose a vibe ✨</StyledText>
            <StyledView className="flex-row flex-wrap gap-4">
              {VIRAL_CARDS.map((card) => (
                <ViralCard
                  key={card.id}
                  id={card.id}
                  emoji={card.emoji}
                  title={card.title}
                  color={card.color}
                  isSelected={selectedCard === card.id}
                  onPress={(id) => {
                    setSelectedCard(selectedCard === id ? null : id);
                    setShowCards(false);
                  }}
                />
              ))}
            </StyledView>
          </StyledView>
        )}
      </StyledScrollView>

      {/* Bottom Button - Fixed Position */}
      <StyledView className="absolute bottom-0 left-0 right-0 bg-navy px-6 py-4 border-t border-divider/20">
        <Button
          title={requesting ? "Sending Request..." : "Request"}
          onPress={handleRequestPayment}
          disabled={!phone || !amount || requesting}
          loading={requesting}
          size="lg"
        />
      </StyledView>
    </StyledSafeAreaView>
  );
}