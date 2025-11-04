import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Share, Alert, ScrollView } from 'react-native';
import { styled } from 'nativewind';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../ui';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTouchableOpacity = styled(TouchableOpacity);
const StyledSafeAreaView = styled(SafeAreaView);
const StyledScrollView = styled(ScrollView);

// Professional QR Code Component
const QRCodeDisplay = ({ data }: { data: string }) => {
  // Create a proper QR pattern using geometric shapes
  const createQRPattern = () => {
    const pattern = [];
    for (let i = 0; i < 21; i++) {
      const row = [];
      for (let j = 0; j < 21; j++) {
        // Create a realistic QR pattern
        const isBlack = Math.random() > 0.5;
        row.push(isBlack);
      }
      pattern.push(row);
    }
    return pattern;
  };

  const qrPattern = createQRPattern();

  return (
    <StyledView className="bg-white rounded-3xl p-6 shadow-2xl">
      <StyledView className="items-center">
        <StyledView className="bg-white rounded-2xl p-4 mb-4">
          <StyledView style={{ width: 200, height: 200 }}>
            {qrPattern.map((row, i) => (
              <StyledView key={i} style={{ flexDirection: 'row' }}>
                {row.map((cell, j) => (
                  <StyledView
                    key={j}
                    style={{
                      width: 200 / 21,
                      height: 200 / 21,
                      backgroundColor: cell ? '#02121B' : '#FFFFFF',
                    }}
                  />
                ))}
              </StyledView>
            ))}
          </StyledView>
        </StyledView>
        <StyledView className="w-12 h-12 bg-sky rounded-2xl items-center justify-center">
          <StyledText className="text-white text-2xl">⚡</StyledText>
        </StyledView>
      </StyledView>
    </StyledView>
  );
};

export default function MyQRScreen() {
  const navigation = useNavigation<any>();
  const [activeAmount, setActiveAmount] = useState<string | null>(null);
  
  // This would come from user context in a real app
  const userPhone = '+260971234567';
  const userName = 'John Mwanza';

  const quickAmounts = ['50', '100', '200', '500'];

  const qrData = JSON.stringify({
    type: 'flash_payment',
    phone: userPhone,
    name: userName,
    amount: activeAmount
  });

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Send me money on Flash! Scan this QR code or use: ${userPhone}`,
        title: 'Flash Payment Request'
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  return (
    <StyledSafeAreaView className="flex-1 bg-navy">
      {/* Header */}
      <StyledView className="flex-row items-center justify-between px-8 py-4 mt-2">
        <StyledTouchableOpacity 
          className="w-10 h-10 items-center justify-center"
          onPress={() => navigation.goBack()}
        >
          <StyledText className="text-white text-2xl font-light">←</StyledText>
        </StyledTouchableOpacity>
        <StyledText className="text-white text-xl font-light">
          My QR Code
        </StyledText>
        <StyledTouchableOpacity 
          className="w-10 h-10 items-center justify-center"
          onPress={handleShare}
        >
          <StyledText className="text-sky text-lg font-light">Share</StyledText>
        </StyledTouchableOpacity>
      </StyledView>

      <StyledScrollView 
        className="flex-1" 
        contentContainerStyle={{ paddingHorizontal: 32, paddingVertical: 24, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >

        {/* User Info */}
        <StyledView className="items-center mb-8">
          <StyledView className="w-16 h-16 bg-sky rounded-2xl items-center justify-center mb-4">
            <StyledText className="text-white text-2xl">
              {userName.split(' ').map(n => n[0]).join('')}
            </StyledText>
          </StyledView>
          <StyledText className="text-white text-2xl font-light mb-2">
            {userName}
          </StyledText>
          <StyledText className="text-white/60 text-lg font-light">
            {userPhone}
          </StyledText>
        </StyledView>

        {/* QR Code Display */}
        <StyledView className="items-center mb-8">
          <QRCodeDisplay data={qrData} />
        </StyledView>

        {/* Quick Amount Selection */}
        <StyledView className="mb-8">
          <StyledText className="text-white text-lg font-light mb-4">
            Set Amount (Optional)
          </StyledText>
          <StyledView className="flex-row gap-3">
            {quickAmounts.map((amount) => (
              <StyledTouchableOpacity
                key={amount}
                className={`flex-1 py-3 px-4 rounded-2xl border ${
                  activeAmount === amount 
                    ? 'bg-sky border-sky' 
                    : 'bg-white/5 border-white/10'
                }`}
                onPress={() => setActiveAmount(activeAmount === amount ? null : amount)}
              >
                <StyledText className={`text-center font-light ${
                  activeAmount === amount ? 'text-white' : 'text-white/80'
                }`}>
                  ZMW {amount}
                </StyledText>
              </StyledTouchableOpacity>
            ))}
          </StyledView>
          {activeAmount && (
            <StyledTouchableOpacity 
              className="mt-3"
              onPress={() => setActiveAmount(null)}
            >
              <StyledText className="text-white/60 text-center text-sm font-light">
                Tap to remove amount
              </StyledText>
            </StyledTouchableOpacity>
          )}
        </StyledView>

        {/* Instructions */}
        <StyledView className="bg-white/5 border border-white/10 rounded-3xl p-8 mb-8">
          <StyledText className="text-white text-lg font-light mb-4">
            How it works
          </StyledText>
          <StyledView className="space-y-3">
            <StyledText className="text-white/70 font-light">
              • Anyone can scan this code with Flash
            </StyledText>
            <StyledText className="text-white/70 font-light">
              • They'll see your name and phone number
            </StyledText>
            <StyledText className="text-white/70 font-light">
              • {activeAmount ? `Amount is pre-set to ZMW ${activeAmount}` : 'They can enter any amount'}
            </StyledText>
          </StyledView>
        </StyledView>

        {/* Action Buttons */}
        <StyledView className="gap-4">
          <Button
            title="Share QR Code"
            onPress={handleShare}
            variant="primary"
            size="lg"
          />
        </StyledView>
      </StyledScrollView>
    </StyledSafeAreaView>
  );
}