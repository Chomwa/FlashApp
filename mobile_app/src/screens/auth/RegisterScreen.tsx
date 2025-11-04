import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Animated, KeyboardAvoidingView, Platform, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { styled } from 'nativewind';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { showMessage } from 'react-native-flash-message';
import { Input, Button } from '../../ui';
import { useAuth } from '../../context/AuthContext';
import { validateZambianPhone, formatZambianPhone, authAPI } from '../../services/api';
import { getApiErrorMessage, getPhoneValidationMessage } from '../../utils/errorHandler';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledSafeAreaView = styled(SafeAreaView);
const StyledAnimatedView = styled(Animated.View);
const StyledTouchableOpacity = styled(TouchableOpacity);
const StyledKeyboardAvoidingView = styled(KeyboardAvoidingView);
const StyledScrollView = styled(ScrollView);

const { height: screenHeight } = Dimensions.get('window');

export default function RegisterScreen() {
  const navigation = useNavigation<any>();
  const [phone, setPhone] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [phoneError, setPhoneError] = useState('');
  const { register } = useAuth();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handlePhoneChange = (text: string) => {
    setPhone(text);
    
    // Real-time validation feedback
    if (text.length > 0 && !validateZambianPhone(text)) {
      const errorMessage = getPhoneValidationMessage(text);
      setPhoneError(errorMessage === 'Valid phone number' ? '' : errorMessage);
    } else {
      setPhoneError('');
    }
  };

  const handleRegister = async () => {
    if (!phone || !fullName || !password || !confirmPassword) {
      showMessage({
        message: 'Please fill in all fields',
        type: 'warning',
      });
      return;
    }

    // Validate phone number
    if (!validateZambianPhone(phone)) {
      showMessage({
        message: 'Please enter a valid Zambian phone number',
        description: 'Format: +260 9XX XXX XXX or 09X XXX XXXX',
        type: 'warning',
        duration: 5000,
      });
      return;
    }

    if (password !== confirmPassword) {
      showMessage({
        message: 'Passwords do not match',
        type: 'warning',
      });
      return;
    }

    if (password.length < 6) {
      showMessage({
        message: 'Password must be at least 6 characters',
        type: 'warning',
      });
      return;
    }

    setLoading(true);
    try {
      // Format phone number before validation
      const formattedPhone = formatZambianPhone(phone);
      
      // Test phone number validity by sending OTP
      await authAPI.sendOTP(formattedPhone);
      
      // If we reach here, OTP was sent successfully
      setLoading(false);
      
      // Navigate to OTP screen
      navigation.navigate('OTP', {
        phone: formattedPhone,
        fullName,
        password,
      });
      
      // Show success message
      showMessage({
        message: 'Verification Code Sent',
        description: `We've sent a code to ${formattedPhone}`,
        type: 'success',
        duration: 3000,
      });
      
    } catch (error: any) {
      setLoading(false);
      const errorMessage = getApiErrorMessage(error);
      
      // Don't navigate if there's an error - keep user on registration screen
      showMessage({
        message: 'Phone Number Error',
        description: errorMessage,
        type: 'danger',
        duration: 7000,
      });
    }
  };

  return (
    <StyledSafeAreaView className="flex-1 bg-navy">
      <StyledKeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}>
        
        <StyledScrollView 
          className="flex-1"
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          
          <StyledView className="flex-1 px-6" style={{ minHeight: screenHeight * 0.9 }}>
            
            {/* Header */}
            <StyledAnimatedView 
              className="pt-4 pb-4"
              style={{
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }}
            >
              <StyledTouchableOpacity 
                className="w-10 h-10 items-center justify-center mb-4"
                onPress={() => navigation.goBack()}
              >
                <StyledText className="text-white text-2xl font-light">←</StyledText>
              </StyledTouchableOpacity>
              
              <StyledText className="text-white text-2xl font-thin mb-1">
                Create Account
              </StyledText>
              <StyledText className="text-white/60 text-sm font-light">
                Join Flash and start sending money instantly
              </StyledText>
            </StyledAnimatedView>

            {/* Form Container */}
            <StyledAnimatedView 
              className="flex-1 justify-between py-2"
              style={{
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }}
            >
              
              {/* Input Fields */}
              <StyledView className="space-y-4">
                <StyledView>
                  <StyledText className="text-white/80 text-sm font-light mb-2 ml-1">
                    Full Name
                  </StyledText>
                  <Input
                    value={fullName}
                    onChangeText={setFullName}
                    placeholder="John Mwamba"
                    autoCapitalize="words"
                    autoFocus
                  />
                </StyledView>

                <StyledView>
                  <StyledText className="text-white/80 text-sm font-light mb-2 ml-1">
                    Phone Number
                  </StyledText>
                  <Input
                    value={phone}
                    onChangeText={handlePhoneChange}
                    placeholder="+260 97 123 4567"
                    keyboardType="phone-pad"
                  />
                  {phoneError ? (
                    <StyledText className="text-red-400 text-xs mt-1 ml-1">
                      {phoneError}
                    </StyledText>
                  ) : (
                    <StyledText className="text-white/40 text-xs mt-1 ml-1">
                      We support MTN and Airtel Zambia numbers
                    </StyledText>
                  )}
                </StyledView>

                <StyledView>
                  <StyledText className="text-white/80 text-sm font-light mb-2 ml-1">
                    Create Password
                  </StyledText>
                  <Input
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Minimum 6 characters"
                    secureTextEntry
                  />
                </StyledView>

                <StyledView>
                  <StyledText className="text-white/80 text-sm font-light mb-2 ml-1">
                    Confirm Password
                  </StyledText>
                  <Input
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    placeholder="Re-enter your password"
                    secureTextEntry
                  />
                </StyledView>
              </StyledView>

              {/* Button and Footer */}
              <StyledView className="mt-6 space-y-4">
                <Button
                  title={loading ? "Creating account..." : "Create Account"}
                  onPress={handleRegister}
                  disabled={loading}
                  loading={loading}
                  size="lg"
                  variant="primary"
                />
                
                {/* Footer - Always visible */}
                <StyledView className="items-center py-4">
                  <StyledView className="flex-row items-center">
                    <StyledText className="text-white/60 text-sm font-light">
                      Already have an account? 
                    </StyledText>
                    <StyledTouchableOpacity 
                      className="ml-1"
                      onPress={() => navigation.navigate('Login')}
                    >
                      <StyledText className="text-sky text-sm font-light">
                        Sign in
                      </StyledText>
                    </StyledTouchableOpacity>
                  </StyledView>
                </StyledView>
              </StyledView>
              
            </StyledAnimatedView>
            
          </StyledView>
          
        </StyledScrollView>
        
      </StyledKeyboardAvoidingView>
    </StyledSafeAreaView>
  );
}
