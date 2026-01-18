# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |

## Deployment Architecture

### Production Environment

- **Frontend**: Next.js on Vercel (<https://vercel.app>)
- **Backend**: Django on Render (<https://arnova-207y.onrender.com>)
- **Database**: PostgreSQL on Render

### Security Measures

#### Frontend (Vercel)

- HTTPS enforced on all connections
- Environment variables for API endpoints
- API requests proxied through Next.js rewrites
- No sensitive data stored in frontend

#### Backend (Django/Render)

- HTTPS/SSL enforced (`SECURE_SSL_REDIRECT=True`)
- HSTS enabled with 1-year max-age
- Secure session cookies (`SESSION_COOKIE_SECURE=True`)
- Secure CSRF cookies (`CSRF_COOKIE_SECURE=True`)
- CORS restricted to Vercel and Render domains
- Admin panel IP whitelisting
- Account lockout after failed login attempts
- Rate limiting on API endpoints

#### Database

- PostgreSQL with SSL connections
- Connection pooling with health checks
- Automated backups on Render

## CORS Configuration

Allowed origins:

- `https://arnova-207y.onrender.com` (Backend)
- `https://*.vercel.app` (Frontend - all Vercel deployments)
- `http://localhost:3000` (Local development)
- `http://localhost:8000` (Local development)

## CSRF Protection

Trusted origins configured in `.env`:

```
CSRF_TRUSTED_ORIGINS=https://arnova-207y.onrender.com,https://*.vercel.app
```

## Environment Variables

### Required Backend Variables (Render)

- `SECRET_KEY` - Django secret key (auto-generated)
- `DATABASE_URL` - PostgreSQL connection string
- `DEBUG=0` - Production mode
- `DJANGO_ALLOWED_HOSTS` - Comma-separated allowed hosts
- `CSRF_TRUSTED_ORIGINS` - Comma-separated trusted origins
- `SESSION_COOKIE_SECURE=True`
- `CSRF_COOKIE_SECURE=True`

### Required Frontend Variables (Vercel)

- `NEXT_PUBLIC_API_URL` - Backend API URL
- `NEXT_PUBLIC_SITE_URL` - Frontend site URL

## Reporting a Vulnerability

If you discover a security vulnerability, please report it by:

1. **Email**: Send details to <admin@arnova.com>
2. **Include**:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

### Response Timeline

- **Initial Response**: Within 48 hours
- **Status Update**: Every 7 days until resolved
- **Fix Timeline**: Critical issues within 7 days, others within 30 days

### What to Expect

- **Accepted**: We'll work on a fix and credit you in release notes
- **Declined**: We'll explain why it's not considered a vulnerability
- **Confidentiality**: We'll keep your report confidential until fixed

## Security Best Practices

### For Developers

1. Never commit `.env` files
2. Use environment variables for all secrets
3. Keep dependencies updated
4. Run security audits: `npm audit` and `pip-audit`
5. Review CORS and CSRF settings before deployment

### For Administrators

1. Use strong passwords (min 8 chars, mixed case, numbers, symbols)
2. Enable 2FA when available
3. Regularly review access logs
4. Keep admin IP whitelist updated
5. Monitor failed login attempts

## Compliance

- HTTPS/TLS 1.2+ enforced
- OWASP Top 10 protections implemented
- GDPR-compliant data handling
- Regular security updates and patches
