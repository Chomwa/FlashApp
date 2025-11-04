# Flash Payment App - OTP Authentication Test Guide

## 🔐 OTP Authentication Flow

Your Flash app uses **OTP (One-Time Password)** authentication instead of traditional passwords. Here's how to test it:

### **Debug OTP Code:**
- **Code**: `123456` (works in development mode)
- **Displayed**: Debug code shows in yellow box during development

## 📱 How to Test Login:

### **Method 1: Register New User**
1. Open Flash app
2. Click **"Get Started"**
3. Enter any Zambian phone number (e.g., `+260977888999`)
4. Click **"Continue"**
5. Wait for OTP screen to load
6. **See the yellow debug box** showing: `🛠️ DEBUG CODE: 123456`
7. Enter **`123456`** in the verification field
8. Click **"Verify Code"**
9. ✅ **You're logged in!** Now "Flash" button will work

### **Method 2: Login Existing User**
1. Open Flash app
2. Click **"Already have an account?"**
3. Enter an existing phone number (e.g., `+260977777777`)
4. Click **"Continue"**
5. Enter debug OTP: **`123456`**
6. ✅ **Logged in successfully!**

## 🚀 Testing Send Money (After Login):

1. **Make sure you're logged in** (completed OTP verification)
2. Click **"Flash"** on home screen
3. Enter recipient: `+260971111111` (John Mwanza)
4. Enter amount: `25` ZMW
5. Add message: `Test payment`
6. Click **"Send Money"**
7. ✅ **Payment should work!** (No more 401 errors)

## 🔍 What Happens Behind the Scenes:

### **During OTP Verification:**
1. App accepts debug code `123456`
2. **Auto-creates backend user** with phone number
3. **Gets authentication token** from backend
4. **Stores token** in AsyncStorage
5. **Navigates to main app** with valid session

### **During Send Money:**
1. App sends request **with auth token**
2. Backend accepts request (no 401 error)
3. Transaction processes successfully
4. Shows in Activity page

## 🛠️ Debug Features:

- **Yellow Debug Box**: Shows `123456` code in development
- **Auto-Registration**: Creates backend user automatically
- **Token Storage**: Saves auth token for API calls
- **Console Logs**: Check Metro logs for auth status

## 📋 Test Phone Numbers:

Use any of these for testing:
- `+260977888999` (New test user)
- `+260977777777` (Sarah Banda - existing)
- `+260971111111` (John Mwanza - existing)
- `+260976666666` (Mary Lungu - existing)

## ✅ Expected Results:

- **Login**: Smooth OTP flow with debug code
- **Send Money**: No 401 errors, successful transactions
- **Activity**: Shows transaction history
- **Backend Logs**: Shows successful API calls

**Try it now - the 401 authentication errors should be completely fixed!** 🎉