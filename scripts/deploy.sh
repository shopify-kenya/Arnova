#!/bin/bash
# Production deployment script with GraphQL validation

set -e

echo "🚀 Starting production deployment..."

# Environment validation
if [ -z "$SECRET_KEY" ]; then
    echo "❌ SECRET_KEY not set in production environment"
    exit 1
fi
if [ -z "$JWT_SECRET" ]; then
    echo "❌ JWT_SECRET not set in production environment"
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

# Test health + GraphQL endpoint
echo "🔒 Testing health and GraphQL endpoints..."
python -c "
import requests
import sys

try:
    # Test health check
    response = requests.get('${DEPLOYMENT_URL:-http://localhost:8000}/health/')
    if response.status_code != 200:
        print('❌ Health check failed')
        sys.exit(1)

    # Test GraphQL health query
    response = requests.post(
        '${DEPLOYMENT_URL:-http://localhost:8000}/graphql/',
        json={\"query\": \"{ health }\"}
    )
    if response.status_code != 200 or response.json().get('errors'):
        print('❌ GraphQL health query failed')
        sys.exit(1)

    print('✅ Health and GraphQL endpoints working')
except Exception as e:
    print(f'❌ Endpoint test failed: {e}')
    sys.exit(1)
"

# Start production server
echo "🌟 Starting production server..."
if [ "$USE_GUNICORN" = "true" ]; then
    gunicorn --bind 0.0.0.0:8000 --workers 4 wsgi:application
else
    python unified_server.py
fi
