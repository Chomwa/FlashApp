import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { styled } from 'nativewind';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Input } from '../../ui';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTouchableOpacity = styled(TouchableOpacity);
const StyledTextInput = styled(TextInput);
const StyledScrollView = styled(ScrollView);
const StyledSafeAreaView = styled(SafeAreaView);

export default function EditProfileScreen() {
  const navigation = useNavigation<any>();
  const { user, updateUser } = useAuth();

  const [fullName, setFullName] = useState(user?.full_name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    // Check if there are changes
    const nameChanged = fullName !== (user?.full_name || '');
    const emailChanged = email !== (user?.email || '');
    setHasChanges(nameChanged || emailChanged);
  }, [fullName, email, user]);

  const handleSave = async () => {
    if (!hasChanges) {
      Alert.alert('No Changes', 'You haven\'t made any changes to save.');
      return;
    }

    if (!fullName.trim()) {
      Alert.alert('Validation Error', 'Please enter your full name.');
      return;
    }

    // Basic email validation
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      Alert.alert('Validation Error', 'Please enter a valid email address.');
      return;
    }

    setSaving(true);
    try {
      console.log('💾 Saving profile changes...');

      const updateData: any = {
        full_name: fullName.trim(),
      };

      if (email) {
        updateData.email = email.trim();
      }

      const response = await api.patch('/auth/me/', updateData);
      console.log('✅ Profile updated successfully:', response.data);

      // Update user in auth context
      if (updateUser) {
        updateUser(response.data);
      }

      Alert.alert(
        'Success',
        'Your profile has been updated successfully!',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack()
          }
        ]
      );
    } catch (error: any) {
      console.error('❌ Failed to update profile:', error);
      const errorMessage = error?.response?.data?.error ||
                          error?.response?.data?.message ||
                          'Unable to update profile. Please try again.';
      Alert.alert('Update Failed', errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (hasChanges) {
      Alert.alert(
        'Discard Changes?',
        'You have unsaved changes. Are you sure you want to go back?',
        [
          { text: 'Keep Editing', style: 'cancel' },
          {
            text: 'Discard',
            style: 'destructive',
            onPress: () => navigation.goBack()
          }
        ]
      );
    } else {
      navigation.goBack();
    }
  };

  return (
    <StyledSafeAreaView className="flex-1 bg-navy">
      {/* Header */}
      <StyledView className="flex-row items-center justify-between px-8 py-4 mt-2">
        <StyledTouchableOpacity
          className="w-10 h-10 items-center justify-center"
          onPress={handleCancel}
        >
          <StyledText className="text-white text-2xl font-light">←</StyledText>
        </StyledTouchableOpacity>
        <StyledText className="text-white text-xl font-light">
          Edit Profile
        </StyledText>
        <StyledView className="w-10" />
      </StyledView>

      <StyledScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 32, paddingVertical: 24 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Avatar */}
        <StyledView className="items-center mb-8">
          <StyledView className="w-24 h-24 bg-sky rounded-2xl items-center justify-center mb-4">
            <StyledText className="text-white text-3xl">
              {fullName.split(' ').map(n => n[0]).join('').toUpperCase() || '?'}
            </StyledText>
          </StyledView>
          <StyledText className="text-white/60 text-sm font-light">
            {user?.phone_number}
          </StyledText>
        </StyledView>

        {/* Personal Information */}
        <StyledView className="mb-8">
          <StyledText className="text-white text-lg font-light mb-4">
            Personal Information
          </StyledText>

          {/* Full Name */}
          <StyledView className="mb-4">
            <StyledText className="text-white/60 text-sm font-light mb-2">
              Full Name *
            </StyledText>
            <StyledView className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3">
              <StyledTextInput
                className="text-white font-light text-lg"
                value={fullName}
                onChangeText={setFullName}
                placeholder="Enter your full name"
                placeholderTextColor="#6F8A9A"
                autoCapitalize="words"
                editable={!saving}
              />
            </StyledView>
          </StyledView>

          {/* Email */}
          <StyledView className="mb-4">
            <StyledText className="text-white/60 text-sm font-light mb-2">
              Email (Optional)
            </StyledText>
            <StyledView className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3">
              <StyledTextInput
                className="text-white font-light text-lg"
                value={email}
                onChangeText={setEmail}
                placeholder="email@example.com"
                placeholderTextColor="#6F8A9A"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!saving}
              />
            </StyledView>
          </StyledView>

          {/* Phone Number (Read-only) */}
          <StyledView className="mb-4">
            <StyledText className="text-white/60 text-sm font-light mb-2">
              Phone Number
            </StyledText>
            <StyledView className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3">
              <StyledText className="text-white/50 font-light text-lg">
                {user?.phone_number}
              </StyledText>
            </StyledView>
            <StyledText className="text-white/40 text-xs font-light mt-1">
              Phone number cannot be changed
            </StyledText>
          </StyledView>
        </StyledView>

        {/* Verification Status */}
        <StyledView className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8">
          <StyledView className="flex-row items-center justify-between mb-3">
            <StyledText className="text-white font-light">Phone Verified</StyledText>
            <StyledView className="flex-row items-center">
              <StyledText className="text-green-400 mr-2">
                {user?.is_phone_verified ? '✓' : '✗'}
              </StyledText>
              <StyledText className={user?.is_phone_verified ? "text-green-400 font-light" : "text-red-400 font-light"}>
                {user?.is_phone_verified ? 'Verified' : 'Not Verified'}
              </StyledText>
            </StyledView>
          </StyledView>
        </StyledView>

        {/* Save Button */}
        <StyledView className="gap-4 mb-8">
          <Button
            title={saving ? 'Saving...' : 'Save Changes'}
            onPress={handleSave}
            variant="primary"
            size="lg"
            disabled={!hasChanges || saving}
          />
          <Button
            title="Cancel"
            onPress={handleCancel}
            variant="ghost"
            size="lg"
            disabled={saving}
          />
        </StyledView>

        {/* Info Box */}
        <StyledView className="bg-sky/10 border border-sky/20 rounded-2xl p-4">
          <StyledText className="text-sky text-sm font-light text-center">
            💡 Your phone number is your unique identifier and cannot be changed.
          </StyledText>
        </StyledView>

        <StyledView className="h-8" />
      </StyledScrollView>
    </StyledSafeAreaView>
  );
}
