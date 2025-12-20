# Arnova - Premium Fashion E-commerce

A modern e-commerce platform built with Next.js and Django, featuring a glass morphism design and comprehensive shopping experience.

## Features

- Modern React/Next.js frontend with glass morphism design
- Django REST API backend
- Multi-language support (English, Swahili)
- Progressive Web App (PWA) capabilities
- SSL/HTTPS support for development
- Responsive design for all devices
- Admin dashboard for product management
- Shopping cart and wishlist functionality
- User authentication and profiles

## Quick Start

```bash
# Clone the repository
git clone <repository-url>
cd Arnova

# Install dependencies
npm install
pip install -r requirements.txt

# Start unified development server
python quick-start.py
```

**Unified Server Architecture:**

- Single server endpoint serves both frontend and backend
- Django handles API routes (`/api/*`) and admin (`/admin/`)
- Next.js frontend integrated seamlessly
- CSRF protection enabled for secure API communication

**Access Points:**

- Main App: <http://127.0.0.1:8000>
- HTTPS: <https://127.0.0.1:8443> (if SSL enabled)
- Admin Panel: <http://127.0.0.1:8000/admin/>
- API Endpoints: <http://127.0.0.1:8000/api/>\*
- CSRF Demo: <http://127.0.0.1:8000/csrf-example/>

## Documentation

- [Developer Guide](DEVELOPER_GUIDE.md) - Technical documentation for developers
- [User Guide](USER_GUIDE.md) - Comprehensive guide for end users
- [API Documentation](API_DOCUMENTATION.md) - REST API reference
- [Deployment Guide](DEPLOYMENT.md) - Production deployment instructions

## Technology Stack

**Frontend:**

- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- Framer Motion

**Backend:**

- Django 4.2
- Django REST Framework
- SQLite (development)
- PostgreSQL (production)

**Features:**

- PWA support
- Multi-language (i18n)
- SSL/HTTPS
- Responsive design
- Admin dashboard

## License

This project is licensed under the MIT License.
