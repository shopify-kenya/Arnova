# PWA Setup and HTTPS Development Guide

## Overview
This guide covers setting up Progressive Web App (PWA) functionality with HTTPS for development and production.

## Prerequisites
- OpenSSL installed on your system
- Python 3.8+
- Django project setup

## HTTPS Development Setup

### 1. Generate SSL Certificates
```bash
python generate_ssl.py
```
This creates self-signed certificates in the `ssl/` directory:
- `ssl/cert.pem` - SSL certificate
- `ssl/key.pem` - Private key

### 2. Run HTTPS Development Server
```bash
python run_https.py
```
This will:
- Generate SSL certificates if needed
- Install django-extensions for HTTPS support
- Start Django server at `https://127.0.0.1:8000`

### 3. Accept Self-Signed Certificate
1. Navigate to `https://127.0.0.1:8000`
2. Click "Advanced" when browser shows security warning
3. Click "Proceed to 127.0.0.1 (unsafe)"

## PWA Features

### Service Worker
- Caches static assets and API responses
- Provides offline functionality
- Handles background sync
- Supports push notifications

### Web App Manifest
- Defines app metadata and icons
- Enables "Add to Home Screen" functionality
- Configures display mode and theme colors
- Includes app shortcuts

### Install Functionality
- Install button appears in navbar when PWA criteria are met
- Only shows on HTTPS (or localhost)
- Requires valid manifest and service worker
- Works on supported browsers (Chrome, Edge, Safari)

## PWA Requirements Checklist

✅ **HTTPS Required**
- Development: Use `python run_https.py`
- Production: Configure SSL certificate

✅ **Web App Manifest**
- Located at `/public/manifest.json`
- Includes required fields: name, icons, start_url, display

✅ **Service Worker**
- Located at `/public/service-worker.js`
- Registers automatically via layout.tsx
- Handles caching and offline functionality

✅ **Icons**
- 192x192 and 512x512 icons in `/public/`
- Both "any" and "maskable" purposes supported

## Testing PWA

### Chrome DevTools
1. Open DevTools (F12)
2. Go to "Application" tab
3. Check "Manifest" section for errors
4. Check "Service Workers" for registration status
5. Use "Lighthouse" tab to audit PWA score

### Install Testing
1. Visit site on HTTPS
2. Look for install button in navbar
3. Or use browser's install option in address bar
4. Test offline functionality

## Production Deployment

### SSL Certificate
```bash
# Using Let's Encrypt (recommended)
sudo certbot --nginx -d yourdomain.com

# Or configure your SSL certificate in nginx/apache
```

### Django Settings
```python
# settings.py
SECURE_SSL_REDIRECT = True
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
```

### Static Files
Ensure static files are served with proper headers:
```nginx
location /static/ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

## Troubleshooting

### PWA Install Button Not Showing
- Verify HTTPS is working
- Check manifest.json is valid
- Ensure service worker is registered
- Check browser console for errors

### Service Worker Issues
- Clear browser cache and storage
- Check service worker registration in DevTools
- Verify service-worker.js is accessible

### Manifest Errors
- Validate manifest.json syntax
- Ensure all icon files exist
- Check start_url is accessible

## Browser Support

| Feature | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------|------|
| Install | ✅ | ❌ | ✅ | ✅ |
| Service Worker | ✅ | ✅ | ✅ | ✅ |
| Manifest | ✅ | ✅ | ✅ | ✅ |
| Offline | ✅ | ✅ | ✅ | ✅ |

## Security Notes

### Development
- Self-signed certificates will show security warnings
- Only use for development, never production
- Browsers may cache certificate decisions

### Production
- Use proper SSL certificates (Let's Encrypt recommended)
- Enable HSTS headers
- Configure CSP headers for security
- Regular security updates

## Additional Resources

- [PWA Checklist](https://web.dev/pwa-checklist/)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Web App Manifest](https://developer.mozilla.org/en-US/docs/Web/Manifest)
- [Workbox](https://developers.google.com/web/tools/workbox) - Advanced PWA toolkit