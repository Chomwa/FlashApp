# Flash Payment App - Production Deployment Guide

## 🚀 Quick Deploy to Railway (Recommended)

### 1. Prerequisites
- [Railway Account](https://railway.app) (free tier available)
- Git repository with your code
- MTN Mobile Money API credentials

### 2. Deploy Backend to Railway

```bash
# 1. Install Railway CLI
npm install -g @railway/cli

# 2. Login to Railway
railway login

# 3. Create new Railway project
railway new

# 4. Deploy from backend directory
cd backend
railway up

# 5. Add environment variables in Railway dashboard
railway variables set DEBUG=False
railway variables set SECRET_KEY=your-super-secret-production-key-here
railway variables set MTN_COLLECTIONS_PRIMARY_KEY=your-mtn-key
railway variables set MTN_COLLECTIONS_SUB_KEY=your-mtn-sub-key
railway variables set MTN_USER_ID=your-mtn-user-id
railway variables set MTN_API_KEY=your-mtn-api-key
railway variables set MTN_HOST_NAME=sandbox.momodeveloper.mtn.com
railway variables set PRODUCTION=True
```

### 3. Environment Variables Required

```bash
# Core Django Settings
DEBUG=False
SECRET_KEY=your-super-secret-production-key-minimum-50-characters-long
PRODUCTION=True

# Database (Railway provides automatically)
DATABASE_URL=postgresql://user:pass@host:port/dbname

# Redis (Railway provides automatically)  
REDIS_URL=redis://user:pass@host:port

# MTN Mobile Money API
MTN_COLLECTIONS_PRIMARY_KEY=your-mtn-primary-key
MTN_COLLECTIONS_SUB_KEY=your-mtn-sub-key  
MTN_USER_ID=your-mtn-user-id
MTN_API_KEY=your-mtn-api-key
MTN_HOST_NAME=sandbox.momodeveloper.mtn.com
MTN_COLLECTIONS_BASE_URL=https://sandbox.momodeveloper.mtn.com
MTN_COLLECTIONS_TARGET_ENV=sandbox

# Optional: Error Monitoring
SENTRY_DSN=your-sentry-dsn-url

# Optional: Custom Domain
CUSTOM_DOMAIN=api.yourflashapp.com
```

### 4. Database Setup

Railway automatically provisions PostgreSQL. Run migrations:

```bash
# In Railway dashboard terminal or locally with production DATABASE_URL
python manage.py migrate
python manage.py createsuperuser
```

### 5. Update Mobile App API URL

After Railway deployment, update your mobile app:

```typescript
// mobile_app/src/config/environment.ts
const getApiBaseUrl = (): string => {
  if (!isDevelopment) {
    return 'https://your-railway-app.railway.app/api'; // Update with actual Railway URL
  }
  // ... rest of development code
};
```

## 🔧 Alternative: DigitalOcean App Platform

### 1. Create App Platform Application

```yaml
# .do/app.yaml
name: flash-payment-app
services:
- name: backend
  source_dir: backend
  github:
    repo: your-username/FlashApp
    branch: main
  build_command: pip install -r requirements.txt
  run_command: gunicorn --bind 0.0.0.0:8000 config.wsgi:application
  environment_slug: python
  instance_count: 1
  instance_size_slug: basic-xxs
  envs:
  - key: DEBUG
    value: "False"
  - key: PRODUCTION
    value: "True"
  - key: SECRET_KEY
    value: "your-secret-key"
    type: SECRET

databases:
- name: flash-db
  engine: PG
  version: "15"
  
- name: flash-redis
  engine: REDIS
  version: "7"
```

## 🏗️ Production Checklist

### Backend Security ✅
- [x] Debug mode disabled
- [x] SECRET_KEY randomized
- [x] HTTPS enforced
- [x] Security headers configured
- [x] CORS properly configured
- [x] Database credentials secured

### Performance ✅
- [x] Gunicorn WSGI server
- [x] Static files with WhiteNoise
- [x] Redis for caching
- [x] Database connection pooling
- [x] Celery for background tasks

### Monitoring ✅
- [x] Error tracking with Sentry
- [x] Structured logging
- [x] Health check endpoints
- [x] Database monitoring

### API Security ✅
- [x] Token authentication
- [x] Rate limiting (configure as needed)
- [x] Input validation
- [x] SQL injection prevention

## 📱 Mobile App Production Build

### Android Production Build

```bash
cd mobile_app

# 1. Update API URL in environment.ts
# 2. Generate signed APK
cd android
./gradlew assembleRelease

# 3. Upload to Google Play Store
```

### iOS Production Build

```bash
# 1. Update API URL in environment.ts
# 2. Archive in Xcode
# 3. Upload to App Store Connect
```

## 🔄 CI/CD Setup (Optional)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Railway
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    - uses: actions/setup-node@v3
    - run: npm install -g @railway/cli
    - run: railway up --service backend
      env:
        RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
```

## 📊 Post-Deployment Testing

1. **API Health Check**
   ```bash
   curl https://your-app.railway.app/api/health/
   ```

2. **MTN API Integration Test**
   ```bash
   curl -X POST https://your-app.railway.app/api/payments/mtn/balance/
   ```

3. **Mobile App Connection Test**
   - Test login with production API
   - Test QR code scanning
   - Test payment flow end-to-end

## 💡 Production Tips

1. **Database Backups**: Railway provides automatic backups
2. **Scaling**: Increase instance count during high traffic
3. **Monitoring**: Set up alerts for 5xx errors
4. **Updates**: Use staging environment for testing
5. **Security**: Regularly rotate API keys and secrets

## 🆘 Troubleshooting

### Common Issues

1. **500 Errors**: Check environment variables
2. **Database Connection**: Verify DATABASE_URL
3. **Static Files**: Ensure WhiteNoise is configured
4. **CORS Errors**: Update CORS_ALLOWED_ORIGINS
5. **MTN API**: Verify all MTN credentials

### Useful Commands

```bash
# Railway logs
railway logs

# Database shell
railway run python manage.py dbshell

# Django shell
railway run python manage.py shell

# Run migrations
railway run python manage.py migrate
```

Your Flash Payment App is now production-ready! 🚀