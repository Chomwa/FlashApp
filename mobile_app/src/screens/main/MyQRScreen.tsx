import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Share, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { styled } from 'nativewind';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import QRCode from 'react-native-qrcode-svg';
import { Button } from '../../ui';
import { transactionsAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTouchableOpacity = styled(TouchableOpacity);
const StyledSafeAreaView = styled(SafeAreaView);
const StyledScrollView = styled(ScrollView);

// Real QR Code Component with backend generation
const QRCodeDisplay = ({ data, loading }: { data: any; loading: boolean }) => {
  if (loading) {
    return (
      <StyledView className="bg-white rounded-3xl p-6 shadow-2xl items-center justify-center" style={{ width: 250, height: 250 }}>
        <ActivityIndicator size="large" color="#0EA5E9" />
        <StyledText className="text-navy/60 mt-4">Generating QR Code...</StyledText>
      </StyledView>
    );
  }

  if (!data) {
    return (
      <StyledView className="bg-white rounded-3xl p-6 shadow-2xl items-center justify-center" style={{ width: 250, height: 250 }}>
        <StyledText className="text-navy/60">Unable to generate QR code</StyledText>
      </StyledView>
    );
  }

  return (
    <StyledView className="bg-white rounded-3xl p-6 shadow-2xl">
      <StyledView className="items-center">
        <StyledView className="bg-white rounded-2xl p-4 mb-4">
          <QRCode
            value={JSON.stringify(data)}
            size={200}
            color="#02121B"
            backgroundColor="#FFFFFF"
          />
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
  const { user } = useAuth();
  const [activeAmount, setActiveAmount] = useState<string | null>(null);
  const [qrData, setQrData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const quickAmounts = ['50', '100', '200', '500'];

  // Get real user data
  const userPhone = user?.phone_number || '';
  const userName = user?.full_name || 'User';

  // Generate QR code when component mounts or amount changes
  useEffect(() => {
    generateQRCode();
  }, [activeAmount]);

  const generateQRCode = async () => {
    if (!user) {
      setLoading(false);
      Alert.alert('Error', 'User not authenticated');
      return;
    }

    setLoading(true);
    try {
      console.log('🔄 Generating QR code...', { amount: activeAmount });
      const response = await transactionsAPI.generateQRCode(
        activeAmount || undefined,
        undefined
      );
      console.log('✅ QR code generated:', response.qr_code_data);
      setQrData(response.qr_code_data);
    } catch (error) {
      console.error('❌ Failed to generate QR code:', error);
      Alert.alert(
        'QR Generation Failed',
        'Unable to generate QR code. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

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
          <QRCodeDisplay data={qrData} loading={loading} />
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