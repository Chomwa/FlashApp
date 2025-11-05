import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, Alert, RefreshControl, ActivityIndicator } from 'react-native';
import { styled } from 'nativewind';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../ui';
import { contactsAPI } from '../../services/api';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTouchableOpacity = styled(TouchableOpacity);
const StyledTextInput = styled(TextInput);
const StyledScrollView = styled(ScrollView);
const StyledSafeAreaView = styled(SafeAreaView);

interface Contact {
  id: string;
  contact_name: string;
  contact_phone: string;
  created_at?: string;
}

export default function ContactsScreen() {
  const navigation = useNavigation<any>();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Load contacts when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadContacts();
    }, [])
  );

  const loadContacts = async () => {
    setLoading(true);
    try {
      console.log('📇 Loading contacts from backend...');
      const backendContacts = await contactsAPI.getContacts();
      console.log('✅ Contacts loaded:', backendContacts.length);
      setContacts(backendContacts);
      setFilteredContacts(backendContacts);
    } catch (error) {
      console.error('❌ Failed to load contacts:', error);
      Alert.alert('Error', 'Failed to load contacts. Please try again.');
      setContacts([]);
      setFilteredContacts([]);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadContacts();
    setRefreshing(false);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setFilteredContacts(contacts);
      return;
    }

    const filtered = contacts.filter(contact =>
      contact.contact_name.toLowerCase().includes(query.toLowerCase()) ||
      contact.contact_phone.includes(query)
    );
    setFilteredContacts(filtered);
  };

  const handleContactPress = (contact: Contact) => {
    navigation.navigate('SendMoney', {
      recipient: {
        phone: contact.contact_phone,
        name: contact.contact_name
      }
    });
  };

  const handleDeleteContact = (contact: Contact) => {
    Alert.alert(
      'Delete Contact',
      `Are you sure you want to delete ${contact.contact_name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('🗑️ Deleting contact:', contact.id);
              await contactsAPI.deleteContact(contact.id);
              console.log('✅ Contact deleted');

              // Remove from local state
              const updatedContacts = contacts.filter(c => c.id !== contact.id);
              setContacts(updatedContacts);
              setFilteredContacts(updatedContacts.filter(c =>
                !searchQuery.trim() ||
                c.contact_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                c.contact_phone.includes(searchQuery)
              ));

              Alert.alert('Success', 'Contact deleted successfully');
            } catch (error) {
              console.error('❌ Failed to delete contact:', error);
              Alert.alert('Error', 'Failed to delete contact. Please try again.');
            }
          }
        }
      ]
    );
  };

  return (
    <StyledSafeAreaView className="flex-1 bg-navy">
      {/* Header */}
      <StyledView className="px-8 py-4 mt-2">
        <StyledView className="flex-row items-center justify-between mb-6">
          <StyledText className="text-white text-3xl font-thin">
            Contacts
          </StyledText>
          <StyledTouchableOpacity
            className="bg-sky rounded-2xl px-4 py-2"
            onPress={() => navigation.navigate('AddContact')}
          >
            <StyledText className="text-white font-light text-lg">+ Add</StyledText>
          </StyledTouchableOpacity>
        </StyledView>

        {/* Search Bar */}
        <StyledView className="bg-white/5 border border-white/10 rounded-2xl px-4 py-2 mb-4">
          <StyledTextInput
            className="text-white font-light text-lg"
            value={searchQuery}
            onChangeText={handleSearch}
            placeholder="Search contacts..."
            placeholderTextColor="#6F8A9A"
          />
        </StyledView>

        {/* Contact Count */}
        <StyledText className="text-white/60 text-sm font-light">
          {filteredContacts.length} {filteredContacts.length === 1 ? 'contact' : 'contacts'}
        </StyledText>
      </StyledView>

      {/* Contacts List */}
      <StyledView className="flex-1">
        {loading ? (
          <StyledView className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#0EA5E9" />
            <StyledText className="text-white/60 mt-4">Loading contacts...</StyledText>
          </StyledView>
        ) : filteredContacts.length === 0 ? (
          <StyledView className="flex-1 items-center justify-center px-8">
            <StyledView className="w-24 h-24 bg-white/5 rounded-2xl items-center justify-center mb-6">
              <StyledText className="text-white/40 text-4xl">👥</StyledText>
            </StyledView>
            <StyledText className="text-white text-xl font-light mb-3 text-center">
              {searchQuery ? 'No contacts found' : 'No contacts yet'}
            </StyledText>
            <StyledText className="text-white/60 text-center font-light mb-8">
              {searchQuery
                ? 'Try a different search term'
                : 'Add contacts to quickly send money to your favorite people'}
            </StyledText>
            {!searchQuery && (
              <Button
                title="Add Your First Contact"
                onPress={() => navigation.navigate('AddContact')}
                variant="primary"
              />
            )}
          </StyledView>
        ) : (
          <StyledScrollView
            className="flex-1 px-8"
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor="#0EA5E9"
                colors={["#0EA5E9"]}
              />
            }
            showsVerticalScrollIndicator={false}
          >
            <StyledView className="space-y-3">
              {filteredContacts.map((contact) => (
                <StyledView
                  key={contact.id}
                  className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden"
                >
                  <StyledTouchableOpacity
                    className="flex-row items-center p-4"
                    onPress={() => handleContactPress(contact)}
                    activeOpacity={0.7}
                  >
                    {/* Avatar */}
                    <StyledView className="w-12 h-12 bg-sky rounded-full items-center justify-center mr-4">
                      <StyledText className="text-white font-bold text-lg">
                        {contact.contact_name.charAt(0).toUpperCase()}
                      </StyledText>
                    </StyledView>

                    {/* Contact Info */}
                    <StyledView className="flex-1">
                      <StyledText className="text-white font-light text-lg mb-1">
                        {contact.contact_name}
                      </StyledText>
                      <StyledText className="text-white/60 text-sm font-light">
                        {contact.contact_phone}
                      </StyledText>
                    </StyledView>

                    {/* Actions */}
                    <StyledView className="flex-row items-center gap-2">
                      <StyledTouchableOpacity
                        className="w-10 h-10 bg-white/10 rounded-full items-center justify-center"
                        onPress={() => handleDeleteContact(contact)}
                      >
                        <StyledText className="text-red-400 text-lg">🗑️</StyledText>
                      </StyledTouchableOpacity>
                      <StyledView className="w-10 h-10 bg-white/10 rounded-full items-center justify-center">
                        <StyledText className="text-sky text-lg">→</StyledText>
                      </StyledView>
                    </StyledView>
                  </StyledTouchableOpacity>
                </StyledView>
              ))}
            </StyledView>

            <StyledView className="h-20" />
          </StyledScrollView>
        )}
      </StyledView>
    </StyledSafeAreaView>
  );
}
