# Pull Request: Security Updates and Package Upgrades

## Branch

`feat/security-updates`

## Summary

Updated all packages to latest versions and enhanced security headers with Content Security Policy.

## Changes Made

### Package Updates

**Python Packages:**

- Django: 6.0.1 → 6.0.2
- gunicorn: 23.0.0 → 25.1.0
- strawberry-graphql: 0.291.0 → 0.305.0
- cryptography: 46.0.3 → 46.0.5
- black: 25.12.0 → 26.1.0
- isort: 7.0.0 → 8.0.0
- PyJWT: 2.10.1 → 2.11.0
- pillow: 12.1.0 → 12.1.1
- numpy: 2.4.1 → 2.4.2
- And 10+ other packages

**Node Packages:**

- @tailwindcss/postcss: 4.1.18 → 4.2.1
- tailwindcss: 4.1.18 → 4.2.1
- tailwind-merge: 3.4.0 → 3.5.0
- framer-motion: 12.31.0 → 12.34.3
- lucide-react: 0.563.0 → 0.575.0
- And other dependencies

### Security Enhancements

**Content Security Policy Added:**

- `default-src 'self'` - Only allow resources from same origin
- `script-src` - Allow scripts from self and CDN
- `style-src` - Allow styles from self and Google Fonts
- `font-src` - Allow fonts from Google Fonts
- `img-src` - Allow images from self, data URIs, HTTPS, and blobs
- `connect-src` - Allow connections to Unsplash and Exchange Rate APIs
- `frame-ancestors 'none'` - Prevent embedding in iframes
- `base-uri 'self'` - Restrict base tag URLs
- `form-action 'self'` - Restrict form submissions

**Existing Security Headers:**

- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- X-XSS-Protection: 1; mode=block
- Referrer-Policy: strict-origin-when-cross-origin
- Permissions-Policy: Restricted geolocation, microphone, camera, payment

## Testing

✅ All packages updated successfully
✅ Security headers enhanced with CSP
✅ No breaking changes detected
✅ Ready for deployment

## Files Changed

- requirements.txt
- package.json
- package-lock.json
- shop/middleware/security_headers.py

## Security Impact

- Enhanced protection against XSS attacks
- Improved control over resource loading
- Updated packages fix known vulnerabilities
- All connections encrypted (HTTPS enforced in production)
