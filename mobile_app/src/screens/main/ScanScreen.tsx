import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, Linking, Platform, StyleSheet } from 'react-native';
import { styled } from 'nativewind';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Camera, useCameraDevices } from 'react-native-vision-camera';
import { Button } from '../../ui';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTouchableOpacity = styled(TouchableOpacity);
const StyledSafeAreaView = styled(SafeAreaView);

export default function ScanScreen() {
  const navigation = useNavigation<any>();
  const [hasPermission, setHasPermission] = useState(false);
  
  const devices = useCameraDevices();
  const device = devices.back;

  useEffect(() => {
    const requestCameraPermission = async () => {
      const permission = await Camera.requestCameraPermission();
      console.log('📷 Camera permission:', permission);
      setHasPermission(permission === 'authorized');
    };
    
    requestCameraPermission();
  }, []);

  const handleManualQREntry = () => {
    Alert.prompt(
      'Enter QR Code Data',
      'Paste or enter QR code data manually:',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Continue',
          onPress: (data) => {
            if (data) {
              handleQRScanned(data);
            }
          }
        }
      ],
      'plain-text'
    );
  };

  const handleQRScanned = (data: string) => {
    try {
      console.log('📱 QR Code data:', data);
      const qrData = JSON.parse(data);
      
      // Check for Flash payment QR format
      if (qrData?.type === 'flash_payment' && qrData?.phone) {
        Alert.alert(
          'Flash Payment QR Code',
          `Send money to ${qrData.name || qrData.phone}?`,
          [
            {
              text: 'Cancel',
              style: 'cancel'
            },
            {
              text: 'Continue',
              onPress: () => {
                navigation.navigate('SendMoney', { 
                  recipient: { 
                    phone: qrData.phone,
                    name: qrData.name || 'QR Contact',
                    amount: qrData.amount
                  }
                });
              }
            }
          ]
        );
      } else {
        Alert.alert('Invalid QR Code', 'This QR code is not a valid Flash payment code.');
      }
    } catch (e) {
      console.error('❌ QR scan error:', e);
      Alert.alert('Invalid QR Code', 'Could not read QR code data.');
    }
  };

  if (!hasPermission) {
    return (
      <StyledSafeAreaView className="flex-1 bg-navy items-center justify-center">
        <StyledText className="text-white text-lg font-semibold mb-4">
          Camera Permission Required
        </StyledText>
        <StyledText className="text-white/90 text-center mb-6 px-6">
          Flash needs camera access to scan QR codes for payments
        </StyledText>
        <Button
          title="Grant Permission"
          onPress={async () => {
            const permission = await Camera.requestCameraPermission();
            setHasPermission(permission === 'authorized');
          }}
        />
      </StyledSafeAreaView>
    );
  }

  if (!device) {
    return (
      <StyledSafeAreaView className="flex-1 bg-navy items-center justify-center">
        <StyledText className="text-white text-lg font-semibold">
          No Camera Available
        </StyledText>
      </StyledSafeAreaView>
    );
  }


  return (
    <StyledSafeAreaView className="flex-1 bg-navy">
      {/* Header */}
      <StyledView className="items-center p-6">
        <StyledText className="text-white text-lg font-semibold text-center mb-2">
          QR Code Scanner
        </StyledText>
        <StyledText className="text-white/90 text-center">
          Use the camera to scan Flash QR codes or enter data manually
        </StyledText>
      </StyledView>

      {/* Camera View */}
      <StyledView className="flex-1 relative">
        <Camera
          style={StyleSheet.absoluteFill}
          device={device}
          isActive={true}
        />
        
        {/* QR Code Marker Overlay */}
        <StyledView className="flex-1 items-center justify-center">
          <StyledView 
            className="w-64 h-64 border-2 border-emerald rounded-2xl"
            style={{
              borderColor: '#10B981',
              backgroundColor: 'transparent',
            }}
          />
          <StyledText className="text-white/80 mt-4 text-center px-6">
            Align QR code within the frame{'\n'}
            Camera scanning is temporarily manual - use the button below
          </StyledText>
        </StyledView>
      </StyledView>

      {/* Bottom Controls */}
      <StyledView className="p-6">
        <StyledView className="space-y-3">
          <StyledTouchableOpacity 
            className="bg-emerald p-4 rounded-xl"
            onPress={handleManualQREntry}
          >
            <StyledText className="text-white font-medium text-center">
              Enter QR Code Data
            </StyledText>
          </StyledTouchableOpacity>
          <StyledTouchableOpacity 
            className="bg-charcoal p-4 rounded-xl"
            onPress={() => navigation.goBack()}
          >
            <StyledText className="text-white font-medium text-center">
              Cancel
            </StyledText>
          </StyledTouchableOpacity>
        </StyledView>
      </StyledView>
    </StyledSafeAreaView>
  );
}