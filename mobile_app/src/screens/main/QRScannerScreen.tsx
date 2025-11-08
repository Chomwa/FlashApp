import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, Dimensions, StyleSheet, Linking, Platform } from 'react-native';
import { styled } from 'nativewind';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Camera, useCameraDevice, useCodeScanner } from 'react-native-vision-camera';

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
  const [cameraActive, setCameraActive] = useState(true);

  // Unified device handling for both platforms
  const device = useCameraDevice('back');

  useEffect(() => {
    requestCameraPermission();

    return () => {
      setCameraActive(false);
    };
  }, []);

  const requestCameraPermission = async () => {
    try {
      console.log('📷 Requesting camera permission...');
      
      const cameraPermission = await Camera.requestCameraPermission();
      console.log('📷 Camera permission status:', cameraPermission);

      if (cameraPermission === 'granted' || cameraPermission === 'authorized') {
        setHasPermission(true);
      } else if (cameraPermission === 'denied') {
        setHasPermission(false);
        Alert.alert(
          'Camera Permission Denied',
          'Please enable camera access in your device settings to scan QR codes.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => Linking.openSettings() }
          ]
        );
      } else {
        // restricted or not-determined
        setHasPermission(false);
      }
    } catch (error) {
      console.error('❌ Camera permission error:', error);
      setHasPermission(false);
      Alert.alert('Error', 'Failed to request camera permission.');
    }
  };

  // Unified code scanner for both platforms
  const codeScanner = useCodeScanner({
    codeTypes: ['qr', 'ean-13'],
    onCodeScanned: (codes) => {
      if (scanned || codes.length === 0) return;

      const code = codes[0];
      if (code?.value) {
        console.log('🔍 QR Code scanned:', code.value);
        handleQRCodeScanned(code.value);
      }
    },
  });

  const handleQRCodeScanned = (data: string) => {
    if (scanned) return;

    setScanned(true);
    setCameraActive(false);

    try {
      // Parse QR code data
      const qrData = JSON.parse(data);

      console.log('📊 Parsed QR data:', qrData);

      if (qrData.type === 'flash_payment') {
        // Navigate to send money with pre-filled data
        navigation.replace('SendMoney', {
          recipient: {
            phone: qrData.phone,
            name: qrData.name
          },
          prefilledAmount: qrData.amount || '',
          prefilledMessage: qrData.message || ''
        });
      } else if (qrData.type === 'flash_request') {
        // Navigate to request money with pre-filled data
        navigation.replace('RequestMoney', {
          recipient: {
            phone: qrData.phone,
            name: qrData.name
          },
          prefilledAmount: qrData.amount || ''
        });
      } else {
        setCameraActive(true);
        setScanned(false);
        Alert.alert('Invalid QR Code', 'This QR code is not a valid Flash payment code.');
      }
    } catch (error) {
      console.error('❌ QR parsing error:', error);

      // If not JSON, treat as phone number
      if (data.startsWith('+260') && data.length >= 13) {
        navigation.replace('SendMoney', {
          recipient: {
            phone: data,
            name: data
          }
        });
      } else {
        setCameraActive(true);
        setScanned(false);
        Alert.alert('Invalid QR Code', 'Unable to process this QR code.');
      }
    }
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
        <StyledView className="w-20 h-20 bg-white/10 rounded-2xl items-center justify-center mb-6">
          <StyledText className="text-white text-4xl">📷</StyledText>
        </StyledView>
        <StyledText className="text-white text-xl font-bold mb-4 text-center">
          Camera Access Required
        </StyledText>
        <StyledText className="text-white/70 text-center mb-8">
          Flash needs camera access to scan QR codes for payments
        </StyledText>
        <StyledView className="gap-3 w-full">
          <StyledTouchableOpacity
            className="bg-sky rounded-2xl py-4 px-8"
            onPress={() => Linking.openSettings()}
          >
            <StyledText className="text-white font-semibold text-lg text-center">
              Open Settings
            </StyledText>
          </StyledTouchableOpacity>
          <StyledTouchableOpacity
            className="bg-white/10 rounded-2xl py-4 px-8"
            onPress={() => {
              if (navigation.canGoBack()) {
                navigation.goBack();
              } else {
                navigation.navigate('Home');
              }
            }}
          >
            <StyledText className="text-white font-semibold text-lg text-center">
              Go Back
            </StyledText>
          </StyledTouchableOpacity>
        </StyledView>
      </StyledSafeAreaView>
    );
  }

  // Check if camera device is available
  if (!device) {
    return (
      <StyledSafeAreaView className="flex-1 bg-navy items-center justify-center px-6">
        <StyledView className="w-20 h-20 bg-white/10 rounded-2xl items-center justify-center mb-6">
          <StyledText className="text-white text-4xl">📷</StyledText>
        </StyledView>
        <StyledText className="text-white text-xl font-bold mb-4 text-center">
          Camera Not Available
        </StyledText>
        <StyledText className="text-white/70 text-center mb-8">
          No camera device found on this device
        </StyledText>
        <StyledTouchableOpacity
          className="bg-sky rounded-2xl py-4 px-8"
          onPress={() => {
            if (navigation.canGoBack()) {
              navigation.goBack();
            } else {
              navigation.navigate('Home');
            }
          }}
        >
          <StyledText className="text-white font-semibold text-lg text-center">
            Go Back
          </StyledText>
        </StyledTouchableOpacity>
      </StyledSafeAreaView>
    );
  }

  // Unified VisionCamera for both iOS and Android
  return (
    <StyledView className="flex-1 bg-black">
      {/* Camera View */}
      <Camera
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={cameraActive && !scanned}
        codeScanner={codeScanner}
        torch={flashEnabled ? 'on' : 'off'}
      />

      {/* Header Overlay */}
      <SafeAreaView style={{ flex: 0, backgroundColor: 'transparent' }}>
        <StyledView className="flex-row items-center justify-between px-6 py-3 bg-black/50">
          <StyledTouchableOpacity onPress={() => {
            if (navigation.canGoBack()) {
              navigation.goBack();
            } else {
              navigation.navigate('Home');
            }
          }}>
            <StyledView className="w-10 h-10 items-center justify-center">
              <StyledText className="text-white text-2xl">←</StyledText>
            </StyledView>
          </StyledTouchableOpacity>
          <StyledText className="text-white text-xl font-light">
            Scan QR Code
          </StyledText>
          <StyledTouchableOpacity
            onPress={() => setFlashEnabled(!flashEnabled)}
          >
            <StyledView className="w-10 h-10 items-center justify-center">
              <StyledText className="text-white text-2xl">
                {flashEnabled ? '💡' : '🔦'}
              </StyledText>
            </StyledView>
          </StyledTouchableOpacity>
        </StyledView>
      </SafeAreaView>

      {/* Scanning Frame Overlay */}
      <StyledView className="flex-1 items-center justify-center" pointerEvents="none">
        <StyledView className="relative">
          <StyledView
            className="border-2 border-sky rounded-2xl bg-transparent"
            style={{ width: width * 0.7, height: width * 0.7 }}
          >
            {/* Corner indicators */}
            <StyledView className="absolute -top-1 -left-1 w-8 h-8 border-l-4 border-t-4 border-sky rounded-tl-lg" />
            <StyledView className="absolute -top-1 -right-1 w-8 h-8 border-r-4 border-t-4 border-sky rounded-tr-lg" />
            <StyledView className="absolute -bottom-1 -left-1 w-8 h-8 border-l-4 border-b-4 border-sky rounded-bl-lg" />
            <StyledView className="absolute -bottom-1 -right-1 w-8 h-8 border-r-4 border-b-4 border-sky rounded-br-lg" />

            {/* Scanning line */}
            {!scanned && (
              <StyledView className="absolute top-1/2 left-0 right-0 h-0.5 bg-sky opacity-80" />
            )}
          </StyledView>
        </StyledView>

        <StyledText className="text-white text-center mt-8 px-6 font-light">
          {scanned ? 'Processing QR code...' : 'Position the QR code within the frame'}
        </StyledText>
      </StyledView>

      {/* Bottom Controls */}
      <SafeAreaView style={{ flex: 0, backgroundColor: 'transparent' }}>
        <StyledView className="bg-black/50 p-6" pointerEvents="box-none">
          <StyledView className="flex-row items-center justify-center gap-8">
            {/* Manual Entry */}
            <StyledTouchableOpacity
              className="items-center"
              onPress={() => navigation.replace('SendMoney')}
            >
              <StyledView className="w-16 h-16 bg-white/20 rounded-full items-center justify-center mb-2">
                <StyledText className="text-white text-2xl">⌨️</StyledText>
              </StyledView>
              <StyledText className="text-white text-sm font-light">Manual</StyledText>
            </StyledTouchableOpacity>

            {/* Gallery - Future feature */}
            <StyledTouchableOpacity
              className="items-center"
              onPress={() => Alert.alert('Coming Soon', 'Scan QR codes from photos will be available soon!')}
            >
              <StyledView className="w-16 h-16 bg-white/20 rounded-full items-center justify-center mb-2">
                <StyledText className="text-white text-2xl">🖼️</StyledText>
              </StyledView>
              <StyledText className="text-white text-sm font-light">Gallery</StyledText>
            </StyledTouchableOpacity>
          </StyledView>

          {/* Instructions */}
          <StyledView className="bg-sky/10 p-4 rounded-xl mt-6">
            <StyledText className="text-sky text-sm text-center font-light">
              💡 Scan Flash QR codes to instantly send money
            </StyledText>
          </StyledView>
        </StyledView>
      </SafeAreaView>
    </StyledView>
  );
}
