#!/bin/bash

# Flash Payment App - Production Readiness Verification Script

echo "🔍 Verifying Flash Payment App Production Readiness"
echo "=================================================="

# Check if we're in the right directory
if [ ! -f "README.md" ] || [ ! -d "backend" ] || [ ! -d "mobile_app" ]; then
    echo "❌ Not in FlashApp root directory"
    exit 1
fi

echo "✅ In FlashApp root directory"

# Backend checks
echo ""
echo "🔧 Backend Production Files:"
echo "----------------------------"

files=(
    "backend/production.Dockerfile"
    "backend/requirements.txt"
    "backend/config/settings.py"
    "railway.json"
    "deploy-production.sh"
    "DEPLOYMENT.md"
    "PRODUCTION_STATUS.md"
)

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file"
    else
        echo "❌ $file (missing)"
    fi
done

# Check for production dependencies in requirements.txt
echo ""
echo "📦 Production Dependencies:"
echo "--------------------------"
if grep -q "gunicorn" backend/requirements.txt; then
    echo "✅ gunicorn (WSGI server)"
else
    echo "❌ gunicorn (missing)"
fi

if grep -q "whitenoise" backend/requirements.txt; then
    echo "✅ whitenoise (static files)"
else
    echo "❌ whitenoise (missing)"
fi

if grep -q "sentry-sdk" backend/requirements.txt; then
    echo "✅ sentry-sdk (error monitoring)"
else
    echo "❌ sentry-sdk (missing)"
fi

# Mobile app checks
echo ""
echo "📱 Mobile App Production Files:"
echo "------------------------------"

mobile_files=(
    "mobile_app/src/config/environment.ts"
    "mobile_app/.env.production.example"
    "mobile_app/src/services/api.ts"
)

for file in "${mobile_files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file"
    else
        echo "❌ $file (missing)"
    fi
done

# Check Railway CLI
echo ""
echo "🚂 Railway CLI:"
echo "--------------"
if command -v railway &> /dev/null; then
    echo "✅ Railway CLI installed: $(railway --version)"
else
    echo "❌ Railway CLI not installed"
    echo "   Run: npm install -g @railway/cli"
fi

# Check Docker (optional for Railway)
echo ""
echo "🐳 Docker (Optional):"
echo "--------------------"
if command -v docker &> /dev/null; then
    echo "✅ Docker installed: $(docker --version)"
else
    echo "⚠️  Docker not installed (not required for Railway)"
fi

# QR Scanner verification
echo ""
echo "📷 QR Scanner Status:"
echo "--------------------"
if grep -q "react-native-vision-camera" mobile_app/package.json; then
    echo "✅ VisionCamera installed"
    
    # Check if VisionCamera CodeScanner is enabled
    if grep -q "VisionCamera_enableCodeScanner=true" mobile_app/android/gradle.properties; then
        echo "✅ VisionCamera CodeScanner enabled"
    else
        echo "❌ VisionCamera CodeScanner not enabled"
    fi
else
    echo "❌ VisionCamera not installed"
fi

# Git status
echo ""
echo "📝 Git Status:"
echo "-------------"
if git rev-parse --git-dir > /dev/null 2>&1; then
    echo "✅ Git repository"
    
    # Check if there are uncommitted changes
    if [ -n "$(git status --porcelain)" ]; then
        echo "⚠️  Uncommitted changes (should commit before deployment)"
    else
        echo "✅ No uncommitted changes"
    fi
else
    echo "❌ Not a git repository"
fi

echo ""
echo "🎯 Production Readiness Summary:"
echo "==============================="

# Count checks
total_files=0
present_files=0

for file in "${files[@]}" "${mobile_files[@]}"; do
    total_files=$((total_files + 1))
    if [ -f "$file" ]; then
        present_files=$((present_files + 1))
    fi
done

echo "📁 Files: $present_files/$total_files ready"

if command -v railway &> /dev/null; then
    echo "🚂 Railway CLI: Ready"
else
    echo "🚂 Railway CLI: Install needed"
fi

if grep -q "VisionCamera_enableCodeScanner=true" mobile_app/android/gradle.properties; then
    echo "📷 QR Scanner: Ready"
else
    echo "📷 QR Scanner: Configuration needed"
fi

echo ""
if [ $present_files -eq $total_files ] && command -v railway &> /dev/null; then
    echo "🚀 STATUS: READY FOR PRODUCTION DEPLOYMENT!"
    echo ""
    echo "Next steps:"
    echo "1. railway login"
    echo "2. railway new"
    echo "3. railway up"
    echo "4. Set environment variables in Railway dashboard"
    echo "5. Update mobile app with Railway URL"
else
    echo "⚠️  STATUS: Additional setup required"
    echo ""
    echo "Please resolve the missing items above before deployment."
fi