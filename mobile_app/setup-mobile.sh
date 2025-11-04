#!/bin/bash

echo "📱 Setting up Flash Mobile App"
echo "============================="

# Check Node.js version
NODE_VERSION=$(node --version)
echo "Node.js version: $NODE_VERSION"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the mobile_app directory."
    exit 1
fi

# Clean npm cache and node_modules
echo "🧹 Cleaning previous installation..."
rm -rf node_modules
rm -f package-lock.json
npm cache clean --force

# Install dependencies with legacy peer deps to handle version conflicts
echo "📦 Installing dependencies..."
npm install --legacy-peer-deps

# Check if installation was successful
if [ $? -eq 0 ]; then
    echo "✅ Dependencies installed successfully!"
    
    # Check if iOS directory exists and run pod install
    if [ -d "ios" ]; then
        echo "🍎 Installing iOS dependencies..."
        cd ios
        pod install --repo-update
        cd ..
        echo "✅ iOS setup complete!"
    else
        echo "ℹ️  iOS directory not found. You may need to run 'npx react-native init' first."
    fi
    
    echo ""
    echo "🎉 Mobile app setup complete!"
    echo ""
    echo "To run the app:"
    echo "  iOS:     npm run ios"
    echo "  Android: npm run android"
    echo "  Start:   npm start"
    echo ""
    echo "Make sure your backend is running at http://localhost:8002"
    
else
    echo "❌ Installation failed. Trying alternative approach..."
    echo "🔄 Installing with --force flag..."
    npm install --force
    
    if [ $? -eq 0 ]; then
        echo "✅ Installation successful with --force flag!"
    else
        echo "❌ Installation failed. Please check the error messages above."
        echo ""
        echo "Common solutions:"
        echo "1. Update Node.js to the latest LTS version"
        echo "2. Clear npm cache: npm cache clean --force"
        echo "3. Delete node_modules and package-lock.json, then retry"
        echo "4. Use npm install --legacy-peer-deps"
        exit 1
    fi
fi