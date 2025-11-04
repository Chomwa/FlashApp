#!/bin/bash

echo "🚀 Flash App - React Native Initialization"
echo "========================================="

# Check if React Native CLI is installed
if ! command -v react-native &> /dev/null; then
    echo "📱 Installing React Native CLI..."
    npm install -g @react-native-community/cli
fi

# Check if we're in the right directory
if [ ! -d "mobile_app" ]; then
    echo "❌ Error: mobile_app directory not found."
    echo "Please run this script from the FlashApp root directory."
    exit 1
fi

cd mobile_app

# Check if this is already a React Native project
if [ -d "ios" ] && [ -d "android" ]; then
    echo "✅ React Native project already initialized."
    echo "📦 Installing dependencies..."
    
    # Use the setup script
    chmod +x setup-mobile.sh
    ./setup-mobile.sh
else
    echo "🔄 Initializing React Native project..."
    echo "This will create iOS and Android directories..."
    
    # Go back to parent directory
    cd ..
    
    # Remove existing mobile_app directory
    rm -rf mobile_app_backup
    mv mobile_app mobile_app_backup
    
    # Initialize new React Native project
    npx react-native init FlashAppMobile --template react-native-template-typescript
    
    # Rename to mobile_app
    mv FlashAppMobile mobile_app
    
    # Copy our custom files back
    cp mobile_app_backup/package.json mobile_app/
    cp mobile_app_backup/src mobile_app/src -r
    cp mobile_app_backup/*.md mobile_app/
    cp mobile_app_backup/*.sh mobile_app/
    
    cd mobile_app
    
    echo "✅ React Native project initialized!"
    echo "📦 Installing dependencies..."
    
    # Install dependencies
    npm install --legacy-peer-deps
    
    # iOS setup
    if [ -d "ios" ]; then
        echo "🍎 Setting up iOS..."
        cd ios
        pod install
        cd ..
    fi
    
    echo "✅ Setup complete!"
fi

echo ""
echo "🎉 Flash Mobile App Ready!"
echo ""
echo "To run the app:"
echo "  cd mobile_app"
echo "  npm run ios     # for iOS"
echo "  npm run android # for Android"
echo ""
echo "Backend should be running at: http://localhost:8002"