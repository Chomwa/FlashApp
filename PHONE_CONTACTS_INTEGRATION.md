# Phone Contacts Integration Guide

## Current Status

The Flash app currently uses **backend-stored contacts** (Flash-specific contacts saved via the API). To read from the **phone's native contact list**, we need to integrate `react-native-contacts`.

---

## Why Native Phone Contacts?

Benefits:
1. **User Convenience**: No need to manually add contacts - they're already in the phone
2. **Seamless Experience**: Users can send money to anyone in their phonebook
3. **Real-time Sync**: Contact changes reflect automatically
4. **Better UX**: Familiar contact list interface

---

## Implementation Plan

### Step 1: Install Dependencies

```bash
cd mobile_app
npm install react-native-contacts
npm install react-native-permissions
```

**iOS Setup**:
```bash
cd ios && pod install && cd ..
```

Add to `ios/FlashApp/Info.plist`:
```xml
<key>NSContactsUsageDescription</key>
<string>Flash needs access to your contacts to help you send money quickly to friends and family</string>
```

**Android Setup**:

Add to `android/app/src/main/AndroidManifest.xml`:
```xml
<uses-permission android:name="android.permission.READ_CONTACTS" />
```

---

### Step 2: Update SendMoneyScreen.tsx

Replace the `loadContacts` function:

```typescript
import Contacts from 'react-native-contacts';
import { request, PERMISSIONS, RESULTS } from 'react-native-permissions';

const loadContacts = async () => {
  setLoadingContacts(true);
  try {
    console.log('📱 Requesting contacts permission...');

    // Request permission based on platform
    const permission = Platform.OS === 'ios'
      ? PERMISSIONS.IOS.CONTACTS
      : PERMISSIONS.ANDROID.READ_CONTACTS;

    const result = await request(permission);

    if (result === RESULTS.GRANTED) {
      console.log('✅ Contacts permission granted');

      // Load all contacts
      const phoneContacts = await Contacts.getAll();
      console.log(`📇 Loaded ${phoneContacts.length} contacts from phone`);

      // Filter contacts with phone numbers
      const contactsWithPhones = phoneContacts.filter(contact =>
        contact.phoneNumbers && contact.phoneNumbers.length > 0
      );

      // Transform to our Contact interface
      const transformedContacts: Contact[] = contactsWithPhones.map(contact => ({
        recordID: contact.recordID,
        displayName: contact.displayName || contact.givenName || 'Unknown',
        phoneNumbers: contact.phoneNumbers.map(phone => ({
          number: phone.number,
          label: phone.label
        }))
      }));

      setContacts(transformedContacts);
      setShowContacts(true);
      console.log(`✅ Showing ${transformedContacts.length} contacts`);

    } else if (result === RESULTS.DENIED) {
      Alert.alert(
        'Permission Denied',
        'Flash needs access to your contacts to help you send money quickly. Please grant permission in Settings.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Open Settings', onPress: () => Linking.openSettings() }
        ]
      );
    } else {
      Alert.alert('Error', 'Unable to access contacts. Please enter phone number manually.');
    }

  } catch (error) {
    console.error('❌ Failed to load contacts:', error);
    Alert.alert('Error', 'Unable to load contacts. Please try again or enter phone number manually.');
  } finally {
    setLoadingContacts(false);
  }
};
```

---

### Step 3: Update RequestMoneyScreen.tsx

Apply the same changes as SendMoneyScreen.tsx for consistency.

---

### Step 4: Optimize Contact Listing

Add search and filtering:

```typescript
const [searchQuery, setSearchQuery] = useState('');
const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);

useEffect(() => {
  if (!searchQuery.trim()) {
    setFilteredContacts(contacts);
    return;
  }

  const filtered = contacts.filter(contact => {
    const nameMatch = contact.displayName.toLowerCase().includes(searchQuery.toLowerCase());
    const phoneMatch = contact.phoneNumbers.some(p =>
      p.number.includes(searchQuery)
    );
    return nameMatch || phoneMatch;
  });

  setFilteredContacts(filtered);
}, [searchQuery, contacts]);
```

---

### Step 5: Add Contact Search UI

```typescript
<StyledView className="bg-white/5 border border-white/10 rounded-2xl px-4 py-2 mb-4">
  <StyledTextInput
    className="text-white font-light text-lg"
    value={searchQuery}
    onChangeText={setSearchQuery}
    placeholder="Search contacts..."
    placeholderTextColor="#6F8A9A"
  />
</StyledView>
```

---

## Hybrid Approach: Phone Contacts + Flash Contacts

For the best user experience, combine both:

1. **Phone Contacts**: Read from device for sending money
2. **Flash Contacts**: Backend-stored favorites for quick access

### Implementation:

```typescript
const loadAllContacts = async () => {
  try {
    // Load phone contacts
    const phoneContacts = await loadPhoneContacts();

    // Load Flash favorites
    const flashContacts = await contactsAPI.getContacts();

    // Combine and dedupe by phone number
    const combinedContacts = [...phoneContacts];
    const phoneNumbers = new Set(phoneContacts.flatMap(c =>
      c.phoneNumbers.map(p => p.number)
    ));

    // Add Flash contacts that aren't in phone
    flashContacts.forEach(fc => {
      if (!phoneNumbers.has(fc.contact_phone)) {
        combinedContacts.push({
          recordID: fc.id,
          displayName: fc.contact_name,
          phoneNumbers: [{ number: fc.contact_phone, label: 'Flash' }],
          isFlashContact: true // Mark as Flash-specific
        });
      }
    });

    setContacts(combinedContacts);
  } catch (error) {
    console.error('Failed to load contacts:', error);
  }
};
```

---

## Security & Privacy Considerations

1. **Permission Handling**:
   - Always explain why you need contacts access
   - Gracefully handle denial
   - Never block core functionality

2. **Data Privacy**:
   - Don't upload phone contacts to backend without consent
   - Only send selected contact's phone number when initiating payment
   - Follow GDPR/privacy regulations

3. **User Control**:
   - Allow users to choose between phone and manual entry
   - Provide option to never sync phone contacts
   - Clear privacy policy

---

## Current Workaround (No Library)

Until `react-native-contacts` is installed, users can:

1. **Manual Entry**: Type phone number directly
2. **Recent Contacts**: Show recent recipients (stored in backend)
3. **Flash Contacts**: Use backend-stored favorites

---

## Files to Update

### Required Changes:
- [ ] `mobile_app/package.json` - Add dependencies
- [ ] `mobile_app/src/screens/main/SendMoneyScreen.tsx` - Implement phone contacts
- [ ] `mobile_app/src/screens/main/RequestMoneyScreen.tsx` - Implement phone contacts
- [ ] `ios/FlashApp/Info.plist` - Add permission description
- [ ] `android/app/src/main/AndroidManifest.xml` - Add permission

### Optional Enhancements:
- [ ] Contact caching for performance
- [ ] Favorite contacts feature
- [ ] Recent recipients list
- [ ] Contact sync indicators

---

## Testing Checklist

After implementation:

- [ ] iOS: Grant permission → Load contacts → Search works
- [ ] iOS: Deny permission → Shows error → Can still use manual entry
- [ ] Android: Grant permission → Load contacts → Search works
- [ ] Android: Deny permission → Shows error → Can still use manual entry
- [ ] Select contact → Phone number pre-fills correctly
- [ ] Search contacts by name
- [ ] Search contacts by phone number
- [ ] Handle contacts with multiple phone numbers
- [ ] Handle contacts with no display name
- [ ] Performance with 1000+ contacts

---

## Alternative: Device Contacts API (Simpler)

If `react-native-contacts` has issues, consider using Expo's Contacts API:

```bash
npm install expo-contacts
```

```typescript
import * as Contacts from 'expo-contacts';

const { status } = await Contacts.requestPermissionsAsync();
if (status === 'granted') {
  const { data } = await Contacts.getContactsAsync({
    fields: [Contacts.Fields.PhoneNumbers],
  });
}
```

**Note**: Requires Expo or expo-modules integration.

---

## Summary

**Current State**: Backend-only contacts (Flash-specific)
**Desired State**: Phone contacts + Flash favorites
**Effort**: ~4-6 hours
**Dependencies**: `react-native-contacts`, `react-native-permissions`
**Priority**: HIGH (core UX feature)

Users expect to send money to anyone in their phone's contact list. This is a critical feature for user adoption.
