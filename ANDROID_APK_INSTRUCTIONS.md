# Flash Android APK - Demo Version 📱

## APK Details
- **File:** `Flash-v1.0.1-demo.apk`
- **Size:** 23MB
- **Version:** 1.0.1-demo
- **Build Date:** November 2, 2025
- **Environment:** Demo/Local Backend

## ⚠️ Important: Backend Requirement

**This APK connects to a local backend server and will only work if:**

1. **Same WiFi Network:** Test users must be on the same WiFi network as the developer's computer
2. **Backend Running:** The Flash backend must be running on the developer's machine
3. **Port Forwarding:** Network must allow connections to port 8002

### Current Configuration
- **API URL:** `http://localhost:8002/api`
- **Demo Mode:** 5-second auto-payment completion
- **No Daily Limits:** Unlimited transactions for testing
- **Test Environment:** Uses local database

## 📲 Installation Instructions

### For Android Devices:

1. **Enable Unknown Sources:**
   - Go to Settings → Security → Unknown Sources
   - Enable "Install from Unknown Sources"
   - Or Settings → Apps → Special Access → Install Unknown Apps

2. **Install APK:**
   - Transfer `Flash-v1.0.1-demo.apk` to your Android device
   - Tap the APK file to install
   - Follow installation prompts

3. **Launch App:**
   - Open "Flash" app from app drawer
   - The app icon should appear as Flash logo

## 👥 Test User Accounts

Use these pre-created accounts for testing:

### Alice (Test User 1)
- **Phone:** `+260971111111`
- **Password:** `password123`
- **Name:** Alice Mwanza

### Bob (Test User 2)  
- **Phone:** `+260972222222`
- **Password:** `password123`
- **Name:** Bob Phiri

## 🚀 Demo Experience

### Registration Flow (New Users)
1. Open app → "Create Account"
2. Enter any valid Zambian phone number (+260...)
3. Enter full name and password
4. OTP auto-completes in 5 seconds
5. Account created successfully

### Payment Flow
1. Login with test account
2. Send Money → Select contact or enter phone
3. Enter amount (no limits in demo)
4. Payment approval screen shows for 5 seconds
5. Auto-completes → "Payment Successful!"
6. View professional receipt

### Demo Features
- ✅ **5-second payment simulation**
- ✅ **No daily limits**
- ✅ **Auto-completing transactions**
- ✅ **Professional UI/UX**
- ✅ **Receipt generation**
- ✅ **Transaction history**

## 🔧 Developer Setup Required

**For the APK to work, the developer must:**

1. **Start Backend:**
   ```bash
   cd /Users/chomwashikati/FlashApp
   docker-compose up -d
   ```

2. **Verify Backend:**
   - Check: http://localhost:8002/api/
   - Should show Django API

3. **Network Access:**
   - Share WiFi password with test users
   - Ensure firewall allows port 8002
   - Consider using computer's IP address instead of localhost

## 📱 Testing Scenarios

### Scenario 1: User Registration
- Create new account with any +260 number
- Test OTP flow (auto-completes)
- Verify account creation

### Scenario 2: P2P Payments
- Login as Alice (+260971111111)
- Send money to Bob (+260972222222)
- Test different amounts (10, 100, 1000 ZMW)
- Verify receipt generation

### Scenario 3: Contact Integration
- Add contacts to phone
- Send money to saved contacts
- Test contact selection flow

### Scenario 4: Transaction History
- View past transactions
- Check transaction details
- Test receipt sharing

## 🐛 Troubleshooting

### "Network Error" Issues
- **Cause:** Can't reach backend server
- **Fix:** Ensure backend is running and device is on same WiFi

### "Login Failed" 
- **Cause:** Backend not responding or wrong credentials
- **Fix:** Use test accounts: +260971111111 / password123

### "Payment Failed"
- **Cause:** Demo mode disabled or backend issue
- **Fix:** Check backend logs, restart if needed

### "App Crashes"
- **Cause:** Network connectivity or missing backend
- **Fix:** Check backend status, restart app

## 🔄 Next Steps for Production

### To make this work for external users:

1. **Deploy Backend:**
   - Host on Heroku/DigitalOcean
   - Update API_URL to production domain

2. **Create Production APK:**
   - Update environment to production
   - Rebuild with production settings

3. **App Store Distribution:**
   - Upload to Google Play Store
   - Or distribute signed APK directly

## 📞 Support

If you encounter issues:
1. Check that backend is running
2. Verify network connectivity
3. Try restarting the app
4. Contact developer for backend access

---

**Demo Version Status:** ✅ Ready for Local Testing
**Production Status:** 🔄 Requires backend deployment
**Next Release:** Production-ready with live backend