import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, Dimensions } from 'react-native';
import { styled } from 'nativewind';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTouchableOpacity = styled(TouchableOpacity);
const StyledSafeAreaView = styled(SafeAreaView);

const { width, height } = Dimensions.get('window');

export default function QRScannerScreen() {
  const navigation = useNavigation<any>();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [flashEnabled, setFlashEnabled] = useState(false);

  useEffect(() => {
    // Request camera permission
    requestCameraPermission();
  }, []);

  const requestCameraPermission = async () => {
    try {
      // For demo purposes, simulate permission granted
      setHasPermission(true);
    } catch (error) {
      setHasPermission(false);
      Alert.alert('Camera Permission', 'Camera access is required to scan QR codes.');
    }
  };

  const handleQRCodeScanned = (data: string) => {
    if (scanned) return;

    setScanned(true);
    
    try {
      // Parse QR code data
      const qrData = JSON.parse(data);
      
      if (qrData.type === 'flash_payment') {
        // Navigate to send money with pre-filled data
        navigation.navigate('SendMoney', {
          recipient: {
            phone: qrData.phone,
            name: qrData.name
          },
          amount: qrData.amount
        });
      } else if (qrData.type === 'flash_request') {
        // Navigate to request money with pre-filled data
        navigation.navigate('RequestMoney', {
          recipient: {
            phone: qrData.phone,
            name: qrData.name
          },
          amount: qrData.amount
        });
      } else {
        Alert.alert('Invalid QR Code', 'This QR code is not a valid Flash payment code.');
      }
    } catch (error) {
      // If not JSON, treat as phone number
      if (data.startsWith('+260') && data.length >= 13) {
        navigation.navigate('SendMoney', {
          recipient: {
            phone: data,
            name: data
          }
        });
      } else {
        Alert.alert('Invalid QR Code', 'Unable to process this QR code.');
      }
    }
    
    // Reset scanner after delay
    setTimeout(() => setScanned(false), 2000);
  };

  // Mock QR code detection for demo
  const simulateQRScan = () => {
    const mockQRData = JSON.stringify({
      type: 'flash_payment',
      phone: '+260971234567',
      name: 'John Mwanza',
      amount: '50'
    });
    handleQRCodeScanned(mockQRData);
  };

  if (hasPermission === null) {
    return (
      <StyledSafeAreaView className="flex-1 bg-navy items-center justify-center">
        <StyledText className="text-white text-lg">Requesting camera permission...</StyledText>
      </StyledSafeAreaView>
    );
  }

  if (hasPermission === false) {
    return (
      <StyledSafeAreaView className="flex-1 bg-navy items-center justify-center px-6">
        <StyledText className="text-white text-xl font-bold mb-4 text-center">
          Camera Access Required
        </StyledText>
        <StyledText className="text-white/70 text-center mb-8">
          Flash needs camera access to scan QR codes for payments
        </StyledText>
        <StyledTouchableOpacity
          className="bg-emerald rounded-2xl py-4 px-8"
          onPress={requestCameraPermission}
        >
          <StyledText className="text-white font-semibold text-lg">
            Grant Permission
          </StyledText>
        </StyledTouchableOpacity>
      </StyledSafeAreaView>
    );
  }

  return (
    <StyledSafeAreaView className="flex-1 bg-navy">
      {/* Header */}
      <StyledView className="flex-row items-center justify-between px-6 py-3 mt-2">
        <StyledTouchableOpacity onPress={() => navigation.goBack()}>
          <StyledText className="text-white text-2xl">←</StyledText>
        </StyledTouchableOpacity>
        <StyledText className="text-white text-xl font-bold">
          Scan QR Code
        </StyledText>
        <StyledTouchableOpacity
          onPress={() => setFlashEnabled(!flashEnabled)}
        >
          <StyledText className="text-white text-2xl">
            {flashEnabled ? '💡' : '🔦'}
          </StyledText>
        </StyledTouchableOpacity>
      </StyledView>

      {/* Camera View */}
      <StyledView className="flex-1 relative">
        {/* Mock Camera View */}
        <StyledView className="flex-1 bg-black/80 items-center justify-center">
          <StyledText className="text-white/70 text-center mb-8 px-6">
            📷 Camera view would be here{'\n'}
            (In production: react-native-camera or expo-camera)
          </StyledText>
          
          {/* QR Scan Frame */}
          <StyledView className="relative">
            <StyledView 
              className="border-2 border-emerald rounded-2xl bg-transparent"
              style={{ width: width * 0.7, height: width * 0.7 }}
            >
              {/* Corner indicators */}
              <StyledView className="absolute -top-1 -left-1 w-8 h-8 border-l-4 border-t-4 border-emerald rounded-tl-lg" />
              <StyledView className="absolute -top-1 -right-1 w-8 h-8 border-r-4 border-t-4 border-emerald rounded-tr-lg" />
              <StyledView className="absolute -bottom-1 -left-1 w-8 h-8 border-l-4 border-b-4 border-emerald rounded-bl-lg" />
              <StyledView className="absolute -bottom-1 -right-1 w-8 h-8 border-r-4 border-b-4 border-emerald rounded-br-lg" />
              
              {/* Scanning line animation would go here */}
              <StyledView className="absolute top-1/2 left-0 right-0 h-0.5 bg-emerald opacity-80" />
            </StyledView>
          </StyledView>

          <StyledText className="text-white text-center mt-8 px-6">
            Position the QR code within the frame
          </StyledText>
        </StyledView>

        {/* Bottom Controls */}
        <StyledView className="absolute bottom-0 left-0 right-0 bg-navy/90 p-6">
          <StyledView className="flex-row items-center justify-center space-x-8">
            {/* Manual Entry */}
            <StyledTouchableOpacity 
              className="items-center"
              onPress={() => navigation.navigate('SendMoney')}
            >
              <StyledView className="w-16 h-16 bg-charcoal rounded-full items-center justify-center mb-2">
                <StyledText className="text-white text-2xl">⌨️</StyledText>
              </StyledView>
              <StyledText className="text-white text-sm">Manual</StyledText>
            </StyledTouchableOpacity>

            {/* Demo Scan Button */}
            <StyledTouchableOpacity 
              className="items-center"
              onPress={simulateQRScan}
            >
              <StyledView className="w-20 h-20 bg-emerald rounded-full items-center justify-center mb-2">
                <StyledText className="text-white text-3xl">📱</StyledText>
              </StyledView>
              <StyledText className="text-white text-sm font-medium">Demo Scan</StyledText>
            </StyledTouchableOpacity>

            {/* Gallery */}
            <StyledTouchableOpacity 
              className="items-center"
              onPress={() => Alert.alert('Gallery', 'Scan QR code from photo gallery')}
            >
              <StyledView className="w-16 h-16 bg-charcoal rounded-full items-center justify-center mb-2">
                <StyledText className="text-white text-2xl">🖼️</StyledText>
              </StyledView>
              <StyledText className="text-white text-sm">Gallery</StyledText>
            </StyledTouchableOpacity>
          </StyledView>
        </StyledView>
      </StyledView>

      {/* Instructions */}
      <StyledView className="bg-navy px-6 py-4">
        <StyledView className="bg-sky/10 p-4 rounded-xl">
          <StyledText className="text-sky text-sm text-center">
            💡 Scan Flash QR codes to instantly send money or fulfill payment requests
          </StyledText>
        </StyledView>
      </StyledView>
    </StyledSafeAreaView>
  );
}