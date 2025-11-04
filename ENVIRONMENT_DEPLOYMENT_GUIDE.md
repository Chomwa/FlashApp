# Flash Environment Configuration & Deployment Guide

## Current Environment Setup

Flash has a flexible environment configuration system using `.env` files and `react-native-config`. However, there are **critical production issues** that must be fixed before deployment.

## Environment Files Structure

```
mobile_app/
├── .env                    # Default development config
├── .env.development       # Local development
├── .env.staging          # Staging environment  
├── .env.production       # Production environment
└── src/config/environment.ts  # Configuration logic
```

## Current Configuration Priority

1. **Environment Variables** (`.env` files via `react-native-config`)
2. **Build-time Detection** (`__DEV__` flag)
3. **Platform Fallbacks** (iOS vs Android)

## Environment Configurations

### Development (.env.development)
```bash
API_URL=http://localhost:8002/api
MTN_SANDBOX_MODE=true
DEBUG_MODE=true
ENVIRONMENT=development
```

### Staging (.env.staging)
```bash
API_URL=https://staging-api.flashapp.com/api
MTN_SANDBOX_MODE=true
DEBUG_MODE=true
ENVIRONMENT=staging
```

### Production (.env.production)
```bash
API_URL=https://api.flashapp.com/api     # ⚠️ PLACEHOLDER - WILL BREAK
MTN_SANDBOX_MODE=false
DEBUG_MODE=false
ENVIRONMENT=production
```

## 🚨 Critical Issues That Will Break Production

### 1. Invalid Production Domain
**Problem**: `https://api.flashapp.com/api` is a placeholder domain
**Impact**: ALL API calls will fail in production
**Fix Required**: Replace with actual production API domain

### 2. Android Localhost Issue
**Problem**: Android development uses `localhost:8002`
**Impact**: Works with `adb reverse` but NOT in production builds
**Fix Required**: Ensure `.env.production` overrides this

### 3. Missing Staging Infrastructure
**Problem**: `staging-api.flashapp.com` doesn't exist
**Impact**: Cannot test production-like environment
**Fix Required**: Set up staging server or use different URL

## How to Fix for Production Deployment

### Step 1: Set Up Production Backend
```bash
# Deploy backend to cloud provider (AWS, Heroku, DigitalOcean)
# Example production URLs:
https://flashapp-api.herokuapp.com/api
https://api.flash-payments.co.zm/api
```

### Step 2: Update Production Environment
```bash
# Update .env.production with REAL domain
API_URL=https://your-actual-domain.com/api
MTN_SANDBOX_MODE=false  # Use live MTN APIs
DEBUG_MODE=false
ENVIRONMENT=production
```

### Step 3: Set Up Staging Environment (Recommended)
```bash
# Update .env.staging with staging server
API_URL=https://staging-flashapp-api.herokuapp.com/api
MTN_SANDBOX_MODE=true   # Keep sandbox for testing
DEBUG_MODE=true
ENVIRONMENT=staging
```

## Building for Different Environments

### Development Build
```bash
cd mobile_app
cp .env.development .env
npm run android  # or npm run ios
```

### Staging Build
```bash
cd mobile_app
cp .env.staging .env
npm run build:android -- --variant=staging
```

### Production Build
```bash
cd mobile_app
cp .env.production .env
npm run build:android -- --variant=release
```

## Platform-Specific Considerations

### iOS Development
- Uses `http://127.0.0.1:8002/api` for local backend
- Simulator can reach host machine directly
- Production uses standard HTTPS URLs

### Android Development
- Uses `http://localhost:8002/api` with `adb reverse tcp:8002 tcp:8002`
- Emulator needs port forwarding to reach host
- Production APK uses standard HTTPS URLs

### React Native Network Security
```javascript
// Android: network_security_config.xml might need updates for HTTP in dev
// iOS: Info.plist might need App Transport Security exceptions for HTTP in dev
```

## Backend Environment Variables

The backend also needs environment configuration:

### Development
```bash
DEBUG=True
DATABASE_URL=postgresql://localhost:5432/flashdb
ALLOWED_HOSTS=localhost,127.0.0.1
```

### Production
```bash
DEBUG=False
DATABASE_URL=postgresql://prod-db-url/flashdb
ALLOWED_HOSTS=api.flashapp.com,your-domain.com
SECURE_SSL_REDIRECT=True
```

## Testing Environment Configuration

### Manual Testing
```bash
# 1. Test development environment
cp .env.development .env && npm start

# 2. Test with staging config locally
cp .env.staging .env && npm start
# (Will fail if staging server doesn't exist)

# 3. Test production config locally (dangerous)
cp .env.production .env && npm start
# (Will fail because api.flashapp.com doesn't exist)
```

### Automated Testing
```javascript
// src/config/__tests__/environment.test.ts
import { config } from '../environment';

describe('Environment Configuration', () => {
  test('should have valid API base URL', () => {
    expect(config.API_BASE_URL).toBeDefined();
    expect(config.API_BASE_URL).toMatch(/^https?:\/\//);
  });
  
  test('production should use HTTPS', () => {
    if (config.ENVIRONMENT === 'production') {
      expect(config.API_BASE_URL).toMatch(/^https:\/\//);
    }
  });
});
```

## Deployment Checklist

### Before Production Deployment
- [ ] Set up production backend server
- [ ] Update `.env.production` with real API domain
- [ ] Test staging environment thoroughly
- [ ] Configure SSL certificates for API domain
- [ ] Set up MTN production API credentials
- [ ] Test mobile app with production backend
- [ ] Verify all API endpoints work
- [ ] Test on both iOS and Android physical devices

### Environment Verification Script
```javascript
// Add to src/config/environment.ts
export const validateEnvironment = (): void => {
  console.log('🔍 Environment Configuration Check:');
  console.log(`📍 Environment: ${config.ENVIRONMENT}`);
  console.log(`🌐 API Base URL: ${config.API_BASE_URL}`);
  console.log(`🏦 MTN Sandbox Mode: ${config.MTN_SANDBOX_MODE}`);
  console.log(`🐛 Debug Mode: ${config.DEBUG_MODE}`);
  
  // Validation warnings
  if (config.ENVIRONMENT === 'production' && config.API_BASE_URL.includes('flashapp.com')) {
    console.error('🚨 PRODUCTION ERROR: Using placeholder API domain!');
  }
  
  if (config.ENVIRONMENT === 'production' && config.DEBUG_MODE) {
    console.warn('⚠️ WARNING: Debug mode enabled in production');
  }
  
  if (config.API_BASE_URL.includes('localhost') && config.ENVIRONMENT !== 'development') {
    console.error('🚨 ERROR: Using localhost in non-development environment');
  }
};
```

## Summary

The Flash app has a well-designed environment configuration system, but **will definitely break in production** due to placeholder domains. The main fixes needed are:

1. **Replace placeholder URLs** with real production domains
2. **Set up staging environment** for testing
3. **Add validation checks** to catch configuration errors
4. **Test thoroughly** in staging before production deployment

The configuration system itself is flexible and production-ready once the placeholder URLs are replaced with real infrastructure.