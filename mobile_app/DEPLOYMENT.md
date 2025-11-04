# Flash App Deployment Guide

## Environment Configuration

The Flash app uses a professional environment management system with `react-native-config` for different deployment scenarios.

### Available Environments

1. **Development** - Local development with backend running in Docker
2. **Staging** - Pre-production testing environment
3. **Production** - Live production environment

### Environment Files

- `.env.development` - Development configuration
- `.env.staging` - Staging configuration  
- `.env.production` - Production configuration

### Configuration Variables

| Variable | Description | Development | Staging | Production |
|----------|-------------|-------------|---------|------------|
| `API_URL` | Backend API base URL | `http://localhost:8002/api` | `https://staging-api.flashapp.com/api` | `https://api.flashapp.com/api` |
| `MTN_SANDBOX_MODE` | Use MTN sandbox APIs | `true` | `true` | `false` |
| `DEBUG_MODE` | Enable debug logging | `true` | `true` | `false` |
| `ENVIRONMENT` | Environment identifier | `development` | `staging` | `production` |
| `SENTRY_DSN` | Error tracking endpoint | - | Staging DSN | Production DSN |
| `ANALYTICS_ENABLED` | Enable analytics tracking | `false` | `true` | `true` |

## Development Setup

### Prerequisites

1. **Backend Running**: Ensure Django backend is running at `localhost:8002`
2. **ADB Port Forwarding**: For Android development reliability

### Setup Commands

```bash
# Set up ADB port forwarding (Android only, run once per session)
npm run adb:reverse

# Run development builds
npm run android:dev  # Android development
npm run ios:dev      # iOS development

# Or use default commands (automatically use development environment)
npm run android
npm run ios
```

### Network Configuration

The app automatically handles network configuration:

- **iOS Simulator**: Uses `http://127.0.0.1:8002/api` (direct localhost)
- **Android Emulator**: Uses `http://localhost:8002/api` (via adb port forwarding)

## Staging Deployment

### Backend Setup

1. Deploy backend to staging server (e.g., Heroku, DigitalOcean, AWS)
2. Update `.env.staging` with your staging API URL

### Mobile App Build

```bash
# Build for testing
npm run android:staging  # Android staging build
npm run ios:staging      # iOS staging build

# Build APK for distribution
npm run build:android:staging
```

### Testing

- Share the staging APK with test users
- Monitor logs via Sentry staging environment
- Test with MTN sandbox APIs

## Production Deployment

### Prerequisites

1. **Production Backend**: Backend deployed with production database
2. **Domain Setup**: Production API domain configured
3. **MTN Production Keys**: Live MTN Mobile Money API credentials
4. **App Store Accounts**: iOS App Store and Google Play developer accounts

### Environment Configuration

Update `.env.production` with your production values:

```bash
API_URL=https://api.flashapp.com/api
MTN_SANDBOX_MODE=false
DEBUG_MODE=false
ENVIRONMENT=production
SENTRY_DSN=https://your-production-sentry-dsn@sentry.io/project-id
ANALYTICS_ENABLED=true
```

### Production Builds

#### Android Production Build

```bash
# Build production APK
npm run build:android:prod

# Find APK at: android/app/build/outputs/apk/release/app-release.apk
```

#### iOS Production Build

```bash
# Build for App Store
npm run ios:prod

# Or build through Xcode:
# 1. Open ios/FlashApp.xcworkspace
# 2. Select "Any iOS Device"
# 3. Product > Archive
# 4. Upload to App Store Connect
```

### App Store Submission

#### Google Play Store

1. **Create Play Console Account** ($25 one-time fee)
2. **Upload APK** to Play Console
3. **Fill Store Listing** (app description, screenshots, etc.)
4. **Review Process** (typically 1-3 days)

#### iOS App Store

1. **Apple Developer Account** ($99/year)
2. **App Store Connect** submission
3. **TestFlight Beta** (optional testing phase)
4. **App Review** (typically 1-7 days)

## Environment Switching

### Quick Environment Switching

```bash
# Switch to staging
ln -sf .env.staging .env

# Switch to production  
ln -sf .env.production .env

# Switch back to development
ln -sf .env.development .env
```

### Build-specific Environment

Use the environment-specific scripts:

```bash
# Development
npm run android:dev
npm run ios:dev

# Staging
npm run android:staging
npm run ios:staging

# Production
npm run android:prod
npm run ios:prod
```

## Deployment Checklist

### Pre-Deployment

- [ ] Backend deployed and accessible
- [ ] Environment variables configured
- [ ] MTN API keys (production vs sandbox)
- [ ] Sentry error tracking configured
- [ ] App icons and splash screens ready
- [ ] Store listings prepared

### Android Deployment

- [ ] Signing keystore generated and secure
- [ ] App bundle/APK built with correct environment
- [ ] Tested on multiple Android devices
- [ ] Google Play listing complete
- [ ] Release notes prepared

### iOS Deployment

- [ ] Apple Developer account active
- [ ] App Store Connect app created
- [ ] Build uploaded via Xcode/Transporter
- [ ] App Store listing complete
- [ ] Screenshots for all device sizes

### Post-Deployment

- [ ] Monitor error rates in Sentry
- [ ] Check analytics data
- [ ] Monitor user feedback
- [ ] Performance monitoring active

## Troubleshooting

### Common Issues

1. **Network Connection Failed (Android)**
   ```bash
   # Ensure ADB port forwarding is active
   npm run adb:reverse
   ```

2. **Environment Variables Not Loading**
   ```bash
   # Rebuild app after changing .env files
   # Clean build cache if needed
   cd android && ./gradlew clean && cd ..
   ```

3. **API Endpoints Not Found**
   - Verify backend is deployed and accessible
   - Check environment variable spelling
   - Confirm API base URL format

### Debugging

```bash
# Check current configuration
console.log('Config:', Config);

# Verify API URL in app
console.log('API Base URL:', config.API_BASE_URL);
```

## Security Considerations

### Environment Variables

- Never commit `.env.production` with sensitive data to version control
- Use different API keys for staging vs production
- Rotate API keys regularly

### App Store Security

- Use proper code signing certificates
- Enable app transport security (ATS)
- Implement certificate pinning for production

## Monitoring and Analytics

### Error Tracking

- **Sentry**: Real-time error monitoring
- **Crashlytics**: Crash reporting (Firebase)

### User Analytics

- **Firebase Analytics**: User behavior tracking
- **Mixpanel**: Advanced user analytics

### Performance Monitoring

- **Flipper**: Development debugging
- **Performance Monitor**: Production metrics

## Support and Maintenance

### Regular Updates

1. **Security Updates**: Monthly dependency updates
2. **Feature Releases**: Quarterly major releases
3. **Bug Fixes**: Immediate critical fixes

### User Support

- In-app support chat
- Email support system
- FAQ and documentation
- Social media monitoring

---

This deployment system provides a professional, scalable approach to managing different environments while maintaining security and reliability for your Flash payment app.