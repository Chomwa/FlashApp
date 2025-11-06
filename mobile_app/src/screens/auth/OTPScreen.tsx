import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { styled } from 'nativewind';
import { useNavigation, useRoute } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Input, Button, Card } from '../../ui';
import { useAuth } from '../../context/AuthContext';
import { validateZambianPhone, formatZambianPhone } from '../../services/api';
import { showMessage } from 'react-native-flash-message';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTouchableOpacity = styled(TouchableOpacity);
const StyledSafeAreaView = styled(SafeAreaView);

export default function OTPScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { register } = useAuth();
  const { phone, fullName, password, debugCode } = route.params || {};
  
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [serverError, setServerError] = useState(false);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(resendCooldown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [resendCooldown]);

  // Since we already sent OTP from RegisterScreen, just show success
  useEffect(() => {
    if (phone) {
      setOtpSent(true);
      setServerError(false);
      
      showMessage({
        message: 'Code Already Sent',
        description: `Check your SMS messages for the verification code`,
        type: 'info',
        duration: 3000,
      });
    } else {
      // No phone number provided - should not happen
      setServerError(true);
      showMessage({
        message: 'Error',
        description: 'No phone number provided. Please go back and register again.',
        type: 'danger',
        duration: 5000,
      });
    }
  }, [phone]);

  const handleVerifyCode = async () => {
    // Block verification if there's a server error
    if (serverError) {
      showMessage({
        message: 'Cannot Verify Code',
        description: 'Please go back and fix the phone number issue first.',
        type: 'warning',
        duration: 5000,
      });
      return;
    }

    if (code.length !== 6) {
      showMessage({
        message: 'Invalid Code',
        description: 'Please enter a 6-digit verification code.',
        type: 'warning',
        duration: 3000,
      });
      return;
    }

    setLoading(true);
    
    try {
      // Step 1: Verify OTP first
      const { authAPI } = require('../../services/api');
      await authAPI.verifyOTP(phone, code, fullName);
      
      // Step 2: Complete registration (without OTP code since it's already verified)
      await register(phone, password, fullName);
      
      showMessage({
        message: 'Account Created Successfully!',
        description: 'Welcome to Flash',
        type: 'success',
        duration: 3000,
      });
      
      // Registration successful - AuthContext will handle navigation
      
    } catch (otpError) {
      console.error('❌ OTP verification failed:', otpError);

      // Show error message for invalid code
      const errorMessage = otpError?.response?.data?.error ||
                          otpError?.response?.data?.message ||
                          'Invalid verification code. Please check your SMS and try again.';

      showMessage({
        message: 'Verification Failed',
        description: errorMessage,
        type: 'danger',
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!canResend || serverError) {
      if (serverError) {
        showMessage({
          message: 'Cannot Resend Code',
          description: 'Please fix the phone number issue first.',
          type: 'warning',
          duration: 4000,
        });
      }
      return;
    }
    
    setCanResend(false);
    setResendCooldown(60);
    
    try {
      const phoneNumber = phone || '+260977888999';
      
      const response = await require('../../services/api').authAPI.sendOTP(phoneNumber);
      
      setOtpSent(true);
      showMessage({
        message: 'Code Resent',
        description: 'A new verification code has been sent to your phone.',
        type: 'success',
        duration: 4000,
      });
      
      if (response.debug_code) {
        showMessage({
          message: 'Development Mode',
          description: `Debug code: ${response.debug_code}`,
          type: 'info',
          duration: 8000,
        });
      }
    } catch (error: any) {
      console.error('Failed to resend OTP:', error);
      
      setServerError(true);
      showMessage({
        message: 'Failed to Resend',
        description: 'Please check your phone number and try again.',
        type: 'danger',
        duration: 5000,
      });
    }
  };

  const handleCodeChange = (text: string) => {
    // Only allow numeric input and limit to 6 digits
    const numericText = text.replace(/[^0-9]/g, '');
    if (numericText.length <= 6) {
      setCode(numericText);
    }
  };

  const formatPhoneDisplay = (phoneNumber: string) => {
    // Format +260971234567 to +260 97 123 4567
    if (phoneNumber.startsWith('+260')) {
      const number = phoneNumber.substring(4);
      return `+260 ${number.substring(0, 2)} ${number.substring(2, 5)} ${number.substring(5)}`;
    }
    return phoneNumber;
  };

  return (
    <StyledSafeAreaView className="flex-1 bg-navy">
      <StyledView className="flex-1 px-6">
        {/* Header with Back Button */}
        <StyledView className="flex-row items-center pt-4 pb-8">
          <StyledTouchableOpacity
            onPress={() => navigation.goBack()}
            className="mr-4 p-2"
          >
            <StyledText className="text-white text-2xl">←</StyledText>
          </StyledTouchableOpacity>
          <StyledView className="flex-1">
            <StyledText className="text-white text-xl font-bold">
              Verify Code
            </StyledText>
          </StyledView>
        </StyledView>

        {/* Content */}
        <StyledView className="flex-1">
          <StyledView className="mb-8">
            <StyledText className="text-white text-2xl font-bold mb-4">
              Verify your number
            </StyledText>
            <StyledText className="text-white/70 text-base leading-relaxed">
              We sent a 6-digit code to
            </StyledText>
            <StyledText className="text-white font-semibold text-lg">
              {formatPhoneDisplay(phone)}
            </StyledText>
          </StyledView>

        {/* Server Error Warning */}
        {serverError && (
          <StyledView className="mb-6 bg-red-500/20 p-4 rounded-xl border border-red-500/30">
            <StyledView className="flex-row items-center mb-2">
              <StyledText className="text-red-400 text-xl mr-2">⚠️</StyledText>
              <StyledText className="text-red-400 font-semibold text-base">
                Phone Number Error
              </StyledText>
            </StyledView>
            <StyledText className="text-red-300 text-sm">
              There's an issue with your phone number format. Please go back and enter a valid Zambian number.
            </StyledText>
          </StyledView>
        )}

        {/* Success Indicator */}
        {otpSent && !serverError && (
          <StyledView className="mb-6 bg-green-500/20 p-4 rounded-xl border border-green-500/30">
            <StyledView className="flex-row items-center mb-2">
              <StyledText className="text-green-400 text-xl mr-2">✅</StyledText>
              <StyledText className="text-green-400 font-semibold text-base">
                Code Sent Successfully
              </StyledText>
            </StyledView>
            <StyledText className="text-green-300 text-sm">
              Check your SMS messages for the 6-digit verification code.
            </StyledText>
          </StyledView>
        )}

        {/* OTP Input */}
        <StyledView className="mb-8">
          <Input
            label="Verification Code"
            placeholder="000000"
            value={code}
            onChangeText={handleCodeChange}
            keyboardType="number-pad"
            maxLength={6}
            autoFocus
            disabled={serverError}
          />
          
          {/* Debug Code Display (Development Only) */}
          {debugCode && __DEV__ && (
            <StyledView className="mt-4 bg-gold/20 p-3 rounded-xl">
              <StyledText className="text-gold text-center font-bold">
                🛠️ DEBUG CODE: {debugCode}
              </StyledText>
            </StyledView>
          )}
          
          <StyledView className="mt-4 flex-row justify-center">
            <StyledTouchableOpacity
              onPress={() => navigation.goBack()}
            >
              <StyledText className="text-sky text-base">
                Wrong number? Change it
              </StyledText>
            </StyledTouchableOpacity>
          </StyledView>
        </StyledView>

        {/* Verify Button */}
        <StyledView className="mb-8">
          <Button
            title={loading ? "Verifying..." : serverError ? "Fix Phone Number First" : "Verify Code"}
            onPress={handleVerifyCode}
            disabled={code.length !== 6 || serverError}
            loading={loading}
          />
          {serverError && (
            <StyledText className="text-red-400 text-sm text-center mt-2">
              Please go back and enter a valid phone number
            </StyledText>
          )}
        </StyledView>

        {/* Resend Code */}
        <StyledView className="mb-8">
          <Card>
            <StyledView className="items-center">
              <StyledText className="text-white/70 text-sm mb-2">
                Didn't receive the code?
              </StyledText>
              {canResend && !serverError ? (
                <StyledTouchableOpacity onPress={handleResendCode}>
                  <StyledText className="text-emerald font-medium">
                    Resend Code
                  </StyledText>
                </StyledTouchableOpacity>
              ) : serverError ? (
                <StyledText className="text-red-400 text-sm">
                  Fix phone number to resend
                </StyledText>
              ) : (
                <StyledText className="text-white/50 text-sm">
                  Resend in {resendCooldown}s
                </StyledText>
              )}
            </StyledView>
          </Card>
        </StyledView>

          {/* Help Info */}
          <StyledView className="mt-8 mb-8">
            <StyledView className="bg-gold/10 p-4 rounded-xl">
              <StyledText className="text-gold text-sm text-center">
                💡 Check your SMS messages. The code might take up to 2 minutes to arrive.
              </StyledText>
            </StyledView>
          </StyledView>
        </StyledView>
      </StyledView>
    </StyledSafeAreaView>
  );
}