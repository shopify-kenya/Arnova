#!/bin/bash

# Arnova Shop - Development Startup Script
# This script handles migrations and starts both Django and Next.js servers

set -e

echo "🚀 Starting Arnova Shop Development Environment"
echo "=============================================="

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "❌ Virtual environment not found. Please run setup first."
    exit 1
fi

# Activate virtual environment
source venv/bin/activate

# Install Python dependencies
echo "📦 Installing Python dependencies..."
pip install -r requirements.txt > /dev/null 2>&1

# Install Node.js dependencies
echo "📦 Installing Node.js dependencies..."
npm install > /dev/null 2>&1

# Run Django migrations
echo "🔄 Running Django migrations..."
python manage.py migrate

# Build Next.js frontend
echo "🏗️  Building Next.js frontend..."
npm run build

# Create superuser if it doesn't exist
echo "👤 Setting up admin user..."
python manage.py shell -c "
from django.contrib.auth import get_user_model
User = get_user_model()
if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser('admin', 'admin@arnova.com', 'admin123')
    print('✅ Admin user created: admin/admin123')
else:
    print('✅ Admin user already exists')
"

echo ""
echo "🎉 Setup complete! Starting servers..."
echo ""
echo "📊 Django Admin: http://localhost:8000/admin"
echo "🛍️  Frontend: http://localhost:3000"
echo "🔧 Backend API: http://localhost:8000"
echo ""

# Function to handle cleanup
cleanup() {
    echo ""
    echo "🛑 Shutting down servers..."
    kill $DJANGO_PID $NEXTJS_PID 2>/dev/null || true
    exit 0
}

# Set trap for cleanup
trap cleanup SIGINT SIGTERM

# Start Django server in background
echo "🐍 Starting Django server on port 8000..."
python manage.py runserver 8000 &
DJANGO_PID=$!

# Wait a moment for Django to start
sleep 2

# Start Next.js server in background
echo "⚡ Starting Next.js server on port 3000..."
npm run dev &
NEXTJS_PID=$!

# Wait for both servers
echo ""
echo "✅ Both servers are running!"
echo "Press Ctrl+C to stop all servers"
echo ""

# Keep script running
wait