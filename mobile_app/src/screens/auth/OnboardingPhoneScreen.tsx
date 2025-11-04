import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Animated } from 'react-native';
import { styled } from 'nativewind';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Input, Button } from '../../ui';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTouchableOpacity = styled(TouchableOpacity);
const StyledSafeAreaView = styled(SafeAreaView);
const StyledAnimatedView = styled(Animated.View);

export default function OnboardingPhoneScreen() {
  const navigation = useNavigation<any>();
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  
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

  const handleSendCode = async () => {
    if (!phone || phone.length < 10) {
      return;
    }

    setLoading(true);
    
    try {
      console.log('📱 Sending OTP to:', phone);
      
      // Send OTP using the real API
      const response = await require('../../services/api').authAPI.sendOTP(phone);
      console.log('✅ OTP sent successfully:', response);
      
      const debugCode = response.debug_code || '123456';
      
      // Navigate to OTP screen
      navigation.navigate('OTP', { phone, debugCode });
      
    } catch (error) {
      console.error('❌ Failed to send OTP:', error);
      
      // Fallback to debug code for development
      const debugCode = '123456';
      navigation.navigate('OTP', { phone, debugCode });
    } finally {
      setLoading(false);
    }
  };

  const formatPhoneNumber = (text: string) => {
    // Remove non-numeric characters
    const cleaned = text.replace(/\D/g, '');
    
    // Add +260 prefix if not present
    if (cleaned.length > 0 && !cleaned.startsWith('260')) {
      if (cleaned.startsWith('0')) {
        return `+260${cleaned.substring(1)}`;
      } else if (cleaned.length <= 9) {
        return `+260${cleaned}`;
      }
    } else if (cleaned.startsWith('260')) {
      return `+${cleaned}`;
    }
    
    return text;
  };

  const handlePhoneChange = (text: string) => {
    const formatted = formatPhoneNumber(text);
    setPhone(formatted);
  };

  return (
    <StyledSafeAreaView className="flex-1 bg-navy">
      <StyledView className="flex-1 px-8">
        
        {/* Header */}
        <StyledAnimatedView 
          className="pt-4 pb-12"
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }}
        >
          <StyledTouchableOpacity 
            className="w-10 h-10 items-center justify-center mb-8"
            onPress={() => navigation.goBack()}
          >
            <StyledText className="text-white text-2xl font-light">←</StyledText>
          </StyledTouchableOpacity>
          
          <StyledText className="text-white text-4xl font-thin mb-3">
            Your phone number
          </StyledText>
          <StyledText className="text-white/60 text-lg font-light">
            We'll send a verification code
          </StyledText>
        </StyledAnimatedView>

        {/* Form */}
        <StyledAnimatedView 
          className="flex-1 justify-center"
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }}
        >
          <StyledView className="mb-8">
            <StyledText className="text-white/80 text-sm font-light mb-3 ml-1">
              Phone Number
            </StyledText>
            <Input
              value={phone}
              onChangeText={handlePhoneChange}
              placeholder="+260 97 123 4567"
              keyboardType="phone-pad"
              autoFocus
            />
            <StyledText className="text-white/40 text-xs font-light mt-2 ml-1">
              We support MTN and Airtel Zambia numbers
            </StyledText>
          </StyledView>

          <Button
            title={loading ? "Sending code..." : "Continue"}
            onPress={handleSendCode}
            disabled={!phone || phone.length < 10 || loading}
            loading={loading}
            size="lg"
            variant="primary"
          />
        </StyledAnimatedView>

        {/* Footer */}
        <StyledAnimatedView 
          className="pb-8 items-center"
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }}
        >
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
        </StyledAnimatedView>
        
      </StyledView>
    </StyledSafeAreaView>
  );
}