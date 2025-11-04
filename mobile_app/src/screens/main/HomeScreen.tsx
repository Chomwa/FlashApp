import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { styled } from 'nativewind';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../ui';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTouchableOpacity = styled(TouchableOpacity);
const StyledScrollView = styled(ScrollView);
const StyledSafeAreaView = styled(SafeAreaView);

export default function HomeScreen() {
  const navigation = useNavigation<any>();

  return (
    <StyledSafeAreaView className="flex-1 bg-navy">
      <StyledView className="flex-1 px-8 py-12">
        
        {/* Top Section - Branding */}
        <StyledView className="items-center mt-16 mb-32">
          <StyledView className="w-16 h-16 bg-sky rounded-2xl items-center justify-center mb-4">
            <StyledText className="text-white text-2xl">⚡</StyledText>
          </StyledView>
          <StyledText className="text-white text-4xl font-thin tracking-wide">Flash</StyledText>
        </StyledView>

        {/* Action Buttons - Moved towards bottom */}
        <StyledView className="flex-1 justify-end pb-20">
          {/* Two Buttons Side by Side - Like Swish */}
          <StyledView className="flex-row gap-4 w-full">
            <StyledView className="flex-1">
              <Button
                title="Flash"
                onPress={() => navigation.navigate('SendMoney')}
                size="lg"
              />
            </StyledView>
            <StyledView className="flex-1">
              <Button
                title="Scan"
                onPress={() => navigation.navigate('Scan')}
                variant="secondary"
                size="lg"
              />
            </StyledView>
          </StyledView>
        </StyledView>
        
      </StyledView>
    </StyledSafeAreaView>
  );
}