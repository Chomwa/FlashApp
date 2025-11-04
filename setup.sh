#!/bin/bash

echo "🚀 Setting up FlashApp - Mobile Payment Application"
echo "=================================================="

# Backend Setup
echo "📱 Starting Backend Services..."
docker-compose up -d

echo "⏳ Waiting for services to start..."
sleep 15

echo "📊 Running database migrations..."
docker-compose exec backend python manage.py migrate

echo "👤 Creating superuser (admin/admin123)..."
echo "from django.contrib.auth import get_user_model; User = get_user_model(); User.objects.create_superuser('admin', 'admin@flash.com', 'admin123') if not User.objects.filter(username='admin').exists() else None" | docker-compose exec -T backend python manage.py shell

echo "✅ Backend is ready!"
echo "   - API Documentation: http://localhost:8002/api/docs/"
echo "   - Admin Panel: http://localhost:8002/admin/ (admin/admin123)"
echo "   - Database: PostgreSQL on port 5435"
echo "   - Redis: Available on port 6381"

# Mobile App Setup
echo ""
echo "📱 Setting up Mobile App..."
cd mobile_app

if command -v npm &> /dev/null; then
    echo "📦 Installing dependencies..."
    npm install
    
    echo "✅ Mobile app is ready!"
    echo "   To run on iOS: npm run ios"
    echo "   To run on Android: npm run android"
    echo "   To start Metro: npm start"
else
    echo "❌ Node.js/npm not found. Please install Node.js 16+ first."
fi

echo ""
echo "🎉 FlashApp Setup Complete!"
echo "========================================="
echo "Backend: http://localhost:8002"
echo "Frontend: Run 'npm run ios' or 'npm run android' in mobile_app/"
echo "Admin: http://localhost:8002/admin/ (admin/admin123)"
echo ""
echo "💡 Next steps:"
echo "   1. cd mobile_app && npm install"
echo "   2. npm run ios (or android)"
echo "   3. Register a new user in the app"
echo "   4. Test money transfer features"