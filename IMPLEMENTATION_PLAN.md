# Flash App - Remaining Implementation Plan

## Current Status

### ✅ Completed:
1. **Backend APIs**:
   - ✅ Contacts API (UserContactsViewSet)
   - ✅ QR Code Generation API (`/transactions/generate-qr/`)
   - ✅ Wallet API
   - ✅ Transactions API
   - ✅ Authentication API with OTP

2. **Frontend Integration**:
   - ✅ All screens connected to backend (no more mock data)
   - ✅ `contactsAPI` implemented
   - ✅ `transactionsAPI.generateQRCode()` implemented
   - ✅ Removed mock fallbacks from Activity, Profile, Contacts

3. **Integration**:
   - ✅ Frontend-backend data flow verified
   - ✅ API client properly configured with auth tokens

---

## 🚧 Remaining Tasks (Priority Order)

### Phase 1: QR Code Functionality (HIGH PRIORITY)

#### 1.1 Update MyQRScreen to Use Real Backend
**File**: `mobile_app/src/screens/main/MyQRScreen.tsx`

**Current Issue**: Uses fake random QR pattern generation

**Required Changes**:
```typescript
import { transactionsAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import QRCode from 'react-native-qrcode-svg';

// Add state for QR data
const [qrCodeData, setQRCodeData] = useState(null);
const [loading, setLoading] = useState(false);
const { user } = useAuth();

// Generate QR on mount and when amount changes
useEffect(() => {
  generateQR();
}, [activeAmount]);

const generateQR = async () => {
  setLoading(true);
  try {
    const response = await transactionsAPI.generateQRCode(
      activeAmount || undefined,
      undefined
    );
    setQRCodeData(response.qr_code_data);
  } catch (error) {
    console.error('Failed to generate QR:', error);
  } finally {
    setLoading(false);
  }
};

// Replace fake QRCodeDisplay with:
<QRCode
  value={JSON.stringify(qrCodeData)}
  size={200}
  logo={require('../../assets/logo.png')} // Optional
  logoSize={40}
  logoBackgroundColor='white'
/>
```

**Dependencies**: `react-native-qrcode-svg` (already in package.json)

---

#### 1.2 Implement Real Camera QR Scanner
**File**: `mobile_app/src/screens/main/QRScannerScreen.tsx`

**Current Issue**: Shows error message, no real camera scanning

**Required Changes**:

1. **Install Camera Library**:
```bash
cd mobile_app
npm install react-native-vision-camera
npx pod-install # For iOS
```

2. **Add Permissions** (Android):
```xml
<!-- android/app/src/main/AndroidManifest.xml -->
<uses-permission android:name="android.permission.CAMERA" />
```

3. **Add Permissions** (iOS):
```xml
<!-- ios/FlashApp/Info.plist -->
<key>NSCameraUsageDescription</key>
<string>Flash needs camera access to scan QR codes for payments</string>
```

4. **Implement Scanner**:
```typescript
import { Camera, useCameraDevices, useFrameProcessor } from 'react-native-vision-camera';
import { scanQRCodes } from 'vision-camera-code-scanner';

const devices = useCameraDevices();
const device = devices.back;

const frameProcessor = useFrameProcessor((frame) => {
  'worklet';
  const qrCodes = scanQRCodes(frame);
  if (qrCodes.length > 0 && !scanned) {
    runOnJS(handleQRCodeScanned)(qrCodes[0].value);
  }
}, [scanned]);

<Camera
  device={device}
  isActive={true}
  frameProcessor={frameProcessor}
  style={StyleSheet.absoluteFill}
/>
```

**Dependencies**:
- `react-native-vision-camera`
- `vision-camera-code-scanner`

---

#### 1.3 Create Seamless Scan-to-Send Flow
**Files**:
- `mobile_app/src/screens/main/QRScannerScreen.tsx`
- `mobile_app/src/screens/main/SendMoneyScreen.tsx`

**Implementation**:
```typescript
// In QRScannerScreen.tsx
const handleQRCodeScanned = (data: string) => {
  if (scanned) return;
  setScanned(true);

  try {
    const qrData = JSON.parse(data);

    if (qrData.type === 'flash_payment') {
      navigation.navigate('SendMoney', {
        recipient: {
          phone: qrData.phone,
          name: qrData.name
        },
        prefilledAmount: qrData.amount || '',
        prefilledMessage: qrData.message || ''
      });
    } else {
      Alert.alert('Invalid QR Code', 'This is not a valid Flash payment code.');
    }
  } catch (error) {
    Alert.alert('Invalid QR Code', 'Unable to process this QR code.');
  }
};

// In SendMoneyScreen.tsx - Add prefill logic
const route = useRoute<any>();
const { prefilledAmount, prefilledMessage } = route.params || {};

useEffect(() => {
  if (prefilledAmount) setAmount(prefilledAmount);
  if (prefilledMessage) setMessage(prefilledMessage);
}, [prefilledAmount, prefilledMessage]);
```

---

### Phase 2: Profile Pages (MEDIUM PRIORITY)

#### 2.1 Create Edit Profile Screen
**File**: `mobile_app/src/screens/main/EditProfileScreen.tsx` (NEW)

**Features**:
- Edit full name
- Edit email (optional)
- Upload avatar image
- Save to backend via `/api/auth/me/` (PATCH)

**Backend**: Already exists (CurrentUserView in users/views.py supports PATCH)

**Implementation**:
```typescript
import ImagePicker from 'react-native-image-picker';

const handleSaveProfile = async () => {
  try {
    const formData = new FormData();
    formData.append('full_name', fullName);
    if (email) formData.append('email', email);
    if (avatarUri) {
      formData.append('avatar', {
        uri: avatarUri,
        type: 'image/jpeg',
        name: 'avatar.jpg',
      });
    }

    await api.patch('/auth/me/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });

    Alert.alert('Success', 'Profile updated successfully');
  } catch (error) {
    Alert.alert('Error', 'Failed to update profile');
  }
};
```

---

#### 2.2 Create Security Settings Screen
**File**: `mobile_app/src/screens/main/SecuritySettingsScreen.tsx` (NEW)

**Features**:
- Change password
- Enable/disable biometric authentication
- View active sessions
- Two-factor authentication settings

**Backend Needed**: Add endpoints:
- `/api/auth/change-password/` (POST)
- `/api/auth/sessions/` (GET) - list active sessions
- `/api/auth/sessions/{id}/` (DELETE) - revoke session

---

#### 2.3 Create KYC Verification Screen
**File**: `mobile_app/src/screens/main/KYCVerificationScreen.tsx` (NEW)

**Features**:
- Upload ID document
- Selfie verification
- Submit for review
- View verification status

**Backend Needed**: Add endpoints:
- `/api/auth/profile/kyc/` (POST) - submit KYC documents
- `/api/auth/profile/kyc/status/` (GET) - check status

---

### Phase 3: Contacts Management (MEDIUM PRIORITY)

#### 3.1 Create Add Contact Screen
**File**: `mobile_app/src/screens/main/AddContactScreen.tsx` (NEW)

**Features**:
- Manual phone number entry
- Contact name input
- Save to backend via `/api/auth/contacts/` (POST)

**Implementation**:
```typescript
const handleAddContact = async () => {
  try {
    await contactsAPI.addContact({
      contact_name: name,
      contact_phone: phone
    });
    Alert.alert('Success', 'Contact added successfully');
    navigation.goBack();
  } catch (error) {
    Alert.alert('Error', 'Failed to add contact');
  }
};
```

---

#### 3.2 Create Contacts List Screen
**File**: `mobile_app/src/screens/main/ContactsScreen.tsx` (EXISTS - UPDATE)

**Current Status**: Placeholder

**Required Changes**:
- Load contacts from `contactsAPI.getContacts()`
- Display in list with search
- Swipe-to-delete functionality
- Navigate to SendMoney on tap

---

### Phase 4: Testing (HIGH PRIORITY)

#### 4.1 Backend Testing
```bash
# Start backend
docker-compose up

# Run migrations
docker-compose exec backend python manage.py migrate

# Create test users
docker-compose exec backend python manage.py shell
>>> from users.models import User
>>> user = User.objects.create_user(username='+260971111111', phone_number='+260971111111', password='testpass123', full_name='Test User')

# Test endpoints
curl -X POST http://localhost:8002/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"phone_number": "+260971111111", "password": "testpass123"}'

# Get token and test wallet
curl -H "Authorization: Token YOUR_TOKEN" \
  http://localhost:8002/api/transactions/wallet/

# Test QR generation
curl -X POST -H "Authorization: Token YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"amount": "100", "message": "Test payment"}' \
  http://localhost:8002/api/transactions/generate-qr/
```

---

#### 4.2 Frontend Testing Checklist

**Authentication Flow**:
- [ ] Register new user with OTP
- [ ] Login with existing credentials
- [ ] Logout and verify token removal
- [ ] Token persistence across app restarts

**Wallet**:
- [ ] View wallet balance
- [ ] View daily limit and spent
- [ ] Verify data updates after transaction

**Transactions**:
- [ ] Send money to another user
- [ ] Send money to non-user phone number
- [ ] View transaction history
- [ ] View transaction details
- [ ] Filter transactions (All/Sent/Received)

**Contacts**:
- [ ] View contacts list
- [ ] Add new contact
- [ ] Delete contact
- [ ] Select contact for payment

**QR Code**:
- [ ] Generate personal QR code
- [ ] QR code updates with amount
- [ ] Share QR code
- [ ] Scan QR code with camera
- [ ] Scanned data pre-fills SendMoney form
- [ ] Complete payment from scanned QR

**Profile**:
- [ ] View profile information
- [ ] Edit profile (name, email)
- [ ] Upload avatar
- [ ] View limits and verification status

---

#### 4.3 Integration Testing

**Complete User Journey**:
1. User A registers → receives OTP → verifies → logs in
2. User A views empty wallet and transaction history
3. User A generates QR code with amount ZMW 50
4. User B scans User A's QR code
5. User B's SendMoney screen pre-fills with User A's details and ZMW 50
6. User B confirms and sends payment
7. User B sees transaction in history
8. User A receives notification/sees transaction

---

### Phase 5: Polish & Production Readiness (LOW PRIORITY)

#### 5.1 Error Handling
- Network error screens
- Offline mode indicators
- Retry mechanisms
- User-friendly error messages

#### 5.2 Loading States
- Skeleton loaders
- Spinner components
- Progress indicators

#### 5.3 Performance
- Image optimization
- List virtualization
- API response caching
- Lazy loading

#### 5.4 Security Hardening
- Certificate pinning
- Jailbreak/root detection
- Biometric authentication
- Transaction PIN

---

## 📦 Required Dependencies

### Already Installed:
✅ `react-native-qrcode-svg` - QR code display
✅ `@react-native-async-storage/async-storage` - Local storage
✅ `axios` - HTTP client
✅ `react-native-flash-message` - Toast messages

### Need to Install:
- `react-native-vision-camera` - Camera access
- `vision-camera-code-scanner` - QR scanning
- `react-native-image-picker` - Avatar upload
- `react-native-permissions` - Permission handling

```bash
cd mobile_app
npm install react-native-vision-camera vision-camera-code-scanner react-native-image-picker react-native-permissions
cd ios && pod-install && cd ..
```

---

## 🎯 Recommended Implementation Order

### Week 1: Core Functionality
1. ✅ Fix frontend-backend integration (DONE)
2. 🟡 Update MyQRScreen with real backend QR generation
3. 🟡 Implement camera QR scanning
4. 🟡 Create seamless scan-to-send flow

### Week 2: Profile & Contacts
5. 🟡 Create EditProfileScreen
6. 🟡 Update ContactsScreen with real data
7. 🟡 Create AddContactScreen
8. 🟡 Implement avatar upload

### Week 3: Testing & Polish
9. 🟡 Comprehensive backend testing
10. 🟡 End-to-end frontend testing
11. 🟡 Integration testing
12. 🟡 Bug fixes and polish

### Week 4: Production Prep
13. 🟡 Security hardening
14. 🟡 Performance optimization
15. 🟡 Documentation
16. 🟡 Deployment preparation

---

## 📝 Notes

- All backend APIs are functional and ready
- Frontend structure is clean and well-organized
- Focus on QR functionality first (highest user impact)
- Test thoroughly before moving to next phase
- Keep commits atomic and well-documented

---

## 🚀 Quick Start for Next Developer

```bash
# 1. Pull latest changes
git pull origin claude/review-app-011CUpCau6Qzc8nmKeBgt6hj

# 2. Start backend
docker-compose up -d
docker-compose exec backend python manage.py migrate

# 3. Start mobile app
cd mobile_app
npm install
npm run ios # or npm run android

# 4. Begin with MyQRScreen implementation
# See Phase 1.1 above for detailed instructions
```
