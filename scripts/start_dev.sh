#!/bin/bash
# Development startup script - runs both Django and Next.js

echo "🚀 Starting Arnova Development Servers..."

# Start Django backend in background
echo "📦 Starting Django backend on port 8000..."
export DJANGO_SETTINGS_MODULE=settings
python manage.py runserver 127.0.0.1:8000 &
DJANGO_PID=$!

# Wait for Django to start
sleep 3

# Start Next.js frontend
echo "⚛️ Starting Next.js frontend on port 3000..."
npm run dev &
NEXTJS_PID=$!

echo "✅ Servers started:"
echo "   • Django Backend: http://127.0.0.1:8000"
echo "   • Next.js Frontend: http://localhost:3000"
echo "   • Admin Panel: http://127.0.0.1:8000/admin/"
echo ""
echo "Press Ctrl+C to stop both servers"

# Wait for interrupt
trap "echo '🛑 Stopping servers...'; kill $DJANGO_PID $NEXTJS_PID; exit" INT
wait
