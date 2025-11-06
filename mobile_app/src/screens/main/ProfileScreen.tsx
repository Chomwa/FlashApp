import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Animated, Alert } from 'react-native';
import { styled } from 'nativewind';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, Button } from '../../ui';
import { useAuth } from '../../context/AuthContext';
import { transactionsAPI } from '../../services/api';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTouchableOpacity = styled(TouchableOpacity);
const StyledScrollView = styled(ScrollView);
const StyledSafeAreaView = styled(SafeAreaView);
const StyledAnimatedView = styled(Animated.View);

export default function ProfileScreen() {
  const navigation = useNavigation<any>();
  const { user, logout } = useAuth();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [walletData, setWalletData] = useState<any>(null);
  const [loadingWallet, setLoadingWallet] = useState(true);

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

  // Fetch wallet data from backend
  useEffect(() => {
    const fetchWalletData = async () => {
      if (!user) {
        setLoadingWallet(false);
        return;
      }

      try {
        console.log('💳 Fetching wallet data from backend...');
        const wallet = await transactionsAPI.getWallet();
        console.log('✅ Wallet data received:', wallet);
        setWalletData(wallet);
      } catch (error) {
        console.error('❌ Failed to fetch wallet data:', error);
        // Set default values on error
        setWalletData({
          daily_limit: '5000.00',
          daily_spent: '0.00',
          escrow_balance: '0.00',
          rewards_balance: '0.00',
          currency: 'ZMW'
        });
      } finally {
        setLoadingWallet(false);
      }
    };

    fetchWalletData();
  }, [user]);

  useEffect(() => {
    if (isLoggingOut) {
      const rotateAnimation = Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        })
      );
      rotateAnimation.start();
      return () => rotateAnimation.stop();
    } else {
      rotateAnim.setValue(0);
    }
  }, [isLoggingOut, rotateAnim]);

  // Use real user data from auth context
  const profileUser = user || {
    full_name: 'Guest User',
    phone_number: '',
    email: '',
    kyc_tier: 1,
    is_verified: false
  };

  const menuItems = [
    { icon: '👤', title: 'Edit Profile', subtitle: 'Update your personal information' },
    { icon: '📱', title: 'Phone & Security', subtitle: 'Change phone, PIN, biometrics' },
    { icon: '💳', title: 'KYC Verification', subtitle: 'Increase your limits', badge: 'Tier 1' },
    { icon: '📊', title: 'Transaction Limits', subtitle: 'View your daily limits' },
    { icon: '🎁', title: 'Referral Program', subtitle: 'Invite friends, earn rewards' },
    { icon: '💬', title: 'Support & Help', subtitle: 'Get help with your account' },
    { icon: '📄', title: 'Terms & Privacy', subtitle: 'Legal information' },
  ];

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out of Flash?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            setIsLoggingOut(true);
            try {
              // Add a small delay for better UX
              await new Promise(resolve => setTimeout(resolve, 500));
              await logout();
              console.log('✅ User logged out successfully');
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert('Error', 'Failed to sign out. Please try again.');
            } finally {
              setIsLoggingOut(false);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const handleMenuPress = (title: string) => {
    switch (title) {
      case 'Edit Profile':
        navigation.navigate('EditProfile');
        break;
      case 'Phone & Security':
        // TODO: Navigate to security settings
        Alert.alert('Coming Soon', 'Security settings will be available soon!');
        break;
      case 'Payment Methods':
        Alert.alert('Coming Soon', 'Payment methods management coming soon!');
        break;
      case 'Transaction Limits':
        Alert.alert('Transaction Limits', `Daily Limit: ZMW ${walletData?.daily_limit || '5,000'}\nDaily Spent: ZMW ${walletData?.daily_spent || '0'}`);
        break;
      case 'Help & Support':
        Alert.alert('Help & Support', 'For assistance, please contact support@flashpay.zm');
        break;
      case 'Legal & Privacy':
        Alert.alert('Coming Soon', 'Terms and privacy policy coming soon!');
        break;
      default:
        console.log(`Navigating to ${title}`);
    }
  };

  return (
    <StyledSafeAreaView className="flex-1 bg-navy">
      <StyledScrollView 
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <StyledAnimatedView 
          className="px-8 pt-8 pb-12"
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }}
        >
          <StyledText className="text-white text-3xl font-thin mb-8">
            Profile
          </StyledText>

          {/* User Info Card */}
          <StyledView className="bg-white/5 border border-white/10 rounded-3xl p-8 mb-8">
            <StyledView className="items-center">
              <StyledView className="w-24 h-24 bg-sky rounded-3xl items-center justify-center mb-6">
                <StyledText className="text-white text-2xl font-light">
                  {profileUser.full_name.split(' ').map(n => n[0]).join('')}
                </StyledText>
              </StyledView>
              
              <StyledText className="text-white text-2xl font-light mb-2">
                {profileUser.full_name}
              </StyledText>
              <StyledText className="text-white/60 text-lg font-light mb-2">
                {profileUser.phone_number}
              </StyledText>
              {profileUser.email && (
                <StyledText className="text-white/50 text-base font-light">
                  {profileUser.email}
                </StyledText>
              )}

              {/* Verification Status */}
              <StyledView className="flex-row items-center mt-6 bg-amber-500/10 border border-amber-500/20 px-4 py-3 rounded-2xl">
                <StyledText className="text-amber-400 text-sm mr-2">⚠️</StyledText>
                <StyledText className="text-amber-400 text-sm font-light">
                  KYC Tier {profileUser.kyc_tier || 1} • Increase limits by verifying
                </StyledText>
              </StyledView>
            </StyledView>
          </StyledView>

          {/* Quick Stats */}
          <StyledView className="flex-row gap-4 mb-8">
            <StyledView className="flex-1 bg-white/5 border border-white/10 rounded-2xl p-6 items-center">
              <StyledText className="text-white/60 text-sm font-light mb-2">Daily Limit</StyledText>
              {loadingWallet ? (
                <StyledText className="text-white/40 font-light text-xl">Loading...</StyledText>
              ) : (
                <StyledText className="text-white font-light text-xl">
                  ZMW {walletData?.daily_limit || '5,000'}
                </StyledText>
              )}
            </StyledView>
            <StyledView className="flex-1 bg-white/5 border border-white/10 rounded-2xl p-6 items-center">
              <StyledText className="text-white/60 text-sm font-light mb-2">Used Today</StyledText>
              {loadingWallet ? (
                <StyledText className="text-white/40 font-light text-xl">Loading...</StyledText>
              ) : (
                <StyledText className="text-green-400 font-light text-xl">
                  ZMW {walletData?.daily_spent || '0'}
                </StyledText>
              )}
            </StyledView>
          </StyledView>
        </StyledAnimatedView>

        {/* Menu Items */}
        <StyledAnimatedView 
          className="px-8"
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }}
        >
          <StyledText className="text-white text-xl font-light mb-6">
            Settings
          </StyledText>
          
          <StyledView className="space-y-4">
            {menuItems.map((item, index) => (
              <StyledView key={index} className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <StyledTouchableOpacity
                  onPress={() => handleMenuPress(item.title)}
                  className="flex-row items-center"
                >
                  <StyledView className="w-12 h-12 bg-white/10 rounded-2xl items-center justify-center mr-4">
                    <StyledText className="text-xl">{item.icon}</StyledText>
                  </StyledView>
                  <StyledView className="flex-1">
                    <StyledView className="flex-row items-center">
                      <StyledText className="text-white font-light text-lg flex-1">
                        {item.title}
                      </StyledText>
                      {item.badge && (
                        <StyledView className="bg-amber-500/20 border border-amber-500/30 px-3 py-1 rounded-lg">
                          <StyledText className="text-amber-400 text-xs font-light">
                            {item.badge}
                          </StyledText>
                        </StyledView>
                      )}
                    </StyledView>
                    <StyledText className="text-white/50 text-sm font-light mt-1">
                      {item.subtitle}
                    </StyledText>
                  </StyledView>
                  <StyledText className="text-white/30 ml-2 text-xl">›</StyledText>
                </StyledTouchableOpacity>
              </StyledView>
            ))}
          </StyledView>

          {/* Security Notice */}
          <StyledView className="mt-12 mb-8">
            <StyledView className="bg-sky/10 border border-sky/20 rounded-2xl p-6">
              <StyledView className="flex-row items-start">
                <StyledView className="w-10 h-10 bg-sky/20 rounded-2xl items-center justify-center mr-4 mt-1">
                  <StyledText className="text-sky text-lg">🛡️</StyledText>
                </StyledView>
                <StyledView className="flex-1">
                  <StyledText className="text-sky font-light text-lg mb-2">
                    Account Security
                  </StyledText>
                  <StyledText className="text-sky/80 text-sm font-light leading-relaxed">
                    Your Flash account is protected with bank-level security. 
                    Always sign out when using shared devices.
                  </StyledText>
                </StyledView>
              </StyledView>
            </StyledView>
          </StyledView>

          {/* Account Actions Section */}
          <StyledView>
            <StyledText className="text-white text-xl font-light mb-6">
              Account Actions
            </StyledText>
            
            {/* Sign Out Button */}
            <StyledTouchableOpacity 
              className={`bg-white/5 border border-white/10 rounded-2xl p-6 mb-6 ${
                isLoggingOut ? 'opacity-50' : ''
              }`}
              onPress={handleLogout}
              disabled={isLoggingOut}
            >
              <StyledView className="flex-row items-center">
                <StyledView className="w-12 h-12 bg-red-500/10 rounded-2xl items-center justify-center mr-4">
                  {isLoggingOut ? (
                    <StyledAnimatedView
                      style={{
                        transform: [{
                          rotate: rotateAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: ['0deg', '360deg'],
                          })
                        }]
                      }}
                    >
                      <StyledText className="text-xl">⏳</StyledText>
                    </StyledAnimatedView>
                  ) : (
                    <StyledText className="text-xl">🚪</StyledText>
                  )}
                </StyledView>
                <StyledView className="flex-1">
                  <StyledText className="text-red-400 font-light text-lg">
                    {isLoggingOut ? 'Signing Out...' : 'Sign Out'}
                  </StyledText>
                  <StyledText className="text-red-400/60 text-sm font-light mt-1">
                    {isLoggingOut ? 'Please wait' : 'Sign out of your Flash account'}
                  </StyledText>
                </StyledView>
                <StyledText className="text-red-400/30 ml-2 text-xl">
                  {isLoggingOut ? '' : '›'}
                </StyledText>
              </StyledView>
            </StyledTouchableOpacity>

            {/* Session Info */}
            <StyledView className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
              <StyledView className="flex-row items-center">
                <StyledView className="w-12 h-12 bg-emerald-500/10 rounded-2xl items-center justify-center mr-4">
                  <StyledText className="text-xl">⏰</StyledText>
                </StyledView>
                <StyledView className="flex-1">
                  <StyledText className="text-white font-light text-lg">
                    Session Info
                  </StyledText>
                  <StyledText className="text-white/60 text-sm font-light mt-1">
                    Logged in today • Device: iOS Simulator
                  </StyledText>
                </StyledView>
                <StyledView className="w-3 h-3 bg-emerald-400 rounded-full"></StyledView>
              </StyledView>
            </StyledView>

            {/* Delete Account Option */}
            <StyledTouchableOpacity 
              className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8"
              onPress={() => Alert.alert(
                'Delete Account', 
                'This will permanently delete your Flash account and all associated data. This action cannot be undone.\n\nAre you sure you want to continue?',
                [
                  { text: 'Cancel', style: 'cancel' },
                  { 
                    text: 'Delete Account', 
                    style: 'destructive',
                    onPress: () => Alert.alert('Coming Soon', 'Account deletion feature will be available in a future update.')
                  }
                ]
              )}
            >
              <StyledView className="flex-row items-center">
                <StyledView className="w-12 h-12 bg-red-600/10 rounded-2xl items-center justify-center mr-4">
                  <StyledText className="text-xl">🗑️</StyledText>
                </StyledView>
                <StyledView className="flex-1">
                  <StyledText className="text-red-500 font-light text-lg">
                    Delete Account
                  </StyledText>
                  <StyledText className="text-red-500/60 text-sm font-light mt-1">
                    Permanently delete your account and data
                  </StyledText>
                </StyledView>
                <StyledText className="text-red-500/30 ml-2 text-xl">›</StyledText>
              </StyledView>
            </StyledTouchableOpacity>
          </StyledView>

          {/* App Info */}
          <StyledView className="items-center mb-8">
            <StyledText className="text-white/30 text-sm font-light">
              Flash Payment App v1.0.0
            </StyledText>
            <StyledText className="text-white/30 text-xs font-light mt-2">
              Made with ❤️ for Africa
            </StyledText>
          </StyledView>
        </StyledAnimatedView>
      </StyledScrollView>
    </StyledSafeAreaView>
  );
}