import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, Share, Clipboard } from 'react-native';
import { styled } from 'nativewind';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../ui';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTouchableOpacity = styled(TouchableOpacity);
const StyledScrollView = styled(ScrollView);
const StyledSafeAreaView = styled(SafeAreaView);

interface InviteData {
  invitesRemaining: number;
  totalInvites: number;
  inviteCode: string;
  invitedUsers: Array<{
    id: string;
    name: string;
    phone: string;
    status: 'pending' | 'joined' | 'expired';
    invitedAt: string;
  }>;
  rewardsEarned: number;
}

export default function InviteProgramScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [inviteData, setInviteData] = useState<InviteData>({
    invitesRemaining: 0,
    totalInvites: 5,
    inviteCode: '',
    invitedUsers: [],
    rewardsEarned: 0
  });

  useEffect(() => {
    loadInviteData();
  }, []);

  const loadInviteData = async () => {
    try {
      setLoading(true);
      console.log('🔄 Loading invite data from API...');
      
      const response = await api.get('/auth/invite-data/');
      console.log('✅ Invite data loaded:', response.data);
      
      setInviteData({
        invitesRemaining: response.data.invitesRemaining,
        totalInvites: response.data.totalInvites,
        inviteCode: response.data.inviteCode,
        invitedUsers: response.data.invitedUsers || [],
        rewardsEarned: response.data.rewardsEarned
      });
    } catch (error: any) {
      console.error('❌ Failed to load invite data:', error);
      
      // Show error to user
      Alert.alert(
        'Loading Error',
        error?.response?.data?.error || 'Failed to load invite data. Please try again.',
        [{ text: 'OK' }]
      );
      
      // Set fallback data
      setInviteData({
        invitesRemaining: 5,
        totalInvites: 5,
        inviteCode: 'ERROR',
        invitedUsers: [],
        rewardsEarned: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const handleShareInvite = async () => {
    if (inviteData.invitesRemaining <= 0) {
      Alert.alert('No Invites Left', 'You\'ve used all your exclusive invites. Earn more by completing transactions!');
      return;
    }

    const inviteMessage = `You\'re invited to join Flash!

Flash is an instant payment app for Zambia. I\'m sharing my invite code with you.

• Send money using just a phone number
• Instant transfers between mobile wallets
• Secure and easy to use

Join with code: ${inviteData.inviteCode}

Download Flash and use this code to get access.`;

    try {
      await Share.share({
        message: inviteMessage,
        title: 'Join me on Flash - Exclusive Invite'
      });
      
      // Track the share action with backend
      console.log('📤 Tracking invite share...');
      await api.post('/auth/send-invite/', {
        message: 'Shared via native share'
      });
      
      // Refresh invite data to update remaining count
      loadInviteData();
    } catch (error: any) {
      console.error('❌ Error sharing invite:', error);
      Alert.alert('Error', 'Failed to share invite. Please try again.');
    }
  };

  const handleCopyCode = async () => {
    await Clipboard.setString(inviteData.inviteCode);
    Alert.alert('Copied!', 'Invite code copied to clipboard');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'joined': return 'text-green-400';
      case 'pending': return 'text-yellow-400';
      case 'expired': return 'text-red-400';
      default: return 'text-white/60';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'joined': return '✅ Joined';
      case 'pending': return '⏳ Pending';
      case 'expired': return '❌ Expired';
      default: return status;
    }
  };

  if (loading) {
    return (
      <StyledSafeAreaView className="flex-1 bg-navy">
        <StyledView className="flex-1 items-center justify-center">
          <StyledText className="text-white/60 text-lg font-light">Loading invite data...</StyledText>
        </StyledView>
      </StyledSafeAreaView>
    );
  }

  return (
    <StyledSafeAreaView className="flex-1 bg-navy">
      {/* Header */}
      <StyledView className="flex-row items-center justify-between px-6 py-4 border-b border-white/10">
        <StyledTouchableOpacity onPress={() => navigation.goBack()}>
          <StyledText className="text-white text-2xl font-light">‹</StyledText>
        </StyledTouchableOpacity>
        <StyledText className="text-white text-lg font-light">Exclusive Invites</StyledText>
        <StyledView className="w-6" />
      </StyledView>

      <StyledScrollView 
        className="flex-1 px-8"
        contentContainerStyle={{ paddingTop: 24, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Simple Stats */}
        <StyledView className="bg-white/5 border border-white/10 rounded-2xl p-8 mb-8">
          <StyledView className="flex-row items-center justify-between">
            <StyledView className="flex-1">
              <StyledText className="text-white/60 text-sm font-light mb-1">
                Invites Remaining
              </StyledText>
              <StyledText className="text-white text-2xl font-thin">
                {inviteData.invitesRemaining} of {inviteData.totalInvites}
              </StyledText>
            </StyledView>
            
            <StyledView className="flex-1 items-end">
              <StyledText className="text-white/60 text-sm font-light mb-1">
                Friends Joined
              </StyledText>
              <StyledText className="text-white text-2xl font-thin">
                {inviteData.invitedUsers.filter(u => u.status === 'joined').length}
              </StyledText>
            </StyledView>
          </StyledView>
        </StyledView>

        {/* Invite Code */}
        <StyledView className="bg-white/5 border border-white/10 rounded-2xl p-8 mb-8">
          <StyledText className="text-white/60 text-sm font-light mb-4">
            Your Invite Code
          </StyledText>
          <StyledView className="flex-row items-center justify-between">
            <StyledText className="text-white text-xl font-light">
              {inviteData.inviteCode}
            </StyledText>
            <StyledTouchableOpacity 
              onPress={handleCopyCode}
              className="bg-white/10 px-4 py-2 rounded-xl"
            >
              <StyledText className="text-white font-light">Copy</StyledText>
            </StyledTouchableOpacity>
          </StyledView>
        </StyledView>

        {/* Share Button */}
        <Button
          title={inviteData.invitesRemaining > 0 ? "Share Invite" : "No Invites Left"}
          onPress={handleShareInvite}
          disabled={inviteData.invitesRemaining <= 0}
          size="lg"
          variant="primary"
        />

        {/* Invited Users */}
        {inviteData.invitedUsers.length > 0 && (
          <StyledView className="mt-8">
            <StyledText className="text-white text-xl font-light mb-6">Invited</StyledText>
            
            <StyledView className="space-y-3">
              {inviteData.invitedUsers.map((invitedUser) => (
                <StyledView key={invitedUser.id} className="bg-white/5 border border-white/10 rounded-2xl p-6">
                  <StyledView className="flex-row items-center justify-between">
                    <StyledView className="flex-1">
                      <StyledText className="text-white font-light text-lg">
                        {invitedUser.name}
                      </StyledText>
                      <StyledText className="text-white/40 text-sm font-light mt-1">
                        {new Date(invitedUser.invitedAt).toLocaleDateString()}
                      </StyledText>
                    </StyledView>
                    <StyledText className={`text-sm font-light ${getStatusColor(invitedUser.status)}`}>
                      {getStatusText(invitedUser.status)}
                    </StyledText>
                  </StyledView>
                </StyledView>
              ))}
            </StyledView>
          </StyledView>
        )}
      </StyledScrollView>
    </StyledSafeAreaView>
  );
}