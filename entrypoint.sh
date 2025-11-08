#!/bin/bash

echo "🚀 Flash Payment App - Starting Production Deployment"
echo "==============================================="

# Debug environment variables
echo "🔍 Environment Debug:"
echo "   DATABASE_URL: ${DATABASE_URL:0:50}..."
echo "   RAILWAY_ENVIRONMENT: $RAILWAY_ENVIRONMENT"
echo "   DEBUG: $DEBUG"

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
sleep 15

# Test database connectivity
echo "🔌 Testing database connectivity..."
python -c "
import os
import psycopg2
from urllib.parse import urlparse

db_url = os.environ.get('DATABASE_URL')
if db_url:
    try:
        url = urlparse(db_url)
        conn = psycopg2.connect(
            host=url.hostname,
            port=url.port,
            user=url.username,
            password=url.password,
            database=url.path[1:]
        )
        conn.close()
        print('✅ Database connection successful')
    except Exception as e:
        print(f'❌ Database connection failed: {e}')
        exit(1)
else:
    print('❌ No DATABASE_URL provided')
    exit(1)
"

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