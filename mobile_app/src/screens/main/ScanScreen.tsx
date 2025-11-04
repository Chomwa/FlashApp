import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { styled } from 'nativewind';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../ui';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTouchableOpacity = styled(TouchableOpacity);
const StyledSafeAreaView = styled(SafeAreaView);

export default function ScanScreen() {
  const navigation = useNavigation<any>();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  useEffect(() => {
    // Camera permission logic would go here
    // For now, we'll simulate permission granted
    setHasPermission(true);
  }, []);

  const handleQRScanned = (data: string) => {
    try {
      const qrData = JSON.parse(data);
      if (qrData?.action === 'receive' && qrData?.phone) {
        navigation.navigate('SendMoney', { 
          recipient: { 
            phone: qrData.phone,
            name: qrData.name || 'QR Contact'
          }
        });
      }
    } catch (e) {
      Alert.alert('Invalid QR Code', 'This QR code is not recognized by Flash.');
    }
  };

  if (hasPermission === null) {
    return (
      <StyledSafeAreaView className="flex-1 bg-navy items-center justify-center">
        <StyledText className="text-white">Requesting camera permission...</StyledText>
      </StyledSafeAreaView>
    );
  }

  if (hasPermission === false) {
    return (
      <StyledSafeAreaView className="flex-1 bg-navy items-center justify-center px-6">
        <StyledText className="text-white text-xl font-bold mb-4">
          Camera Permission Required
        </StyledText>
        <StyledText className="text-white/70 text-center mb-6">
          Please allow camera access to scan QR codes for payments.
        </StyledText>
        <Button
          title="Open Settings"
          onPress={() => {/* Open device settings */}}
        />
      </StyledSafeAreaView>
    );
  }

  return (
    <StyledSafeAreaView className="flex-1 bg-navy">
      <StyledView className="flex-1">
        {/* Camera View Placeholder */}
        <StyledView className="flex-1 bg-black relative">
          <StyledView className="absolute inset-0 items-center justify-center">
            <StyledView className="w-64 h-64 border-2 border-white rounded-2xl">
              <StyledView className="absolute top-0 left-0 w-8 h-8 border-l-4 border-t-4 border-emerald rounded-tl-lg" />
              <StyledView className="absolute top-0 right-0 w-8 h-8 border-r-4 border-t-4 border-emerald rounded-tr-lg" />
              <StyledView className="absolute bottom-0 left-0 w-8 h-8 border-l-4 border-b-4 border-emerald rounded-bl-lg" />
              <StyledView className="absolute bottom-0 right-0 w-8 h-8 border-r-4 border-b-4 border-emerald rounded-br-lg" />
            </StyledView>
          </StyledView>
          
          {/* Instructions */}
          <StyledView className="absolute bottom-32 left-0 right-0 px-6">
            <StyledText className="text-white text-lg font-semibold text-center mb-2">
              Scan QR Code
            </StyledText>
            <StyledText className="text-white/70 text-center">
              Point your camera at a Flash QR code to send money
            </StyledText>
          </StyledView>
        </StyledView>

        {/* Bottom Controls */}
        <StyledView className="p-6 bg-navy">
          <StyledView className="flex-row justify-center space-x-4">
            <StyledTouchableOpacity className="bg-charcoal p-4 rounded-xl">
              <StyledText className="text-white font-medium">Gallery</StyledText>
            </StyledTouchableOpacity>
            <StyledTouchableOpacity className="bg-charcoal p-4 rounded-xl">
              <StyledText className="text-white font-medium">Flash</StyledText>
            </StyledTouchableOpacity>
          </StyledView>
        </StyledView>
      </StyledView>
    </StyledSafeAreaView>
  );
}