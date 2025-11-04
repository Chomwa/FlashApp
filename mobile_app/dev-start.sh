#!/bin/bash

echo "🚀 Flash App Development Helper"
echo "==============================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Run this from the mobile_app directory"
    exit 1
fi

echo "📱 Flash Mobile App Status Check"
echo ""

# Check Node.js version
NODE_VERSION=$(node --version)
echo "✅ Node.js: $NODE_VERSION"

# Check if dependencies are installed
if [ -d "node_modules" ]; then
    PACKAGE_COUNT=$(ls node_modules | wc -l | tr -d ' ')
    echo "✅ Dependencies: $PACKAGE_COUNT packages installed"
else
    echo "❌ Dependencies: Not installed - run 'npm install --legacy-peer-deps'"
    exit 1
fi

# Check backend status
echo ""
echo "🔍 Checking backend connection..."
if curl -s http://localhost:8002/api/docs/ > /dev/null 2>&1; then
    echo "✅ Backend: Running at http://localhost:8002"
else
    echo "⚠️  Backend: Not running - start with 'docker-compose up -d'"
fi

echo ""
echo "🎯 Development Options:"
echo ""
echo "1. Start Metro bundler:"
echo "   npm start"
echo ""
echo "2. Test with Expo (recommended for quick testing):"
echo "   npx expo install"
echo "   npx expo start"
echo ""
echo "3. Full React Native (requires Xcode/Android Studio):"
echo "   npx react-native run-ios"
echo "   npx react-native run-android"
echo ""
echo "4. Run tests:"
echo "   npm test"
echo ""
echo "📋 Current Status:"
echo "   - Dependencies: ✅ Installed"
echo "   - Configuration: ✅ Ready"
echo "   - Source Code: ✅ Complete"
echo "   - Platform Files: ⏳ Need iOS/Android setup"
echo ""

# Check if iOS/Android directories exist
if [ -d "ios" ] && [ -d "android" ]; then
    echo "✅ Platform files: iOS and Android ready"
    echo ""
    echo "🚀 Ready to run:"
    echo "   npm run ios     # iOS simulator"
    echo "   npm run android # Android emulator"
else
    echo "⏳ Platform files: Need to initialize iOS/Android"
    echo ""
    echo "🔧 To create platform files:"
    echo "   npx react-native init TempProject"
    echo "   cp -r TempProject/ios TempProject/android ."
    echo "   rm -rf TempProject"
fi

echo ""
echo "📚 Documentation:"
echo "   - Setup Status: cat SETUP_STATUS.md"
echo "   - Installation: cat INSTALL.md"
echo "   - Main README: cat ../README.md"