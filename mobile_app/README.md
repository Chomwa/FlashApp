# Flash Mobile App

A React Native mobile payment app similar to Swish, built for instant P2P payments.

## Features

- **User Authentication** - Phone number based registration and login
- **Send Money** - Instant transfers using phone numbers
- **Receive Money** - Generate QR codes for payment requests
- **Transaction History** - View all past transactions
- **Contacts Integration** - Save frequently used contacts
- **QR Code Scanner** - Scan QR codes for quick payments
- **Wallet Management** - View balance and transaction limits

## Tech Stack

- **React Native 0.72**
- **TypeScript**
- **React Navigation v6**
- **Axios** for API calls
- **React Hook Form** for form management
- **AsyncStorage** for local data persistence
- **React Native Vector Icons**
- **QR Code Scanner/Generator**

## Setup Instructions

### Prerequisites

- Node.js 16+
- React Native CLI
- Android Studio (for Android)
- Xcode (for iOS)

### Installation

1. **Install dependencies**
```bash
cd mobile_app
npm install
```

2. **iOS Setup**
```bash
cd ios
pod install
cd ..
```

3. **Android Setup**
- Open Android Studio
- Create AVD (Android Virtual Device)

4. **Run the app**
```bash
# iOS
npm run ios

# Android
npm run android
```

## Project Structure

```
src/
├── components/          # Reusable UI components
├── context/            # React Context providers
├── navigation/         # Navigation stacks and tabs
├── screens/           # Screen components
│   ├── auth/         # Authentication screens
│   └── main/         # Main app screens
├── services/         # API services
├── utils/           # Utility functions
└── App.tsx         # Root component
```

## Key Screens

### Authentication
- **WelcomeScreen** - App introduction and entry point
- **LoginScreen** - User login with phone and password
- **RegisterScreen** - New user registration

### Main App
- **HomeScreen** - Dashboard with balance and quick actions
- **SendMoneyScreen** - Send money to contacts or phone numbers
- **ReceiveMoneyScreen** - Generate QR codes for receiving payments
- **TransactionsScreen** - Transaction history and details
- **ContactsScreen** - Manage saved contacts
- **ProfileScreen** - User settings and account management

## API Integration

The app connects to the Django backend API:

- **Authentication**: `/api/auth/`
- **Transactions**: `/api/transactions/`
- **Payments**: `/api/payments/`
- **User Management**: `/api/users/`

## Development Notes

1. **Environment Setup**
   - Update API base URL in `src/services/api.ts`
   - Configure proper backend connection

2. **Platform Differences**
   - iOS requires camera permissions for QR scanner
   - Android requires storage permissions for image uploads

3. **Testing**
   - Use iOS Simulator or Android Emulator
   - Test on physical devices for camera features

## Features to Implement

- [ ] Biometric authentication
- [ ] Push notifications
- [ ] Offline transaction caching
- [ ] Multi-currency support
- [ ] Bill payment integration
- [ ] Merchant payment codes