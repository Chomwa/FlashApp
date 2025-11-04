# Flash Payment App 🚀

A comprehensive payment orchestration platform similar to Swish, featuring instant P2P money transfers through mobile money providers. Flash acts as a technology layer that orchestrates payments between users' existing mobile money wallets, without holding or processing any money directly. Built with Django REST API backend and React Native frontend.

<div align="center">

![Flash Logo](https://img.shields.io/badge/Flash-Payment%20App-blue?style=for-the-badge&logo=lightning&logoColor=white)

[![Django](https://img.shields.io/badge/Django-4.2-green?style=flat&logo=django)](https://djangoproject.com/)
[![React Native](https://img.shields.io/badge/React%20Native-0.72-blue?style=flat&logo=react)](https://reactnative.dev/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue?style=flat&logo=postgresql)](https://postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-Enabled-blue?style=flat&logo=docker)](https://docker.com/)

</div>

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Technology Stack](#technology-stack)
- [Installation](#installation)
- [API Documentation](#api-documentation)
- [Mobile App Guide](#mobile-app-guide)
- [Development](#development)
- [Testing](#testing)
- [Deployment](#deployment)
- [Security](#security)
- [Contributing](#contributing)
- [License](#license)

## 🎉 Current Status

**✅ FULLY FUNCTIONAL** - Flash payment app is successfully deployed and running!

- **Backend**: Django API running on Docker ✅
- **Mobile App**: React Native CLI with iOS and Android working ✅  
- **Database**: PostgreSQL with complete schema ✅
- **API Integration**: MTN Mobile Money connected ✅
- **Authentication**: User registration/login working ✅
- **iOS Build**: Native iOS app successfully running ✅
- **Android Build**: Production-ready signed APK available ✅

**Quick Test**: 
- iOS: `docker-compose up -d && cd mobile_app && npm run ios`
- Android: `docker-compose up -d && cd mobile_app && npm run android`

## 🌟 Overview

Flash is a modern mobile payment application that enables users to send and receive money instantly using just a phone number. Inspired by Sweden's Swish, Flash provides a seamless payment experience with robust security features and real-time transaction processing.

### Key Capabilities
- **Payment Orchestration** - Routes payments through the best available mobile money provider
- **Instant P2P Transfers** - Send money in seconds using phone numbers via USSD approval
- **QR Code Payments** - Generate and scan QR codes for quick payment requests
- **Multi-Provider Support** - MTN, Airtel, Zamtel integration with automatic provider detection
- **Real-time Status Tracking** - Monitor payment progress from request to completion
- **No Money Handling** - Pure technology layer - money flows directly between user wallets
- **Contact Integration** - Send to contacts or manually enter phone numbers
- **Transaction History** - Complete audit trail of all orchestrated payments

## ✨ Features

### 🔐 Authentication & Security
- **Phone-based Registration** - Simple onboarding with phone verification
- **Token Authentication** - Secure API access with JWT-like tokens
- **Transaction Limits** - Daily spending limits for fraud prevention
- **PIN Protection** - Additional security for transactions (planned)
- **Biometric Auth** - Fingerprint/Face ID support (planned)

### 🔄 Payment Orchestration
- **Provider Routing** - Automatically selects best payment provider based on phone number
- **Real-time Status** - Track payment status from initiation to completion
- **USSD Integration** - Users approve payments directly on their mobile money app
- **Multi-Provider Support** - Support for MTN, Airtel, and other mobile money operators
- **No Escrow** - Money flows directly between users' existing mobile money wallets

### 📱 Payment Features
- **P2P Transfers** - Send money to any phone number
- **QR Code Payments** - Generate payment QR codes
- **Contact Integration** - Send to saved contacts
- **Payment Requests** - Request money from others
- **Batch Payments** - Send to multiple recipients (planned)
- **Recurring Payments** - Set up automatic payments (planned)

### 🏦 Mobile Money Integration
- **MTN Mobile Money** - Direct integration with MTN Collections & Disbursement APIs
- **Airtel Money** - Integration support (planned)
- **Zamtel Kwacha** - Integration support (planned)
- **Real-time Processing** - Instant payment request delivery
- **USSD Approval Flow** - Users approve payments on their mobile money app
- **Status Tracking** - Monitor payment progress from pending to completed
- **Webhook Support** - Real-time status updates from providers
- **Graceful Fallbacks** - Handle provider downtime and failures

### 📊 Analytics & Reporting
- **Transaction History** - Complete payment records
- **Spending Analytics** - Track spending patterns
- **Export Features** - Download transaction reports
- **Real-time Dashboard** - Live transaction monitoring

## 🏗️ Architecture

### Payment Orchestration Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Mobile App    │    │   Flash Backend │    │   Payment       │
│  (React Native) │◄──►│  (Orchestrator) │◄──►│   Providers     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
        │                       │                        │
        │              ┌─────────────────┐    ┌─────────────────┐
        │              │   PostgreSQL    │    │  MTN Collections│
        │              │   (Tracking)    │    │     API         │
        │              └─────────────────┘    └─────────────────┘
        │                                              │
        │                                   ┌─────────────────┐
        └───────────USSD Approval──────────►│ User's Mobile   │
                                            │ Money Wallet    │
                                            └─────────────────┘
```

### How Flash Works (Payment Orchestration)

```
1. User A selects contact/phone number in Flash app
2. User A enters amount and message
3. User A clicks "Flash" button
4. Flash Backend determines optimal provider (MTN/Airtel)
5. Flash sends Request-to-Pay to provider API
6. Provider sends USSD prompt to User A's phone
7. User A enters PIN on mobile money USSD menu
8. Provider transfers money directly: User A wallet → User B wallet
9. Flash receives status update and notifies both users
10. Transaction complete - money never touched Flash
```

### Backend Components
- **Django REST API** - Core application logic
- **PostgreSQL** - Primary database for user data and transactions
- **Redis** - Caching and session management
- **Celery** - Background task processing
- **Docker** - Containerization and deployment

### Frontend Components
- **React Native** - Cross-platform mobile application
- **TypeScript** - Type-safe development
- **React Navigation** - App navigation management
- **AsyncStorage** - Local data persistence
- **Context API** - State management

## 🛠️ Technology Stack

### Backend Technologies
| Technology | Version | Purpose |
|------------|---------|---------|
| Django | 4.2.7 | Web framework |
| Django REST Framework | 3.14.0 | API framework |
| PostgreSQL | 15 | Primary database |
| Redis | 7-alpine | Caching & sessions |
| Celery | 5.3.4 | Background tasks |
| Docker | Latest | Containerization |
| Python | 3.11 | Programming language |

### Frontend Technologies
| Technology | Version | Purpose |
|------------|---------|---------|
| React Native | 0.72.6 | Mobile framework |
| TypeScript | 4.8.4 | Type safety |
| React Navigation | 6.x | Navigation |
| Axios | 1.5.0 | HTTP client |
| AsyncStorage | 1.19.3 | Local storage |
| React Hook Form | 7.45.4 | Form management |

### Development Tools
| Tool | Purpose |
|------|---------|
| ESLint | Code linting |
| Prettier | Code formatting |
| Jest | Testing framework |
| Swagger/OpenAPI | API documentation |
| Docker Compose | Development environment |

## 🚀 Installation

### Prerequisites

Ensure you have the following installed:

- **Docker & Docker Compose** (v20.0+)
- **Node.js** (v16.0+) and npm
- **React Native CLI**
- **Git** for version control

**For iOS Development:**
- **Xcode 15.0+** (macOS only)
- **iOS Simulator**
- **CocoaPods** (`sudo gem install cocoapods`)

**For Android Development:**
- **Java JDK 17** 
- **Android Studio** with Android SDK
- **Android SDK Command Line Tools**
- **Android SDK Platform 34**
- **Android NDK 23.1.7779620**

### Quick Start

1. **Clone the Repository**
```bash
git clone https://github.com/your-org/FlashApp.git
cd FlashApp
```

2. **Start Backend Services**
```bash
docker-compose up -d
```

3. **Setup Mobile App**
```bash
cd mobile_app
npm install
```

4. **Run iOS App (Recommended for Development)**
```bash
# Install iOS dependencies
cd ios && pod install && cd ..

# Run on iOS simulator
npm run ios
```

5. **Run Android App**
```bash
# Prerequisites: Android Studio, Java JDK 17, Android SDK
# Set ANDROID_HOME environment variable

# Run on Android emulator/device
npm run android
```

**Alternative: Expo Development**
```bash
# For Expo development workflow
npx expo start
# Download Expo Go app and scan QR code
```

### Manual Installation

#### Backend Setup

1. **Start Services**
```bash
docker-compose up -d
```

2. **Run Migrations**
```bash
docker-compose exec backend python manage.py migrate
```

3. **Create Superuser**
```bash
docker-compose exec backend python manage.py createsuperuser
```

4. **Load Sample Data** (Optional)
```bash
docker-compose exec backend python manage.py loaddata fixtures/sample_data.json
```

#### Mobile App Setup

1. **Install Dependencies**
```bash
cd mobile_app
npm install
```

2. **Setup iOS (Recommended)**
```bash
# Install iOS dependencies
cd ios && pod install && cd ..

# Run on iOS simulator
npm run ios
```

3. **Android Development Setup**
```bash
# Prerequisites for Android development:
# 1. Install Java JDK 17
# 2. Install Android Studio
# 3. Install Android SDK Command Line Tools
# 4. Set environment variables:
export ANDROID_HOME=~/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/tools:$ANDROID_HOME/platform-tools

# Run on Android emulator/device
npm run android
```

4. **Alternative: Expo Development**
```bash
# Expo development workflow
npx expo start
# Then use Expo Go app to scan QR code
```

5. **Additional Development Commands**
```bash
# Start Metro bundler separately
npm start

# Reset Metro cache if needed
npm start -- --reset-cache

# Clean builds if needed
# iOS
cd ios && xcodebuild clean && cd ..

# Android  
cd android && ./gradlew clean && cd ..
```

### Environment Configuration

Create `.env` file in the backend directory:

```bash
# Backend Configuration
DEBUG=True
SECRET_KEY=your-secret-key-here
DATABASE_URL=postgresql://flashuser:flashpass@db:5432/flashdb
REDIS_URL=redis://redis:6379/0

# MTN Mobile Money Configuration
MTN_DISBURSEMENT_PRIMARY_KEY=your-mtn-disbursement-key
MTN_COLLECTIONS_PRIMARY_KEY=your-mtn-collections-key
MTN_USER_ID=your-mtn-user-id
MTN_API_KEY=your-mtn-api-key
MTN_HOST_NAME=sandbox.momodeveloper.mtn.com

# Email Configuration (Optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
```

## 📚 API Documentation

### Base URL
- **Development**: `http://localhost:8002/api`
- **Production**: `https://your-domain.com/api`

### Interactive Documentation
- **Swagger UI**: `http://localhost:8002/api/docs/`
- **ReDoc**: `http://localhost:8002/api/redoc/`
- **Admin Panel**: `http://localhost:8002/admin/`

### Authentication

All API endpoints require authentication except registration and login.

**Authorization Header:**
```
Authorization: Token your-auth-token-here
```

### Core Endpoints

#### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register/` | Register new user |
| POST | `/auth/login/` | User login |
| POST | `/auth/logout/` | User logout |
| GET | `/auth/me/` | Current user info |

**Register User:**
```bash
curl -X POST http://localhost:8002/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "phone_number": "+256700000001",
    "password": "securepass123",
    "password_confirm": "securepass123",
    "full_name": "John Doe"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:8002/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "phone_number": "+256700000001",
    "password": "securepass123"
  }'
```

#### Transaction Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/transactions/wallet/` | Get user wallet |
| POST | `/transactions/send/` | Send money |
| POST | `/transactions/request/` | Request money |
| GET | `/transactions/transactions/` | Transaction history |
| GET | `/transactions/transactions/{id}/` | Transaction details |

**Send Money:**
```bash
curl -X POST http://localhost:8002/api/transactions/send/ \
  -H "Authorization: Token your-token" \
  -H "Content-Type: application/json" \
  -d '{
    "recipient_phone": "+256700000002",
    "amount": "50000",
    "description": "Lunch payment"
  }'
```

**Get Wallet:**
```bash
curl -H "Authorization: Token your-token" \
  http://localhost:8002/api/transactions/wallet/
```

#### Payment Provider Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/payments/mtn/balance/` | MTN account balance |
| POST | `/payments/mtn/send/` | Send via MTN |
| POST | `/payments/mtn/receive/` | Receive via MTN |
| GET | `/payments/mtn/status/{id}/` | Check payment status |

### Response Formats

**Success Response:**
```json
{
  "status": "success",
  "data": {
    "id": 1,
    "amount": "50000.00",
    "currency": "UGX",
    "status": "completed"
  },
  "message": "Transaction completed successfully"
}
```

**Error Response:**
```json
{
  "status": "error",
  "errors": {
    "amount": ["This field is required."],
    "recipient_phone": ["Invalid phone number format."]
  },
  "message": "Validation failed"
}
```

## 📱 Mobile App Guide

### End-to-End User Experience

**Complete Payment Flow:**
1. **Contact Selection** - User picks from contacts or enters phone number manually
2. **Amount & Message** - User enters amount in local currency and optional message  
3. **Include Viral Cards** - User can add fun emoji cards to make payments social
4. **Click "Flash"** - Initiates payment orchestration through Flash backend
5. **Provider Detection** - Flash automatically detects best provider (MTN/Airtel)
6. **USSD Prompt** - User receives mobile money prompt on their phone
7. **PIN Entry** - User enters mobile money PIN to approve payment
8. **Direct Transfer** - Money moves directly from sender's wallet to recipient's wallet
9. **Success Confirmation** - Both users see payment completion in Flash app
10. **Transaction History** - Payment appears in both users' Flash transaction history

### App Structure

```
src/
├── components/          # Reusable UI components
│   ├── forms/          # Form components
│   ├── ui/             # Basic UI elements (Button, Card, etc.)
│   └── common/         # Common components
├── context/            # React Context providers
│   ├── AuthContext.tsx # Authentication state
│   └── PaymentContext.tsx # Payment orchestration state
├── navigation/         # App navigation
│   ├── AuthStack.tsx   # Authentication screens
│   └── MainStack.tsx   # Main app screens
├── screens/           # Screen components
│   ├── auth/          # Login, Register, Welcome
│   ├── main/          # SendMoney, Approval, Receipt, etc.
│   └── transactions/  # Transaction history and details
├── services/         # API and external services
│   ├── api.ts        # Flash backend API client
│   └── storage.ts    # Local storage for tokens
└── utils/           # Utility functions
    ├── validation.ts # Phone number and amount validation
    └── formatting.ts # Currency and date formatting
```

### Key Screens

#### Authentication Flow
1. **WelcomeScreen** - App introduction and entry point
2. **RegisterScreen** - New user registration with phone number
3. **LoginScreen** - User authentication with phone + password
4. **ForgotPasswordScreen** - Password reset

#### Payment Orchestration Flow
1. **HomeScreen** - Dashboard with quick actions and recent transactions
2. **SendMoneyScreen** - Complete payment flow:
   - Contact picker with search functionality
   - Amount entry with currency formatting
   - Message and viral card selection
   - "Flash" button to initiate payment
3. **ApprovalScreen** - Payment status tracking:
   - "Waiting for approval" with loading animation
   - "Open Mobile Money App" helper button
   - Real-time status updates from provider
   - Success/failure confirmation
4. **ReceiptScreen** - Transaction completion details
5. **TransactionsScreen** - Complete payment history with status tracking
6. **ProfileScreen** - User settings and account management

### Navigation Structure

```
AuthStack (if not logged in)
├── Welcome
├── Login
├── Register
└── ForgotPassword

MainStack (if logged in)
├── MainTabs
│   ├── Home
│   ├── Transactions
│   ├── Contacts
│   └── Profile
├── SendMoney
├── ReceiveMoney
├── QRScanner
└── TransactionDetails
```

### State Management

The app uses React Context for state management:

```typescript
// AuthContext
interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (phone: string, password: string) => Promise<void>;
  register: (phone: string, password: string, fullName: string) => Promise<void>;
  logout: () => Promise<void>;
}

// WalletContext (planned)
interface WalletContextType {
  balance: string;
  currency: string;
  transactions: Transaction[];
  refreshWallet: () => Promise<void>;
}
```

### Building and Running

#### Development

**React Native CLI (Recommended)**
```bash
# Start Metro bundler
npm start

# Run on iOS simulator (requires Xcode)
npm run ios

# Run on Android emulator (requires Android Studio)
npm run android

# Run on specific iOS device
npm run ios -- --device="iPhone 15 Pro"

# Run on specific Android device
npm run android -- --deviceId=DEVICE_ID
```

**Alternative: Expo Development**
```bash
# Start Expo development server
npx expo start

# In Expo terminal:
# Press 'w' - open web browser
# Press 'i' - open iOS simulator  
# Press 'a' - open Android emulator
# Scan QR with Expo Go app on phone
```

#### iOS Development Requirements

**Prerequisites for iOS:**
- **Xcode 15.0+** (required for iOS development)
- **iOS 13.0+** deployment target
- **CocoaPods** for dependency management
- **React Native CLI** for native development

**iOS Setup:**
```bash
# Install dependencies
cd mobile_app
npm install

# Install iOS dependencies
cd ios
pod install
cd ..

# Run on iOS simulator
npm run ios

# Clean iOS build if needed
npm run ios -- --reset-cache
cd ios && xcodebuild clean && cd ..
```

**Troubleshooting iOS:**
- If you encounter build errors, try cleaning: `cd ios && pod deintegrate && pod install`
- For Xcode 17.4+ compatibility issues, ensure all pods are updated
- Metro bundler must be running for app to load properly
- Check iOS Simulator is properly installed and running

#### Production Build

**Android APK Build (For Distribution)**
```bash
# Prerequisites: Android Development Environment
# - Java JDK 17
# - Android SDK Command Line Tools
# - Android SDK Platform 34
# - Android NDK 23.1.7779620

# Setup Android environment (macOS)
export ANDROID_HOME=~/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/tools:$ANDROID_HOME/platform-tools

# Navigate to mobile app directory
cd mobile_app

# Install dependencies
npm install

# Clean previous builds
cd android && ./gradlew clean && cd ..

# Generate release keystore (first time only)
keytool -genkey -v -keystore android/app/flash-release-key.keystore \
  -alias flash-key-alias -keyalg RSA -keysize 2048 -validity 10000

# Build signed release APK
cd android && ./gradlew assembleRelease

# Find APK at:
# android/app/build/outputs/apk/release/app-release.apk (~23MB)
```

**iOS Production Build**
```bash
# iOS requires Xcode and Apple Developer account
cd mobile_app

# Install dependencies
npm install
cd ios && pod install && cd ..

# Build for release
npm run ios --configuration=Release

# For App Store submission, use Xcode:
# - Open ios/FlashApp.xcworkspace in Xcode
# - Select "Any iOS Device" as target
# - Product > Archive
# - Upload to App Store Connect
```

**Alternative: Expo EAS Build**
```bash
# Install EAS CLI
npm install -g @expo/eas-cli

# Configure build
eas build:configure

# Build for iOS
eas build --platform ios

# Build for Android
eas build --platform android

# Submit to app stores
eas submit --platform ios
eas submit --platform android
```

**Development Build Commands**
```bash
# iOS development
npm run ios

# Android development  
npm run android

# Start Metro bundler only
npm start

# Reset Metro cache
npm start -- --reset-cache
```

## 🧪 Testing

### Backend Testing

#### Unit Tests
```bash
# Run all tests
docker-compose exec backend python manage.py test

# Run specific app tests
docker-compose exec backend python manage.py test users
docker-compose exec backend python manage.py test transactions

# Run with coverage
docker-compose exec backend coverage run --source='.' manage.py test
docker-compose exec backend coverage report
```

#### API Testing
```bash
# Test user registration
curl -X POST http://localhost:8002/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "phone_number": "+256700000003",
    "password": "testpass123",
    "password_confirm": "testpass123",
    "full_name": "Test User"
  }'

# Test authentication
curl -X POST http://localhost:8002/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "phone_number": "+256700000003",
    "password": "testpass123"
  }'

# Test wallet access
curl -H "Authorization: Token YOUR_TOKEN" \
  http://localhost:8002/api/transactions/wallet/
```

### Mobile App Testing

#### Live Testing with Expo
```bash
# Start development server
npx expo start

# Test on real device with Expo Go app
# Scan QR code with your phone

# Test in web browser
# Press 'w' in Expo terminal

# Test in simulators
# Press 'i' for iOS or 'a' for Android
```

#### Unit Tests
```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

#### E2E Testing
```bash
# Install Detox (iOS)
npm install -g detox-cli
detox build --configuration ios
detox test --configuration ios

# Android
detox build --configuration android
detox test --configuration android
```

### Load Testing

Use Artillery.js for load testing:

```bash
# Install Artillery
npm install -g artillery

# Run load test
artillery run tests/load/api-load-test.yml
```

### Manual Testing Checklist

#### User Registration Flow
- [ ] User can register with valid Zambian phone number (+260)
- [ ] Password validation works correctly
- [ ] User receives authentication token
- [ ] User profile is created with wallet

#### Authentication Flow
- [ ] User can login with correct credentials
- [ ] Invalid credentials are rejected
- [ ] Token expires after logout
- [ ] Auto-login works with stored token

#### Payment Orchestration Flow
- [ ] User can select contacts or enter phone number manually
- [ ] Provider detection works (MTN Zambia: +26097, +26076)
- [ ] Amount entry validates properly
- [ ] "Flash" button initiates payment through backend
- [ ] Payment router selects correct provider
- [ ] MTN Collections API receives Request-to-Pay
- [ ] User receives USSD prompt on their mobile phone
- [ ] User can approve payment with mobile money PIN
- [ ] Payment status updates in real-time
- [ ] Success confirmation shows in app
- [ ] Transaction appears in both users' history
- [ ] Money transfers directly between mobile money wallets

#### Payment Request Flow
- [ ] QR code generates correctly with payment request data
- [ ] QR code contains valid Flash payment information
- [ ] Payment requests expire after set time
- [ ] Recipient can scan and pay via QR code

#### Provider Integration
- [ ] MTN Collections API integration working
- [ ] Sandbox environment properly configured
- [ ] Real USSD prompts delivered to test phones
- [ ] Status tracking from pending → successful/failed
- [ ] Error handling for declined payments
- [ ] Webhook support for real-time updates (optional)

## 🚀 Development

### Backend Development

#### Project Structure
```
backend/
├── config/              # Django project settings
│   ├── settings.py      # Main settings
│   ├── urls.py          # URL routing
│   ├── wsgi.py          # WSGI configuration
│   └── celery.py        # Celery configuration
├── users/               # User management app
│   ├── models.py        # User models
│   ├── views.py         # API views
│   ├── serializers.py   # Data serialization
│   └── urls.py          # URL patterns
├── transactions/        # Transaction management
│   ├── models.py        # Transaction models
│   ├── views.py         # Transaction views
│   ├── serializers.py   # Transaction serializers
│   └── managers.py      # Custom managers
├── payments/            # Payment provider integration
│   ├── views.py         # Payment API views
│   └── urls.py          # Payment URLs
└── shared/              # Shared utilities
    └── mtn/             # MTN integration
```

#### Adding New Features

1. **Create New App**
```bash
docker-compose exec backend python manage.py startapp newapp
```

2. **Add to INSTALLED_APPS**
```python
# config/settings.py
INSTALLED_APPS = [
    # ... existing apps
    'newapp.apps.NewappConfig',
]
```

3. **Create Models**
```python
# newapp/models.py
from django.db import models

class NewModel(models.Model):
    name = models.CharField(max_length=200)
    created_at = models.DateTimeField(auto_now_add=True)
```

4. **Create and Run Migrations**
```bash
docker-compose exec backend python manage.py makemigrations newapp
docker-compose exec backend python manage.py migrate
```

#### Database Operations

```bash
# Access PostgreSQL
docker-compose exec db psql -U flashuser -d flashdb

# Create database backup
docker-compose exec db pg_dump -U flashuser flashdb > backup.sql

# Restore database
docker-compose exec -T db psql -U flashuser flashdb < backup.sql

# Reset database
docker-compose exec backend python manage.py flush
```

#### Debugging

```bash
# View logs
docker-compose logs -f backend

# Access Django shell
docker-compose exec backend python manage.py shell

# Debug with pdb
# Add this line in your code: import pdb; pdb.set_trace()
docker-compose exec backend python manage.py runserver
```

### Frontend Development

#### Component Development

Create reusable components:

```typescript
// src/components/ui/Button.tsx
import React from 'react';
import {TouchableOpacity, Text, StyleSheet} from 'react-native';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        styles[variant],
        disabled && styles.disabled,
      ]}
      onPress={onPress}
      disabled={disabled}>
      <Text style={[styles.text, styles[`${variant}Text`]]}>{title}</Text>
    </TouchableOpacity>
  );
};
```

#### State Management Patterns

```typescript
// Context pattern for global state
export const useWallet = () => {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [loading, setLoading] = useState(false);

  const refreshWallet = useCallback(async () => {
    setLoading(true);
    try {
      const walletData = await transactionsAPI.getWallet();
      setWallet(walletData);
    } catch (error) {
      console.error('Failed to refresh wallet:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  return {wallet, loading, refreshWallet};
};
```

#### Performance Optimization

```typescript
// Use React.memo for expensive components
export const TransactionList = React.memo<TransactionListProps>(
  ({transactions}) => {
    return (
      <FlatList
        data={transactions}
        renderItem={renderTransaction}
        keyExtractor={(item) => item.id}
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        windowSize={10}
      />
    );
  }
);

// Use useMemo for expensive calculations
const sortedTransactions = useMemo(() => {
  return transactions.sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}, [transactions]);
```

## 🛡️ Security

### Payment Orchestration Security

#### No Money Handling
- **Zero Financial Risk** - Flash never holds or processes user money
- **No Banking License Required** - Pure technology orchestration platform
- **Direct Provider Integration** - Money flows directly between user wallets via MTN/Airtel
- **Reduced Compliance Burden** - No money transmission regulations

#### Authentication Security
- **Token-based Authentication** - Secure API access
- **Password Hashing** - Using Django's built-in PBKDF2
- **Token Expiration** - Configurable token lifetime
- **Rate Limiting** - Prevent brute force attacks
- **Phone-based Identity** - Uses mobile number as primary identifier

#### API Security
```python
# Rate limiting configuration
REST_FRAMEWORK = {
    'DEFAULT_THROTTLE_CLASSES': [
        'rest_framework.throttling.AnonRateThrottle',
        'rest_framework.throttling.UserRateThrottle'
    ],
    'DEFAULT_THROTTLE_RATES': {
        'anon': '100/hour',
        'user': '1000/hour',
        'login': '5/minute',
    }
}
```

#### Database Security
- **Connection Encryption** - SSL/TLS for database connections
- **Input Validation** - Django ORM prevents SQL injection
- **Data Encryption** - Sensitive data encryption at rest
- **Backup Encryption** - Encrypted database backups

### Mobile App Security

#### Data Protection
```typescript
// Secure storage for sensitive data
import {Keychain} from 'react-native-keychain';

class SecureStorage {
  static async setToken(token: string) {
    await Keychain.setInternetCredentials('flash_auth', 'user', token);
  }

  static async getToken(): Promise<string | null> {
    try {
      const credentials = await Keychain.getInternetCredentials('flash_auth');
      return credentials ? credentials.password : null;
    } catch (error) {
      return null;
    }
  }
}
```

#### Network Security
- **Certificate Pinning** - Prevent man-in-the-middle attacks
- **Request Signing** - HMAC signatures for sensitive requests
- **TLS 1.3** - Latest encryption standards

### Mobile Money Provider Security

#### MTN Collections API Security
```python
class MTNSecurityMixin:
    def create_secure_headers(self, token: str, reference_id: str) -> dict:
        """Create secure headers for MTN API requests"""
        return {
            'Authorization': f'Bearer {token}',
            'X-Reference-Id': reference_id,
            'X-Target-Environment': 'sandbox',  # or 'production'
            'Ocp-Apim-Subscription-Key': self.subscription_key,
            'Content-Type': 'application/json'
        }
```

#### Provider Integration Security
- **OAuth 2.0** - Secure authentication with mobile money providers
- **Request Signing** - HMAC signatures for sensitive API calls
- **Reference ID Tracking** - UUID-based transaction correlation
- **Webhook Verification** - Signed webhooks for status updates
- **Environment Isolation** - Separate sandbox and production configurations

#### Compliance & Risk Management
- **Reduced PCI Scope** - No card data processing (mobile money only)
- **GDPR Compliance** - Data protection regulation compliance
- **Provider KYC/AML** - Relies on mobile money operator compliance
- **Transaction Monitoring** - Audit trails for all orchestrated payments
- **No Financial Liability** - Risk remains with mobile money providers

## 🚢 Deployment

### Production Environment

#### Docker Production Setup

```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  backend:
    build: ./backend
    environment:
      - DEBUG=False
      - ALLOWED_HOSTS=yourdomain.com
    deploy:
      replicas: 3
      resources:
        limits:
          memory: 512M
        reservations:
          memory: 256M

  db:
    image: postgres:15
    environment:
      - POSTGRES_DB=flashdb_prod
    volumes:
      - prod_postgres_data:/var/lib/postgresql/data/

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
```

#### Cloud Deployment

**AWS Deployment:**
```bash
# Install AWS CLI and configure
pip install awscli
aws configure

# Deploy with ECS
aws ecs create-cluster --cluster-name flash-production
aws ecs register-task-definition --cli-input-json file://task-definition.json
```

**Heroku Deployment:**
```bash
# Install Heroku CLI
heroku create flash-payment-app
heroku addons:create heroku-postgresql:standard-0
heroku config:set DEBUG=False
git push heroku main
```

#### Mobile App Deployment

**iOS App Store:**
```bash
# Build release version
npm run build:ios:release

# Upload to App Store Connect
# Use Xcode or Transporter app
```

**Google Play Store:**
```bash
# Build signed APK
cd android
./gradlew assembleRelease

# Upload to Google Play Console
```

### Environment Configuration

#### Production Settings
```python
# config/settings/production.py
from .base import *

DEBUG = False
ALLOWED_HOSTS = ['yourdomain.com', 'api.yourdomain.com']

# Database
DATABASES = {
    'default': dj_database_url.config(
        default=os.environ.get('DATABASE_URL')
    )
}

# Security
SECURE_SSL_REDIRECT = True
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True

# Static files
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'
```

#### Monitoring and Logging

```python
# Sentry integration
import sentry_sdk
from sentry_sdk.integrations.django import DjangoIntegration

sentry_sdk.init(
    dsn=os.environ.get('SENTRY_DSN'),
    integrations=[DjangoIntegration()],
    traces_sample_rate=1.0,
)

# Logging configuration
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'file': {
            'level': 'INFO',
            'class': 'logging.FileHandler',
            'filename': '/var/log/flash/django.log',
        },
    },
    'loggers': {
        'django': {
            'handlers': ['file'],
            'level': 'INFO',
            'propagate': True,
        },
    },
}
```

## 🤝 Contributing

We welcome contributions to Flash! Please follow these guidelines:

### Development Process

1. **Fork the Repository**
```bash
git clone https://github.com/your-username/FlashApp.git
cd FlashApp
git remote add upstream https://github.com/original/FlashApp.git
```

2. **Create Feature Branch**
```bash
git checkout -b feature/your-feature-name
```

3. **Make Changes**
- Follow the coding standards
- Add tests for new features
- Update documentation

4. **Test Your Changes**
```bash
# Backend tests
docker-compose exec backend python manage.py test

# Frontend tests
cd mobile_app && npm test
```

5. **Submit Pull Request**
```bash
git push origin feature/your-feature-name
# Create pull request on GitHub
```

### Coding Standards

#### Python/Django
- Follow PEP 8 style guide
- Use type hints where appropriate
- Write docstrings for functions and classes
- Use meaningful variable names

```python
def create_transaction(
    sender: User, 
    recipient_phone: str, 
    amount: Decimal,
    description: Optional[str] = None
) -> Transaction:
    """
    Create a new P2P transaction.
    
    Args:
        sender: User initiating the transaction
        recipient_phone: Phone number of recipient
        amount: Transaction amount
        description: Optional transaction description
        
    Returns:
        Created transaction instance
        
    Raises:
        ValidationError: If transaction data is invalid
    """
    # Implementation here
```

#### TypeScript/React Native
- Use TypeScript for type safety
- Follow React Native best practices
- Use functional components with hooks
- Implement proper error boundaries

```typescript
interface TransactionProps {
  transaction: Transaction;
  onPress?: (transaction: Transaction) => void;
}

export const TransactionItem: React.FC<TransactionProps> = ({
  transaction,
  onPress,
}) => {
  const handlePress = useCallback(() => {
    onPress?.(transaction);
  }, [transaction, onPress]);

  return (
    <TouchableOpacity onPress={handlePress}>
      {/* Component implementation */}
    </TouchableOpacity>
  );
};
```

### Code Review Process

All submissions require review. We use GitHub pull requests for this process.

#### Review Checklist
- [ ] Code follows style guidelines
- [ ] Tests pass and cover new functionality
- [ ] Documentation is updated
- [ ] No breaking changes without version bump
- [ ] Security considerations addressed

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2024 Flash Payment App

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## 📞 Support

### Getting Help

- **Documentation**: Check this README and API docs
- **Issues**: [GitHub Issues](https://github.com/your-org/FlashApp/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-org/FlashApp/discussions)
- **Email**: support@flashapp.com

### Reporting Bugs

When reporting bugs, please include:

1. **Environment details** (OS, versions, etc.)
2. **Steps to reproduce** the issue
3. **Expected behavior** vs actual behavior
4. **Screenshots** or error logs
5. **Additional context** that might help

### Feature Requests

We welcome feature requests! Please:

1. Check if the feature already exists
2. Describe the use case clearly
3. Explain why it would be valuable
4. Consider implementation complexity

---

<div align="center">

**⚡ Flash - Send money at the speed of light! ⚡**

[![GitHub Stars](https://img.shields.io/github/stars/your-org/FlashApp?style=social)](https://github.com/your-org/FlashApp)
[![GitHub Issues](https://img.shields.io/github/issues/your-org/FlashApp)](https://github.com/your-org/FlashApp/issues)
[![GitHub License](https://img.shields.io/github/license/your-org/FlashApp)](LICENSE)

Made with ❤️ by the Flash Team

</div>