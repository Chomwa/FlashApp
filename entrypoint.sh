#!/bin/bash

echo "🚀 Flash Payment App - Starting Production Deployment"
echo "==============================================="

# Wait for database to be ready
echo "⏳ Waiting for database..."
sleep 10

# Run database migrations
echo "📊 Running database migrations..."
python manage.py migrate --noinput

# Create default superuser if it doesn't exist
echo "👤 Setting up admin user..."
python manage.py shell << END
from django.contrib.auth import get_user_model
User = get_user_model()
if not User.objects.filter(phone_number='+260999999999').exists():
    User.objects.create_superuser(
        phone_number='+260999999999',
        password='admin123',
        full_name='Flash Admin'
    )
    print('✅ Admin user created: +260999999999 / admin123')
else:
    print('✅ Admin user already exists')
END

# Collect static files
echo "📁 Collecting static files..."
python manage.py collectstatic --noinput

echo "🎉 Setup complete! Starting Gunicorn..."
echo "==============================================="

# Start the application
exec gunicorn --bind 0.0.0.0:8000 --workers 3 --timeout 120 config.wsgi:application