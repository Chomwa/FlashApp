import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, Alert, Switch } from 'react-native';
import { styled } from 'nativewind';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../ui';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTouchableOpacity = styled(TouchableOpacity);
const StyledTextInput = styled(TextInput);
const StyledScrollView = styled(ScrollView);
const StyledSafeAreaView = styled(SafeAreaView);
const StyledSwitch = styled(Switch);

export default function SecuritySettingsScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();
  
  // Security settings state
  const [biometricsEnabled, setBiometricsEnabled] = useState(false);
  const [autoLockEnabled, setAutoLockEnabled] = useState(true);
  const [autoLockTime, setAutoLockTime] = useState('5'); // minutes
  
  // PIN change state
  const [showPinChange, setShowPinChange] = useState(false);
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [changingPin, setChangingPin] = useState(false);

  const securityOptions = [
    {
      icon: '📱',
      title: 'Change Phone Number',
      subtitle: 'Update your registered phone number',
      action: () => Alert.alert('Contact Support', 'To change your phone number, please contact Flash support for security verification.')
    },
    {
      icon: '🔐',
      title: 'Change PIN',
      subtitle: 'Update your 6-digit PIN for transactions',
      action: () => setShowPinChange(true)
    },
    {
      icon: '👆',
      title: 'Biometric Authentication',
      subtitle: 'Use fingerprint or Face ID for quick access',
      toggle: true,
      value: biometricsEnabled,
      onChange: setBiometricsEnabled
    },
    {
      icon: '🔒',
      title: 'Auto-Lock',
      subtitle: 'Automatically lock app after inactivity',
      toggle: true,
      value: autoLockEnabled,
      onChange: setAutoLockEnabled
    }
  ];

  const handlePinChange = async () => {
    if (!currentPin || !newPin || !confirmPin) {
      Alert.alert('Error', 'Please fill in all PIN fields');
      return;
    }

    if (newPin.length !== 6 || !/^\d+$/.test(newPin)) {
      Alert.alert('Error', 'PIN must be exactly 6 digits');
      return;
    }

    if (newPin !== confirmPin) {
      Alert.alert('Error', 'New PIN and confirmation do not match');
      return;
    }

    if (currentPin === newPin) {
      Alert.alert('Error', 'New PIN must be different from current PIN');
      return;
    }

    setChangingPin(true);
    try {
      const response = await api.post('/auth/change-pin/', {
        current_pin: currentPin,
        new_pin: newPin
      });
      
      Alert.alert('Success', 'Your PIN has been changed successfully', [
        { text: 'OK', onPress: () => {
          setShowPinChange(false);
          setCurrentPin('');
          setNewPin('');
          setConfirmPin('');
        }}
      ]);
    } catch (error) {
      console.error('❌ Error changing PIN:', error);
      
      let errorMessage = 'Failed to change PIN. Please try again.';
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setChangingPin(false);
    }
  };

  const renderPinInput = (value: string, onChangeText: (text: string) => void, placeholder: string) => (
    <StyledView className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-4">
      <StyledTextInput
        className="text-white text-lg font-light text-center"
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#6F8A9A"
        keyboardType="numeric"
        maxLength={6}
        secureTextEntry
      />
    </StyledView>
  );

  return (
    <StyledSafeAreaView className="flex-1 bg-navy">
      {/* Header */}
      <StyledView className="flex-row items-center justify-between px-6 py-4 border-b border-white/10">
        <StyledTouchableOpacity onPress={() => navigation.goBack()}>
          <StyledText className="text-white text-2xl font-light">‹</StyledText>
        </StyledTouchableOpacity>
        <StyledText className="text-white text-lg font-light">Security Settings</StyledText>
        <StyledView className="w-6" />
      </StyledView>

      <StyledScrollView 
        className="flex-1 px-6"
        contentContainerStyle={{ paddingTop: 24, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {!showPinChange ? (
          <>
            {/* Account Info */}
            <StyledView className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8">
              <StyledView className="items-center">
                <StyledView className="w-16 h-16 bg-sky rounded-2xl items-center justify-center mb-4">
                  <StyledText className="text-white text-xl font-light">
                    {user?.full_name?.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </StyledText>
                </StyledView>
                <StyledText className="text-white text-lg font-light mb-1">
                  {user?.full_name}
                </StyledText>
                <StyledText className="text-white/60 font-light">
                  {user?.phone_number}
                </StyledText>
              </StyledView>
            </StyledView>

            {/* Security Options */}
            <StyledView className="space-y-4 mb-8">
              {securityOptions.map((option, index) => (
                <StyledView key={index} className="bg-white/5 border border-white/10 rounded-2xl p-6">
                  <StyledTouchableOpacity
                    onPress={option.toggle ? undefined : option.action}
                    className="flex-row items-center"
                  >
                    <StyledView className="w-12 h-12 bg-white/10 rounded-2xl items-center justify-center mr-4">
                      <StyledText className="text-xl">{option.icon}</StyledText>
                    </StyledView>
                    <StyledView className="flex-1">
                      <StyledText className="text-white font-light text-lg mb-1">
                        {option.title}
                      </StyledText>
                      <StyledText className="text-white/50 text-sm font-light">
                        {option.subtitle}
                      </StyledText>
                    </StyledView>
                    {option.toggle ? (
                      <StyledSwitch
                        value={option.value}
                        onValueChange={option.onChange}
                        trackColor={{ false: '#374151', true: '#0EA5E9' }}
                        thumbColor={option.value ? '#ffffff' : '#9CA3AF'}
                      />
                    ) : (
                      <StyledText className="text-white/30 ml-2 text-xl">›</StyledText>
                    )}
                  </StyledTouchableOpacity>
                </StyledView>
              ))}
            </StyledView>

            {/* Auto-Lock Time Selection */}
            {autoLockEnabled && (
              <StyledView className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8">
                <StyledText className="text-white font-light text-lg mb-4">Auto-Lock Timer</StyledText>
                <StyledView className="flex-row justify-between">
                  {['1', '5', '10', '30'].map((time) => (
                    <StyledTouchableOpacity
                      key={time}
                      onPress={() => setAutoLockTime(time)}
                      className={`flex-1 mx-1 py-3 rounded-xl ${
                        autoLockTime === time ? 'bg-sky/20 border border-sky/30' : 'bg-white/5 border border-white/10'
                      }`}
                    >
                      <StyledText className={`text-center font-light ${
                        autoLockTime === time ? 'text-sky' : 'text-white/70'
                      }`}>
                        {time} min
                      </StyledText>
                    </StyledTouchableOpacity>
                  ))}
                </StyledView>
              </StyledView>
            )}

            {/* Security Tips */}
            <StyledView className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-6">
              <StyledView className="flex-row items-start">
                <StyledView className="w-10 h-10 bg-amber-500/20 rounded-2xl items-center justify-center mr-4 mt-1">
                  <StyledText className="text-amber-400 text-lg">💡</StyledText>
                </StyledView>
                <StyledView className="flex-1">
                  <StyledText className="text-amber-400 font-light text-lg mb-2">
                    Security Tips
                  </StyledText>
                  <StyledText className="text-amber-400/80 text-sm font-light leading-relaxed">
                    • Never share your PIN with anyone{"\n"}
                    • Use a unique PIN that's hard to guess{"\n"}
                    • Enable biometric authentication for convenience{"\n"}
                    • Keep your app updated for latest security features
                  </StyledText>
                </StyledView>
              </StyledView>
            </StyledView>
          </>
        ) : (
          /* PIN Change Form */
          <>
            <StyledView className="mb-8">
              <StyledText className="text-white text-xl font-light mb-6 text-center">
                Change Transaction PIN
              </StyledText>
              
              <StyledText className="text-white/80 text-sm font-light mb-3">Current PIN</StyledText>
              {renderPinInput(currentPin, setCurrentPin, '• • • • • •')}
              
              <StyledText className="text-white/80 text-sm font-light mb-3">New PIN</StyledText>
              {renderPinInput(newPin, setNewPin, '• • • • • •')}
              
              <StyledText className="text-white/80 text-sm font-light mb-3">Confirm New PIN</StyledText>
              {renderPinInput(confirmPin, setConfirmPin, '• • • • • •')}
            </StyledView>

            <StyledView className="space-y-4">
              <Button
                title={changingPin ? "Changing PIN..." : "Change PIN"}
                onPress={handlePinChange}
                disabled={changingPin}
                loading={changingPin}
                size="lg"
                variant="primary"
              />
              <Button
                title="Cancel"
                onPress={() => {
                  setShowPinChange(false);
                  setCurrentPin('');
                  setNewPin('');
                  setConfirmPin('');
                }}
                size="lg"
                variant="ghost"
              />
            </StyledView>

            {/* PIN Requirements */}
            <StyledView className="bg-sky/10 border border-sky/20 rounded-2xl p-6 mt-8">
              <StyledText className="text-sky font-light text-lg mb-2">
                PIN Requirements
              </StyledText>
              <StyledText className="text-sky/80 text-sm font-light leading-relaxed">
                • Must be exactly 6 digits{"\n"}
                • Cannot be the same as your current PIN{"\n"}
                • Avoid obvious patterns (123456, 111111){"\n"}
                • Don't use your birth date or phone number
              </StyledText>
            </StyledView>
          </>
        )}
      </StyledScrollView>
    </StyledSafeAreaView>
  );
}