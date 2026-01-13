#!/bin/bash
# Production deployment script with CSRF validation

set -e

echo "🚀 Starting production deployment..."

# Environment validation
if [ -z "$CSRF_TRUSTED_ORIGINS" ]; then
    echo "❌ CSRF_TRUSTED_ORIGINS not set in production environment"
    exit 1
fi

if [ -z "$SECRET_KEY" ]; then
    echo "❌ SECRET_KEY not set in production environment"
    exit 1
fi

# Build frontend
echo "📦 Building frontend..."
npm run build

# Collect static files
echo "📁 Collecting static files..."
python manage.py collectstatic --noinput

# Run migrations
echo "🗄️ Running database migrations..."
python manage.py migrate

# Test CSRF endpoints
echo "🔒 Testing CSRF endpoints..."
python -c "
import requests
import sys

try:
    # Test health check
    response = requests.get('${DEPLOYMENT_URL:-http://localhost:8000}/api/health/')
    if response.status_code != 200:
        print('❌ Health check failed')
        sys.exit(1)

    # Test CSRF token generation
    response = requests.get('${DEPLOYMENT_URL:-http://localhost:8000}/api/csrf-token/')
    if response.status_code != 200:
        print('❌ CSRF token generation failed')
        sys.exit(1)

    print('✅ CSRF endpoints working')
except Exception as e:
    print(f'❌ CSRF test failed: {e}')
    sys.exit(1)
"

# Start production server
echo "🌟 Starting production server..."
if [ "$USE_GUNICORN" = "true" ]; then
    gunicorn --bind 0.0.0.0:8000 --workers 4 wsgi:application
else
    python unified_server.py
fi