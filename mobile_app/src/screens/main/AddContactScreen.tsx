import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, Alert } from 'react-native';
import { styled } from 'nativewind';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../ui';
import { contactsAPI, validateZambianPhone, formatZambianPhone } from '../../services/api';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTouchableOpacity = styled(TouchableOpacity);
const StyledTextInput = styled(TextInput);
const StyledScrollView = styled(ScrollView);
const StyledSafeAreaView = styled(SafeAreaView);

export default function AddContactScreen() {
  const navigation = useNavigation<any>();
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    // Validation
    if (!contactName.trim()) {
      Alert.alert('Validation Error', 'Please enter a contact name.');
      return;
    }

    if (!contactPhone.trim()) {
      Alert.alert('Validation Error', 'Please enter a phone number.');
      return;
    }

    // Validate phone number format
    const formattedPhone = formatZambianPhone(contactPhone);
    if (!validateZambianPhone(formattedPhone)) {
      Alert.alert(
        'Invalid Phone Number',
        'Please enter a valid Zambian phone number.\nExamples: +260971234567, 0971234567, 971234567'
      );
      return;
    }

    setSaving(true);
    try {
      console.log('💾 Saving contact:', {
        contact_name: contactName.trim(),
        contact_phone: formattedPhone
      });

      await contactsAPI.addContact({
        contact_name: contactName.trim(),
        contact_phone: formattedPhone
      });

      console.log('✅ Contact saved successfully');

      Alert.alert(
        'Success',
        'Contact added successfully!',
        [
          {
            text: 'Add Another',
            onPress: () => {
              setContactName('');
              setContactPhone('');
            }
          },
          {
            text: 'Done',
            onPress: () => navigation.goBack()
          }
        ]
      );
    } catch (error: any) {
      console.error('❌ Failed to save contact:', error);
      const errorMessage = error?.response?.data?.error ||
                          error?.response?.data?.message ||
                          'Unable to save contact. Please try again.';
      Alert.alert('Save Failed', errorMessage);
    } finally {
      setSaving(false);
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
          Add Contact
        </StyledText>
        <StyledView className="w-10" />
      </StyledView>

      <StyledScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 32, paddingVertical: 24 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Icon */}
        <StyledView className="items-center mb-8">
          <StyledView className="w-24 h-24 bg-sky/20 rounded-2xl items-center justify-center mb-4">
            <StyledText className="text-sky text-4xl">👤</StyledText>
          </StyledView>
          <StyledText className="text-white text-lg font-light">
            Add a new contact to Flash
          </StyledText>
        </StyledView>

        {/* Contact Name */}
        <StyledView className="mb-6">
          <StyledText className="text-white/60 text-sm font-light mb-2">
            Contact Name *
          </StyledText>
          <StyledView className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3">
            <StyledTextInput
              className="text-white font-light text-lg"
              value={contactName}
              onChangeText={setContactName}
              placeholder="e.g., John Mwanza"
              placeholderTextColor="#6F8A9A"
              autoCapitalize="words"
              editable={!saving}
              autoFocus
            />
          </StyledView>
        </StyledView>

        {/* Phone Number */}
        <StyledView className="mb-8">
          <StyledText className="text-white/60 text-sm font-light mb-2">
            Phone Number *
          </StyledText>
          <StyledView className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3">
            <StyledTextInput
              className="text-white font-light text-lg"
              value={contactPhone}
              onChangeText={setContactPhone}
              placeholder="+260 97 123 4567"
              placeholderTextColor="#6F8A9A"
              keyboardType="phone-pad"
              editable={!saving}
            />
          </StyledView>
          <StyledText className="text-white/40 text-xs font-light mt-1">
            Zambian numbers only (+260, 09, or 9)
          </StyledText>
        </StyledView>

        {/* Info Box */}
        <StyledView className="bg-sky/10 border border-sky/20 rounded-2xl p-4 mb-8">
          <StyledText className="text-sky text-sm font-light">
            💡 This contact will be saved to your Flash contacts for quick access when sending money.
          </StyledText>
        </StyledView>

        {/* Save Button */}
        <StyledView className="gap-4 mb-8">
          <Button
            title={saving ? 'Saving...' : 'Save Contact'}
            onPress={handleSave}
            variant="primary"
            size="lg"
            disabled={saving}
          />
          <Button
            title="Cancel"
            onPress={() => navigation.goBack()}
            variant="ghost"
            size="lg"
            disabled={saving}
          />
        </StyledView>

        {/* Format Examples */}
        <StyledView className="bg-white/5 border border-white/10 rounded-2xl p-4">
          <StyledText className="text-white/60 text-sm font-light mb-3">
            Accepted phone number formats:
          </StyledText>
          <StyledView className="space-y-2">
            <StyledText className="text-white/50 text-sm font-light">
              • +260971234567 (International)
            </StyledText>
            <StyledText className="text-white/50 text-sm font-light">
              • 0971234567 (Local)
            </StyledText>
            <StyledText className="text-white/50 text-sm font-light">
              • 971234567 (Short format)
            </StyledText>
          </StyledView>
        </StyledView>

        <StyledView className="h-8" />
      </StyledScrollView>
    </StyledSafeAreaView>
  );
}
