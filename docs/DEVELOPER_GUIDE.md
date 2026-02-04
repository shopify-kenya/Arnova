# Arnova Developer Guide

## Quick Start

```bash
python unified_server.py
```

## Project Structure

```txt
Arnova/
├── app/                    # Next.js app directory
├── components/             # React components
├── lib/                   # Utility libraries
├── public/                # Static assets
├── shop/                  # Django app
├── ssl/                   # SSL certificates (generated)
├── .env                   # Environment variables
├── manage.py              # Django management
├── unified_server.py      # Builds frontend + runs Django
├── start_dev.sh           # Run Django + Next.js dev servers
└── requirements.txt       # Python dependencies
```

## Development Setup

### Prerequisites

- Python 3.8+
- Node.js 18+
- OpenSSL (for HTTPS)

### Environment Variables

Configure `.env` file:

```env
SECRET_KEY=your-secret-key
DEBUG=true
DJANGO_ALLOWED_HOSTS=127.0.0.1,localhost
CSRF_TRUSTED_ORIGINS=http://127.0.0.1:8000,http://localhost:8000
# DATABASE_URL=postgresql://user:pass@host:5432/dbname
SESSION_COOKIE_SECURE=false
CSRF_COOKIE_SECURE=false
```

### Scripts

- `python unified_server.py` - Build frontend + run Django (HTTP/HTTPS)
- `./start_dev.sh` - Run Django + Next.js dev servers separately
- `python generate_ssl.py` - Generate SSL certificates
- `python generate_pwa_assets.py` - Setup PWA assets
- `python update_translations.py` - Find untranslated strings

## API Endpoints

### Authentication

- `POST /api/auth/login/` - User login
- `POST /api/auth/register/` - User registration
- `POST /api/auth/logout/` - User logout

### Products

- `GET /api/products/` - List products
- `GET /api/products/{id}/` - Product details
- `GET /api/categories/` - Product categories

### User

- `GET /api/cart/` - Cart items (returns empty when unauthenticated)
- `POST /api/cart/add/` - Add item to cart
- `PUT/DELETE /api/cart/<id>/` - Update/remove cart item
- `GET /api/saved/` - Saved items (returns empty when unauthenticated)
- `POST /api/saved/add/` - Add to saved
- `DELETE /api/saved/<id>/` - Remove from saved
- `GET/PUT /api/profile/` - User profile
- `GET /api/orders/` - Order history
- `GET /api/notifications/` - Notifications
- `POST /api/notifications/<id>/read/` - Mark notification as read
- `POST /api/notifications/mark-all-read/` - Mark all notifications as read

### Admin

- `GET /api/admin/orders/` - Manage orders
- `GET/POST /api/admin/products/` - Manage products
- `GET /api/admin/users/` - Manage users
- `GET /api/admin/analytics/` - Analytics data

## Database

### Migrations

```bash
python manage.py makemigrations
python manage.py migrate
```

### Models

- `User` - Custom user model
- `Product` - Product information
- `Category` - Product categories
- `Order` - Customer orders
- `CartItem` - Shopping cart items

## Frontend

### Components

- `components/ui/` - Reusable UI components
- `components/navbar.tsx` - Navigation
- `components/footer.tsx` - Footer
- `components/product-card.tsx` - Product display

### Pages

- `app/page.tsx` - Homepage
- `app/login/page.tsx` - Authentication
- `app/product/[id]/page.tsx` - Product details
- `templates/admin/*.html` - Admin dashboard (Django templates)

### Styling

- Tailwind CSS for styling
- Glass morphism design system
- Responsive design

## Deployment

### Production Build

```bash
npm run build
python manage.py collectstatic
```

### Environment

Set `DEBUG=false` in production and configure proper database settings.

## Testing

### Frontend

```bash
npm test
```

### Backend

```bash
python manage.py test
```
