#!/bin/bash

# Flash Payment App - Production Deployment Script
# This script sets up production deployment on Railway

echo "🚀 Flash Payment App - Production Deployment Setup"
echo "=================================================="

# Check prerequisites
echo "📋 Checking prerequisites..."

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found. Installing..."
    npm install -g @railway/cli
    echo "✅ Railway CLI installed"
else
    echo "✅ Railway CLI found: $(railway --version)"
fi

# Check if git is available
if ! command -v git &> /dev/null; then
    echo "❌ Git not found. Please install git."
    exit 1
else
    echo "✅ Git found"
fi

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo "❌ Not in a git repository. Initializing..."
    git init
    git add .
    git commit -m "Initial commit for production deployment"
    echo "✅ Git repository initialized"
else
    echo "✅ Git repository found"
fi

echo ""
echo "🔐 RAILWAY AUTHENTICATION REQUIRED"
echo "================================="
echo "Please follow these steps:"
echo "1. Open your browser and go to: https://railway.app"
echo "2. Sign up or log in to your Railway account"
echo "3. Run the following command to login:"
echo "   railway login"
echo ""
echo "4. Then run the following commands to deploy:"
echo ""
echo "   # Create new Railway project"
echo "   railway new"
echo ""
echo "   # Add PostgreSQL database"
echo "   railway add --database postgresql"
echo ""
echo "   # Add Redis"
echo "   railway add --database redis"
echo ""
echo "   # Deploy the application"
echo "   railway up"
echo ""

echo "🔧 ENVIRONMENT VARIABLES SETUP"
echo "=============================="
echo "After deployment, set these environment variables in Railway dashboard:"
echo ""

# Generate a secure SECRET_KEY
SECRET_KEY=$(python3 -c "import secrets; print(secrets.token_urlsafe(50))")

echo "Core Django Settings:"
echo "---------------------"
echo "DEBUG=False"
echo "SECRET_KEY=$SECRET_KEY"
echo "PRODUCTION=True"
echo ""

echo "MTN Mobile Money API (from your MTN Developer account):"
echo "------------------------------------------------------"
echo "MTN_COLLECTIONS_PRIMARY_KEY=your-mtn-primary-key"
echo "MTN_COLLECTIONS_SUB_KEY=your-mtn-sub-key"
echo "MTN_USER_ID=your-mtn-user-id"
echo "MTN_API_KEY=your-mtn-api-key"
echo "MTN_HOST_NAME=sandbox.momodeveloper.mtn.com"
echo "MTN_COLLECTIONS_BASE_URL=https://sandbox.momodeveloper.mtn.com"
echo "MTN_COLLECTIONS_TARGET_ENV=sandbox"
echo ""

echo "Optional (for error monitoring):"
echo "--------------------------------"
echo "SENTRY_DSN=your-sentry-dsn-url"
echo ""

echo "📱 AFTER DEPLOYMENT"
echo "=================="
echo "1. Note the Railway URL (e.g., https://your-app.railway.app)"
echo "2. Update mobile app API URL in: mobile_app/src/services/api.ts"
echo "3. Run database migrations:"
echo "   railway run python manage.py migrate"
echo "4. Create superuser:"
echo "   railway run python manage.py createsuperuser"
echo "5. Test the API:"
echo "   curl https://your-app.railway.app/api/health/"
echo ""

echo "✨ Ready for deployment! Please follow the steps above."