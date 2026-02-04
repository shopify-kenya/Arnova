# Arnova Shop - Deployment Guide

## 🚀 Quick Start

### Development (Automated)

```bash
python unified_server.py
```

This script will:

- Build the frontend
- Run migrations
- Generate PWA assets
- Start Django on port 8000 (and 8443 if SSL is configured)

### Production (Docker)

```bash
docker-compose up --build
```

## 📋 Prerequisites

- Python 3.11+
- Node.js 18+
- PostgreSQL (for production)
- Docker & Docker Compose (for containerized deployment)

## 🏗️ Architecture

Arnova supports two deployment models:

1. **Unified**: Django serves the API and prebuilt Next.js frontend
2. **Split**: Next.js on Vercel, Django on Render (see `docs/DEPLOYMENT_ARCHITECTURE.md`)

```
┌─────────────────────────────────────────┐
│            Django Server               │
│         (Port 8000/8443)               │
├─────────────────────────────────────────┤
│  Next.js Frontend + Django API         │
│  • React UI (prebuilt)                 │
│  • REST API                            │
│  • Admin Dashboard                     │
└─────────────────────────────────────────┘
```

## 🔧 Environment Variables

Create `.env` file:

```env
SECRET_KEY=your-secret-key-here
DEBUG=true
DJANGO_ALLOWED_HOSTS=127.0.0.1,localhost
CSRF_TRUSTED_ORIGINS=http://127.0.0.1:8000,http://localhost:8000
JWT_SECRET=your-jwt-secret
JWT_ACCESS_TTL_MINUTES=15
JWT_REFRESH_TTL_DAYS=7
# DATABASE_URL=postgresql://user:pass@host:5432/dbname
# NEON_DATABASE_URL=postgresql://user:pass@ep-xxxx.neon.tech/dbname?sslmode=require
```

### Neon vs Render Postgres

- `DATABASE_URL` takes precedence when set (e.g., Render Postgres).
- `NEON_DATABASE_URL` is used when `DATABASE_URL` is not set.
- For Neon, ensure the connection string includes `?sslmode=require`.

## 📦 Manual Setup

### Backend Setup

```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver 8000
```

### Frontend Setup

```bash
npm install
npm run build
npm run dev
```

## 🐳 Docker Deployment

### Single Container

```bash
docker build -t arnova-shop -f docker/Dockerfile .
docker run -p 8000:8000 arnova-shop
```

### Multi-Service (Recommended)

```bash
docker-compose up -d
```

Services:

- **Web**: Django + Next.js app
- **Database**: PostgreSQL
- **Nginx**: Reverse proxy & static files

## 🌐 URLs

- **Unified App**: <http://127.0.0.1:8000>
- **Admin Panel**: <http://127.0.0.1:8000/admin/>
- **GraphQL API**: <http://127.0.0.1:8000/graphql/>
- **Split Frontend (dev)**: <http://localhost:3000>

## 📱 PWA Features

The app includes a PWA manifest for mobile installation:

- Offline support
- App-like experience
- Push notifications ready
- Mobile-optimized UI

## 🔒 Security

- Environment-based configuration
- JWT authentication enabled for GraphQL
- Secure headers configured
- Production-ready settings

## 📊 Monitoring

- Health checks configured
- Logging enabled
- Error tracking ready
- Performance monitoring hooks

## 🚀 Deployment Checklist

- [ ] Update environment variables
- [ ] Configure database
- [ ] Set up SSL certificates
- [ ] Configure domain/DNS
- [ ] Set up monitoring
- [ ] Configure backups
- [ ] Test all functionality

## 🆘 Troubleshooting

### Port Conflicts

```bash
# Kill processes on ports
sudo lsof -ti:8000 | xargs kill -9
sudo lsof -ti:3000 | xargs kill -9
```

### Database Issues

```bash
# Reset database
python manage.py flush
python manage.py migrate
```

### Build Issues

```bash
# Clean builds
rm -rf .next node_modules
npm install
npm run build
```
