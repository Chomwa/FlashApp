# Flash Mobile App Installation Guide

## Issue Resolution: Dependency Conflicts

The original package.json had dependency conflicts. Here are several solutions:

## Option 1: Use Updated package.json (Recommended)

The package.json has been updated to use compatible versions:
- `react-native-svg`: Updated to `^14.1.0` 
- `react-native-qrcode-svg`: Updated to `^6.3.0`
- Removed problematic optional dependencies for initial setup

```bash
cd mobile_app
npm install --legacy-peer-deps
```

## Option 2: Use Minimal Dependencies

If you continue having issues, use the minimal package.json:

```bash
cd mobile_app
cp package-minimal.json package.json
npm install
```

## Option 3: Force Installation

If peer dependency conflicts persist:

```bash
cd mobile_app
rm -rf node_modules package-lock.json
npm cache clean --force
npm install --force
```

## Option 4: Use Automated Setup Script

Run the automated setup script:

```bash
cd mobile_app
chmod +x setup-mobile.sh
./setup-mobile.sh
```

## Verification Steps

After successful installation:

1. **Check installation**:
```bash
npm list --depth=0
```

2. **Start Metro bundler**:
```bash
npm start
```

3. **Run on iOS** (requires Xcode):
```bash
npm run ios
```

4. **Run on Android** (requires Android Studio):
```bash
npm run android
```

## Common Issues and Solutions

### Issue: Metro bundler won't start
**Solution**: Clear Metro cache
```bash
npm start -- --reset-cache
```

### Issue: iOS build fails
**Solution**: Clean and rebuild
```bash
cd ios
pod install --repo-update
cd ..
npm run ios
```

### Issue: Android build fails
**Solution**: Clean gradle
```bash
cd android
./gradlew clean
cd ..
npm run android
```

### Issue: Cannot resolve module errors
**Solution**: Reset React Native cache
```bash
npx react-native start --reset-cache
```

## Optional Dependencies (Add Later)

Once the basic app is running, you can add these optional features:

```bash
# QR Code functionality
npm install react-native-qrcode-svg react-native-svg

# Camera and permissions
npm install react-native-camera react-native-permissions

# Secure storage
npm install react-native-keychain

# Contact access
npm install react-native-contacts

# Image picker
npm install react-native-image-picker

# Biometrics
npm install react-native-biometrics
```

## Environment Requirements

- **Node.js**: 16.0 or higher
- **npm**: 7.0 or higher  
- **React Native CLI**: Latest version
- **Xcode**: 12.0+ (for iOS)
- **Android Studio**: Latest (for Android)

## Backend Connection

Make sure your backend is running:
```bash
# In the root FlashApp directory
docker-compose up -d
```

The mobile app connects to: `http://localhost:8002/api`

## Success Verification

1. Backend API accessible at: http://localhost:8002/api/docs/
2. Mobile app starts without errors
3. Navigation between screens works
4. API calls to backend successful

If you encounter any issues, start with the minimal package.json and gradually add features once the basic app is working.