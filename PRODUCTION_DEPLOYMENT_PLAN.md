# Flash Production Deployment Plan

## Current Demo Mode Fix ✅

### Issue Fixed: Infinite Transaction Polling
- **Problem**: Transactions stuck in "processing" status forever
- **Solution**: Added auto-completion system with dual approach:

1. **Backend Daemon**: 
   ```bash
   python manage.py demo_complete_transactions --daemon --delay 30
   ```
   - Auto-completes transactions after 30 seconds
   - 90% success rate, 10% failure for realistic testing
   - Runs continuously in background

2. **Frontend Fallback**:
   - ApprovalScreen auto-completes after 45 seconds in demo mode
   - Prevents infinite polling if backend daemon fails

### Demo Mode Status: ✅ FIXED
- No more infinite polling
- Realistic transaction completion timing
- Better user experience in development

---

## Production Environment Setup Plan

### Phase 1: Infrastructure Requirements

#### Backend Hosting Options
1. **Heroku** (Recommended for MVP)
   ```bash
   # Pros: Easy deployment, managed database, auto-scaling
   # Cons: More expensive than VPS
   # Cost: ~$25-50/month for basic setup
   ```

2. **DigitalOcean App Platform**
   ```bash
   # Pros: Good balance of ease and cost
   # Cons: Less mature than Heroku
   # Cost: ~$15-30/month
   ```

3. **AWS/GCP** (Future scaling)
   ```bash
   # Pros: Enterprise-grade, ultimate scalability
   # Cons: Complex setup, higher operational overhead
   # Cost: Variable, starts ~$20/month
   ```

#### Domain and SSL
```bash
# Register domain (recommended)
flash-payments.co.zm    # Zambia TLD
flashpay.zm            # Alternative
sendflash.com          # International fallback

# SSL: Automatically provided by hosting platforms
```

### Phase 2: Backend Deployment

#### Production Environment Variables
```bash
# .env.production (backend)
DEBUG=False
SECRET_KEY=<generate-strong-random-key>
DATABASE_URL=<production-postgresql-url>
REDIS_URL=<production-redis-url>
ALLOWED_HOSTS=api.flash-payments.co.zm,flash-payments.co.zm
SECURE_SSL_REDIRECT=True
CSRF_TRUSTED_ORIGINS=https://api.flash-payments.co.zm

# MTN Production API
MTN_COLLECTIONS_PRIMARY_KEY=<production-key>
MTN_COLLECTIONS_SUB_KEY=<production-key>
MTN_USER_ID=<production-user-id>
MTN_API_KEY=<production-api-key>
MTN_HOST_NAME=momodeveloper.mtn.com
MTN_COLLECTIONS_BASE_URL=https://momodeveloper.mtn.com
MTN_COLLECTIONS_TARGET_ENV=production
```

#### Heroku Deployment Example
```bash
# 1. Create Heroku app
heroku create flash-payments-api

# 2. Add PostgreSQL and Redis
heroku addons:create heroku-postgresql:mini
heroku addons:create heroku-redis:mini

# 3. Set environment variables
heroku config:set DEBUG=False
heroku config:set SECRET_KEY=<random-key>
heroku config:set ALLOWED_HOSTS=flash-payments-api.herokuapp.com

# 4. Deploy
git push heroku main

# 5. Run migrations
heroku run python manage.py migrate
heroku run python manage.py createsuperuser
```

### Phase 3: Mobile App Production Build

#### Update Environment Files
```bash
# mobile_app/.env.production
API_URL=https://flash-payments-api.herokuapp.com/api
MTN_SANDBOX_MODE=false
DEBUG_MODE=false
ENVIRONMENT=production
ANALYTICS_ENABLED=true
SENTRY_DSN=<production-sentry-url>
```

#### Android Production Build
```bash
cd mobile_app

# 1. Update app version
# android/app/build.gradle: versionCode, versionName

# 2. Generate release keystore
keytool -genkey -v -keystore flash-release-key.keystore -alias flash-key -keyalg RSA -keysize 2048 -validity 10000

# 3. Configure signing in android/app/build.gradle
# signingConfigs { release { ... } }

# 4. Build production APK
npm run build:android -- --variant=release

# 5. Output: android/app/build/outputs/apk/release/app-release.apk
```

#### iOS Production Build
```bash
# 1. Update version in ios/FlashApp/Info.plist
# CFBundleShortVersionString, CFBundleVersion

# 2. Configure code signing in Xcode
# Team, Bundle Identifier, Provisioning Profile

# 3. Build for App Store
# Xcode: Product > Archive > Distribute App
```

### Phase 4: Production Checklist

#### Pre-Deployment Testing
- [ ] Test staging environment thoroughly
- [ ] Verify MTN production API integration
- [ ] Load test backend with expected traffic
- [ ] Test mobile app with production backend
- [ ] Verify SSL certificates work
- [ ] Test payment flow end-to-end
- [ ] Check error handling and logging
- [ ] Verify backup and monitoring systems

#### Go-Live Steps
1. **DNS Setup**
   ```bash
   # Point domain to production server
   api.flash-payments.co.zm -> production-ip
   ```

2. **Deploy Backend**
   ```bash
   # Deploy to production server
   # Run migrations
   # Start services (web, celery, redis)
   ```

3. **Release Mobile App**
   ```bash
   # Upload to Google Play Store
   # Upload to Apple App Store
   # Or distribute APK directly for testing
   ```

4. **Monitor and Iterate**
   ```bash
   # Monitor server logs
   # Track app crashes
   # Monitor payment success rates
   # Collect user feedback
   ```

### Phase 5: Post-Launch Operations

#### Monitoring Setup
```bash
# Server monitoring
heroku logs --tail

# Application monitoring  
# Sentry for error tracking
# New Relic for performance monitoring

# Business metrics
# Payment success/failure rates
# User registration rates
# Transaction volumes
```

#### Backup Strategy
```bash
# Database backups
heroku pg:backups:schedule --at '03:00' DATABASE_URL

# Code backups
# Git repository with multiple remotes
# Regular commits to main branch
```

#### Scaling Plan
```bash
# Horizontal scaling triggers:
# - >100 concurrent users
# - >1000 transactions/day
# - Response time >2 seconds

# Vertical scaling:
# Heroku: Upgrade dyno size
# Database: Upgrade plan
# Redis: Upgrade plan
```

---

## Cost Estimation

### Development Phase (Current)
- Domain registration: $15/year
- Development tools: Free
- **Total: ~$15/year**

### MVP Launch (100-1000 users)
- Heroku backend: $25/month
- Database: $9/month  
- Redis: $15/month
- Domain: $15/year
- **Total: ~$50/month**

### Growth Phase (1000-10000 users)
- Heroku production: $50/month
- Database scaling: $50/month
- Redis scaling: $30/month
- Monitoring: $20/month
- **Total: ~$150/month**

### Scale Phase (10000+ users)
- Move to AWS/GCP: $200+/month
- CDN: $20/month
- Advanced monitoring: $50/month
- **Total: $270+/month**

---

## Next Immediate Steps

### This Week
1. ✅ Fix demo mode infinite polling
2. 🔄 Register production domain
3. 🔄 Set up Heroku/DigitalOcean account
4. 🔄 Deploy staging environment

### Next Week  
1. 🔄 MTN production API approval
2. 🔄 Production backend deployment
3. 🔄 Mobile app production builds
4. 🔄 End-to-end testing

### Month 1
1. 🔄 Soft launch with limited users
2. 🔄 Monitor and fix critical issues
3. 🔄 App store submissions
4. 🔄 Marketing and user acquisition

The demo mode infinite polling issue is now resolved with a robust dual-layer solution. Ready to proceed with production infrastructure setup!