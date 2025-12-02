# Arnova Shop Setup Guide

## Project Structure
```
Arnova/
├── app/                    # Next.js pages (App Router)
├── components/             # React components
├── lib/                    # Utility libraries
├── public/                 # Static assets
├── templates/              # Django templates
├── static/                 # Generated static files
├── manage.py              # Django management script
├── settings.py            # Django settings
├── urls.py               # URL routing
├── views.py              # Django views
├── wsgi.py               # WSGI application
├── .env                  # Environment variables
├── requirements.txt      # Python dependencies
├── package.json          # Node.js dependencies
├── start.sh              # Development startup script
├── Dockerfile            # Production container
├── docker-compose.yml    # Multi-service deployment
└── venv/                 # Virtual environment
```

## Quick Start

### Option 1: Automated Setup (Recommended)
```bash
./start.sh
```

### Option 2: Manual Setup
```bash
# 1. Create virtual environment
python3 -m venv venv
source venv/bin/activate

# 2. Install dependencies
pip install -r requirements.txt
npm install

# 3. Run migrations
python manage.py migrate

# 4. Build frontend
npm run build

# 5. Start servers
python manage.py runserver 8000 &
npm run dev
```

### Option 3: Docker Deployment
```bash
docker-compose up --build
```

## Environment Configuration

The project uses environment variables stored in `.env`:
- `DB_NAME`: PostgreSQL database name
- `DB_USER`: PostgreSQL username  
- `DB_PASSWORD`: PostgreSQL password
- `DB_HOST`: Database host (localhost)
- `DB_PORT`: Database port (5432)
- `SECRET_KEY`: Django secret key
- `DEBUG`: Debug mode (true/false)

## Database Setup

### SQLite (Current - Development)
Currently configured to use SQLite for development. No additional setup required.

### PostgreSQL (Production Ready)
To switch to PostgreSQL:

1. Run setup script:
```bash
sudo ./setup_postgres.sh
```

2. Update `settings.py` to use PostgreSQL configuration
3. Run migrations:
```bash
python manage.py migrate
```

## Dependencies

- **Django 5.2.6**: Web framework
- **psycopg2-binary 2.9.11**: PostgreSQL adapter
- **python-decouple 3.8**: Environment variable management
- **numpy 2.3.4**: Numerical computing

## Development Commands

### Django Commands
```bash
# Create migrations
python manage.py makemigrations

# Apply migrations  
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Collect static files
python manage.py collectstatic

# Run tests
python manage.py test
```

### Frontend Commands
```bash
# Development server
npm run dev

# Production build
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

### Docker Commands
```bash
# Build and start all services
docker-compose up --build

# Start in background
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## Troubleshooting

### Port Already in Use
If port 8000 is busy, use alternative port:
```bash
python manage.py runserver 8001
```

### Environment Variable Issues
Ensure DEBUG is set correctly:
```bash
env DEBUG=true python manage.py runserver
```

### PostgreSQL Connection Issues
1. Check PostgreSQL service is running
2. Verify database and user exist
3. Check connection credentials in `.env`