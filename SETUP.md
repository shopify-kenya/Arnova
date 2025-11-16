# Django Shop Setup Guide

## Project Structure
```
Arnova/
├── manage.py           # Django management script
├── settings.py         # Django settings
├── urls.py            # URL routing
├── wsgi.py            # WSGI application
├── asgi.py            # ASGI application
├── __init__.py        # Python package marker
├── .env               # Environment variables
├── requirements.txt   # Python dependencies
├── setup_postgres.sh  # PostgreSQL setup script
├── venv/              # Virtual environment
└── db.sqlite3         # SQLite database (development)
```

## Quick Start

### 1. Activate Virtual Environment
```bash
source venv/bin/activate
# or
./venv/bin/python manage.py [command]
```

### 2. Install Dependencies
```bash
pip install -r requirements.txt
```

### 3. Run Migrations
```bash
python manage.py migrate
```

### 4. Start Development Server
```bash
python manage.py runserver 8001
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

```bash
# Create new app
python manage.py startapp [app_name]

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