# Unified Server Architecture Guide

## Overview

Arnova uses a unified server architecture where Django serves both the Next.js frontend and the API backend from a single endpoint. This eliminates CORS issues and simplifies deployment.

## Architecture

```
┌─────────────────────────────────────────┐
│            Django Server               │
│         (Port 8000/8443)               │
├─────────────────────────────────────────┤
│  Frontend Routes (Next.js)             │
│  ├── / (homepage)                      │
│  ├── /login, /register                 │
│  ├── /products, /cart, /profile        │
│  └── / (all non-admin routes)          │
├─────────────────────────────────────────┤
│  API Routes                            │
│  ├── /api/auth/* (login, register)     │
│  ├── /api/products/*                   │
│  ├── /api/cart/*                       │
│  └── /api/admin/*                      │
├─────────────────────────────────────────┤
│  Django Admin + Custom Admin            │
│  ├── /admin/* (custom admin dashboard) │
│  └── /django-admin/ (Django admin site)│
└─────────────────────────────────────────┘
```

## How It Works

1. **Single Server**: Django serves everything from one port
2. **Route Handling**:
   - API routes (`/api/*`) → Django API views
   - Admin routes (`/admin/*`) → Custom Django templates
   - Django admin (`/django-admin/`) → Django admin site
   - All other routes → Next.js frontend
3. **CSRF Protection**: Enabled for API security
4. **Static Files**: Next.js build output served by Django

## Running the Application

### Development Mode

```bash
# Install dependencies
npm install
pip install -r requirements.txt

# Start unified server
python unified_server.py
```

### Manual Start

```bash
# Build frontend
npm run build

# Run migrations
python manage.py migrate

# Start Django server (HTTP only)
python manage.py runserver
# For HTTP + HTTPS with build steps, use:
python unified_server.py
```

## API Integration

### CSRF Token Usage

For secure API calls from the frontend:

```javascript
// Get CSRF token
const response = await fetch("/api/csrf-token/")
const { csrfToken } = await response.json()

// Make authenticated request
const result = await fetch("/api/cart/", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "X-CSRFToken": csrfToken,
  },
  credentials: "same-origin",
  body: JSON.stringify(data),
})
```

### Using the CSRF Utility

```javascript
// Load the utility
;<script src="/csrf-utils.js"></script>

// Make requests easily
const response = await window.csrfManager.post("/api/cart/", {
  product_id: "item-1",
  quantity: 1,
})
```

## File Structure

```
Arnova/
├── app/                    # Next.js frontend
├── components/             # React components
├── lib/                    # Frontend utilities
├── public/                 # Static assets
├── shop/                   # Django app
├── templates/              # Django templates
├── settings.py             # Django settings
├── urls.py                 # URL routing
├── unified_server.py       # Unified server starter
└── manage.py               # Django management
```

## Benefits

1. **No CORS Issues**: Same-origin requests
2. **Simplified Deployment**: Single server to deploy
3. **Secure by Default**: CSRF protection enabled
4. **Development Efficiency**: One command to start everything
5. **Production Ready**: Optimized for real-world use

## Troubleshooting

### CSRF Token Issues

- Ensure cookies are enabled
- Check that requests include `X-CSRFToken` header
- Verify `credentials: 'same-origin'` in fetch requests

### Build Issues

- Run `npm run build` before starting Django
- Check that `.next` directory exists
- Ensure `STATICFILES_DIRS` includes build output

### Port Conflicts

- Default port is 8000, change in `manage.py runserver <port>`
- For HTTPS, use `python unified_server.py` after generating SSL certs

## Production Deployment

1. Build frontend: `npm run build`
2. Collect static files: `python manage.py collectstatic`
3. Run with production server (gunicorn, uwsgi, etc.)
4. Configure reverse proxy (nginx) if needed

The unified architecture makes deployment straightforward as there's only one server to configure.
