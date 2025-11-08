import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, Alert } from 'react-native';
import { styled } from 'nativewind';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../ui';
import { useAuth } from '../../context/AuthContext';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTouchableOpacity = styled(TouchableOpacity);
const StyledTextInput = styled(TextInput);
const StyledScrollView = styled(ScrollView);
const StyledSafeAreaView = styled(SafeAreaView);

const ReceiveMoneyScreen = () => {
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [selectedContact, setSelectedContact] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'request' | 'qr'>('request');

  const handleRequestMoney = () => {
    if (!selectedContact || !amount) {
      Alert.alert('Missing Information', 'Please select a contact and enter an amount.');
      return;
    }
    
    // TODO: Implement request money API call
    Alert.alert(
      'Request Sent',
      `Requested ${amount} ZMW from ${selectedContact.name}`,
      [{ text: 'OK', onPress: () => navigation.goBack() }]
    );
  };

  const handleGenerateQR = () => {
    if (!amount) {
      Alert.alert('Enter Amount', 'Please enter an amount to generate QR code.');
      return;
    }
    
    // Navigate to MyQR screen with amount
    navigation.navigate('MyQR');
  };

  return (
    <StyledSafeAreaView className="flex-1 bg-navy">
      {/* Header */}
      <StyledView className="flex-row items-center justify-between px-6 py-3 mt-2">
        <StyledTouchableOpacity onPress={() => navigation.goBack()}>
          <StyledText className="text-white text-2xl font-light">✕</StyledText>
        </StyledTouchableOpacity>
        <StyledText className="text-white text-xl font-light">Receive Money</StyledText>
        <StyledView className="w-8" />
      </StyledView>

      {/* Tab Header */}
      <StyledView className="flex-row px-8 mb-4">
        <StyledTouchableOpacity 
          className={`flex-1 pb-4 border-b ${
            activeTab === 'request' ? 'border-sky' : 'border-white/10'
          }`}
          onPress={() => setActiveTab('request')}
        >
          <StyledText className={`text-center text-lg font-light ${
            activeTab === 'request' ? 'text-white' : 'text-white/50'
          }`}>
            Request
          </StyledText>
        </StyledTouchableOpacity>
        <StyledTouchableOpacity 
          className={`flex-1 pb-4 border-b ${
            activeTab === 'qr' ? 'border-sky' : 'border-white/10'
          }`}
          onPress={() => setActiveTab('qr')}
        >
          <StyledText className={`text-center text-lg font-light ${
            activeTab === 'qr' ? 'text-white' : 'text-white/50'
          }`}>
            QR Code
          </StyledText>
        </StyledTouchableOpacity>
      </StyledView>

      {/* Content */}
      <StyledScrollView 
        className="flex-1 px-6"
        showsVerticalScrollIndicator={false}
      >
        {/* Amount Input */}
        <StyledView className="bg-white/5 border border-white/10 rounded-3xl p-8 mb-6">
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

        {/* Note Input */}
        <StyledView className="bg-white/5 border border-white/10 rounded-3xl p-8 mb-6">
          <StyledText className="text-white/80 text-lg font-light mb-6">Note (Optional)</StyledText>
          <StyledTextInput
            className="text-white text-lg font-light bg-transparent border-0 p-0"
            placeholder="What's this for?"
            placeholderTextColor="#6F8A9A"
            value={note}
            onChangeText={setNote}
            multiline
          />
        </StyledView>

        {activeTab === 'request' && (
          <StyledView className="bg-white/5 border border-white/10 rounded-3xl p-8 mb-8">
            <StyledText className="text-white/80 text-lg font-light mb-6">From</StyledText>
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
                <StyledTouchableOpacity onPress={() => setSelectedContact(null)}>
                  <StyledText className="text-sky font-medium">Change</StyledText>
                </StyledTouchableOpacity>
              </StyledView>
            ) : (
              <StyledTouchableOpacity 
                className="border border-white/20 rounded-2xl p-4"
                onPress={() => Alert.alert('Coming Soon', 'Contact selection will be available soon!')}
              >
                <StyledText className="text-white/60 text-lg">
                  Select contact...
                </StyledText>
              </StyledTouchableOpacity>
            )}
          </StyledView>
        )}

        {activeTab === 'qr' && (
          <StyledView className="bg-white/5 border border-white/10 rounded-3xl p-8 mb-8">
            <StyledText className="text-white text-lg font-light mb-4">
              QR Code Payment
            </StyledText>
            <StyledText className="text-white/70 font-light">
              Generate a QR code that anyone can scan to send you money instantly.
            </StyledText>
          </StyledView>
        )}
      </StyledScrollView>

      {/* Bottom Action */}
      <StyledView className="px-6 py-6 border-t border-white/10">
        <Button
          title={activeTab === 'request' ? "Request Flash" : "Generate QR Code"}
          onPress={activeTab === 'request' ? handleRequestMoney : handleGenerateQR}
          disabled={!amount || (activeTab === 'request' && !selectedContact)}
          size="lg"
          variant="primary"
        />
      </StyledView>
    </StyledSafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
  },
});

export default ReceiveMoneyScreen;