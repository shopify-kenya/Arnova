# Arnova Shop - Deployment Guide

## 🚀 Quick Start

### Development (Automated)
```bash
./start.sh
```
This script will:
- Install all dependencies
- Run migrations
- Build the frontend
- Create admin user (admin/admin123)
- Start both Django (port 8000) and Next.js (port 3000) servers

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

```
┌─────────────────┐    ┌─────────────────┐
│   Next.js App   │    │  Django API     │
│   (Port 3000)   │◄──►│  (Port 8000)    │
│                 │    │                 │
│ • React UI      │    │ • REST API      │
│ • TypeScript    │    │ • Admin Panel   │
│ • TailwindCSS   │    │ • Database      │
└─────────────────┘    └─────────────────┘
```

## 🔧 Environment Variables

Create `.env` file:
```env
DB_NAME=arnova_db
DB_USER=arnova_user
DB_PASSWORD=arnova_password
DB_HOST=localhost
DB_PORT=5432
SECRET_KEY=your-secret-key-here
DEBUG=true
```

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
docker build -t arnova-shop .
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

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **Admin Panel**: http://localhost:8000/admin
- **Production**: http://localhost (via Nginx)

## 📱 PWA Features

The app includes a PWA manifest for mobile installation:
- Offline support
- App-like experience
- Push notifications ready
- Mobile-optimized UI

## 🔒 Security

- Environment-based configuration
- CSRF protection enabled
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
sudo lsof -ti:3000 | xargs kill -9
sudo lsof -ti:8000 | xargs kill -9
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