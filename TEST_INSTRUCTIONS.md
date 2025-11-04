# Flash MVP Testing Instructions

## 🚀 Quick Start Testing

### 1. Backend Setup
```bash
cd backend
docker-compose up -d
docker-compose exec backend python manage.py migrate
docker-compose exec backend python manage.py createsuperuser
```

### 2. Mobile App Setup
```bash
cd mobile_app
npm install
npm run ios  # or npm run android
```

## 🧪 Testing Checklist

### Phase 1: UI/UX Testing ✅
- [x] HomeScreen - Clean layout with Flash/Scan buttons
- [x] SendMoneyScreen - Professional Swish-like design with viral cards
- [x] RequestMoneyScreen - Matches SendMoney quality
- [x] QRScannerScreen - Camera interface with demo functionality
- [x] MyQRScreen - QR code display and sharing
- [x] ActivityScreen - Transaction history with filters
- [x] ReceiptScreen - Professional receipt display

### Phase 2: API Integration ✅
- [x] Real API calls in SendMoney and RequestMoney screens
- [x] Loading states and error handling
- [x] Backend MTN API implementation ready
- [x] Proper authentication flow

### Phase 3: End-to-End Testing 🔄

#### Test Scenarios:

**1. User Registration Flow:**
```
1. Open app → Welcome screen
2. Tap "Get Started" → OnboardingPhone screen  
3. Enter +260971234567 → OTP screen
4. Enter debug code 123456 → Main app
```

**2. Send Money Flow:**
```
1. Tap "Flash" on home screen
2. Enter recipient phone: +260977654321
3. Enter amount: 50
4. Add message: "Test payment"
5. Select viral card (optional)
6. Tap "Flash" → API call initiated
```

**3. Request Money Flow:**
```
1. Tap "Flash" → Switch to "Request" tab
2. Enter payer phone: +260965551234  
3. Enter amount: 25
4. Add message: "Lunch money"
5. Tap "Request" → API call initiated
```

**4. QR Code Flow:**
```
1. Tap "Scan QR" on home screen
2. Tap "Demo Scan" → Simulates QR scan
3. Should navigate to SendMoney with pre-filled data
```

## 🔧 Backend API Testing

### Test MTN API Integration:
```bash
cd backend
docker-compose exec backend python manage.py shell

# Test MTN Collections API
from shared.mtn.collections_api import MtnCollectionsAPI, MtnCollectionRequest, MtnPartyIdType
from decimal import Decimal

api = MtnCollectionsAPI()
request = MtnCollectionRequest(
    amount=Decimal('50.00'),
    currency='ZMW',
    external_id='test_123',
    payer_party_id_type=MtnPartyIdType.MSISDN,
    payer_party_id='+260971234567',
    payer_message='Test payment',
    payee_note='Flash test'
)

# This will test the API call (requires sandbox credentials)
reference_id = api.request_to_pay(request)
```

## 📱 Mobile App Testing

### Debug Features Available:
- **Debug OTP Code**: 123456 (works in development)
- **Mock QR Scan**: Tap "Demo Scan" in QR scanner
- **Mock Contacts**: 5 sample contacts loaded automatically
- **API Base URL**: http://localhost:8002/api

### Test Different Scenarios:
1. **Network Errors**: Turn off WiFi during payment
2. **Invalid Amounts**: Try sending 0 or negative amounts  
3. **Invalid Phone Numbers**: Test validation
4. **Long Messages**: Test character limits
5. **Viral Cards**: Test different card selections

## 🐛 Common Issues & Solutions

### Backend Not Running:
```bash
docker-compose ps
docker-compose logs backend
```

### Mobile App Connection Issues:
- Check API base URL in `mobile_app/src/services/api.ts`
- Ensure iOS simulator can reach localhost:8002
- Check CORS settings in Django

### MTN API Issues:
- Verify sandbox credentials in `.env` file
- Check MTN developer console for API status
- Review logs: `docker-compose logs backend`

## 📊 Success Metrics

### UI/UX Quality:
- ✅ Professional Swish-like design
- ✅ Smooth scrolling and navigation
- ✅ Proper loading states
- ✅ Error handling with user-friendly messages

### API Integration:
- ✅ Real API calls (not mocked)
- ✅ Proper error handling
- ✅ Authentication working
- ✅ MTN API integration ready

### Payment Flows:
- 🔄 Send money end-to-end
- 🔄 Request money end-to-end  
- 🔄 QR code scanning
- 🔄 Transaction history updates

## 🚀 Next Steps After Testing

1. **Production MTN Credentials**: Replace sandbox keys
2. **Real SMS OTP**: Implement actual SMS service
3. **Push Notifications**: Add payment notifications
4. **Camera QR Scanning**: Integrate react-native-camera
5. **Biometric Auth**: Add Touch/Face ID
6. **App Store Deployment**: Build production versions

## 📞 Support

For testing issues:
1. Check console logs in React Native debugger
2. Check Django admin at http://localhost:8002/admin/
3. Review API docs at http://localhost:8002/api/docs/
4. Check network requests in mobile app debugger