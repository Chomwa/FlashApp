import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Animated, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { styled } from 'nativewind';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { showMessage } from 'react-native-flash-message';
import { Input, Button } from '../../ui';
import { useAuth } from '../../context/AuthContext';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledSafeAreaView = styled(SafeAreaView);
const StyledAnimatedView = styled(Animated.View);
const StyledTouchableOpacity = styled(TouchableOpacity);
const StyledKeyboardAvoidingView = styled(KeyboardAvoidingView);

export default function LoginScreen() {
  const navigation = useNavigation<any>();
  const { login } = useAuth();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
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

  const formatPhoneNumber = (text: string) => {
    // Remove non-numeric characters except + at start
    const cleaned = text.replace(/[^+\d]/g, '');
    
    // If user starts typing without +260, help them
    if (cleaned.length > 0 && !cleaned.startsWith('+')) {
      const numeric = cleaned.replace(/\D/g, '');
      if (numeric.startsWith('0')) {
        // Convert 0971234567 to +260971234567
        return `+260${numeric.substring(1)}`;
      } else if (numeric.length <= 9 && !numeric.startsWith('260')) {
        // Convert 971234567 to +260971234567
        return `+260${numeric}`;
      }
    }
    
    return cleaned;
  };

  const handlePhoneChange = (text: string) => {
    const formatted = formatPhoneNumber(text);
    setPhone(formatted);
  };

  const handleLogin = async () => {
    if (!phone || phone.length < 10) {
      showMessage({
        message: 'Invalid Phone Number',
        description: 'Please enter a valid phone number',
        type: 'warning',
        duration: 3000,
      });
      return;
    }

    if (!password) {
      showMessage({
        message: 'Password Required',
        description: 'Please enter your password',
        type: 'warning',  
        duration: 3000,
      });
      return;
    }

    setLoading(true);
    try {
      await login(phone, password);
      
      showMessage({
        message: 'Welcome back!',
        description: 'Successfully logged in',
        type: 'success',
        duration: 3000,
      });
      
      // Navigation handled by AuthContext
    } catch (error: any) {
      setLoading(false);
      const errorMessage = error.response?.data?.message || 'Invalid phone number or password';
      
      showMessage({
        message: 'Login Failed',
        description: errorMessage,
        type: 'danger',
        duration: 5000,
      });
    }
  };

  return (
    <StyledSafeAreaView className="flex-1 bg-navy">
      <StyledKeyboardAvoidingView 
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
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
              Welcome back
            </StyledText>
            <StyledText className="text-white/60 text-lg font-light">
              Enter your credentials to sign in
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
            <StyledView className="space-y-6">
              <StyledView>
                <StyledText className="text-white/80 text-sm font-light mb-3 ml-1">
                  Phone Number
                </StyledText>
                <Input
                  value={phone}
                  onChangeText={handlePhoneChange}
                  placeholder="Enter phone number"
                  keyboardType="phone-pad"
                  autoFocus
                />
                <StyledText className="text-white/40 text-xs font-light mt-2 ml-1">
                  Enter your full number (e.g., +260977777777) or just 977777777
                </StyledText>
              </StyledView>

              <StyledView>
                <StyledText className="text-white/80 text-sm font-light mb-3 ml-1">
                  Password
                </StyledText>
                <Input
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Enter your password"
                  secureTextEntry
                />
              </StyledView>
            </StyledView>

            <StyledView className="mt-8">
              <Button
                title={loading ? "Signing in..." : "Sign In"}
                onPress={handleLogin}
                disabled={!phone || !password || loading}
                loading={loading}
                size="lg"
                variant="primary"
              />
            </StyledView>
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
                New to Flash? 
              </StyledText>
              <StyledTouchableOpacity 
                className="ml-1"
                onPress={() => navigation.navigate('Register')}
              >
                <StyledText className="text-sky text-sm font-light">
                  Create account
                </StyledText>
              </StyledTouchableOpacity>
            </StyledView>
          </StyledAnimatedView>
          
        </StyledView>
      </StyledKeyboardAvoidingView>
    </StyledSafeAreaView>
  );
}