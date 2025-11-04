import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, Dimensions, TouchableOpacity } from 'react-native';
import { styled } from 'nativewind';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../ui';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledSafeAreaView = styled(SafeAreaView);
const StyledAnimatedView = styled(Animated.View);

const { height } = Dimensions.get('window');

export default function WelcomeScreen() {
  const navigation = useNavigation<any>();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <StyledSafeAreaView className="flex-1 bg-navy">
      <StyledView className="flex-1 justify-between px-8 py-16">
        
        {/* Top Section - Logo */}
        <StyledAnimatedView 
          className="items-center"
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }}
        >
          <StyledView className="w-20 h-20 bg-sky rounded-2xl items-center justify-center mb-6">
            <StyledText className="text-white text-3xl">⚡</StyledText>
          </StyledView>
          <StyledText className="text-white text-5xl font-thin tracking-wide">Flash</StyledText>
        </StyledAnimatedView>

        {/* Center Section - Message */}
        <StyledAnimatedView 
          className="items-center px-4"
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }}
        >
          <StyledText className="text-white text-3xl font-light text-center mb-4 leading-relaxed">
            Instant payments{'\n'}using your phone
          </StyledText>
          <StyledText className="text-white/60 text-base font-light text-center">
            Send money as easily as sending a text
          </StyledText>
        </StyledAnimatedView>

        {/* Bottom Section - CTA */}
        <StyledAnimatedView 
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }}
        >
          <StyledView className="space-y-4 mb-6">
            <Button
              title="Get Started"
              onPress={() => navigation.navigate('Register')}
              variant="primary"
              size="lg"
            />
            
            <StyledView className="items-center pt-4">
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <StyledText className="text-white/60 text-sm font-light">
                  Already have an account?
                </StyledText>
              </TouchableOpacity>
            </StyledView>
          </StyledView>

          <StyledView className="items-center">
            <StyledText className="text-white/30 text-xs font-light">
              Secured & Encrypted
            </StyledText>
          </StyledView>
        </StyledAnimatedView>
        
      </StyledView>
    </StyledSafeAreaView>
  );
}