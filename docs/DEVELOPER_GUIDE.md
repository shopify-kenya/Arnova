# Arnova Developer Guide

## Quick Start

```bash
python quick-start.py
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
├── quick-start.py         # Development setup
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
DB_NAME=shop_db
DB_USER=shop_user
DB_PASSWORD=shop_password
DB_HOST=localhost
DB_PORT=5432
SECRET_KEY=your-secret-key
DEBUG=true
DEV_MODE=true
SSL_ENABLED=false
PWA_ENABLED=true
```

### Scripts

- `python quick-start.py` - Full development setup
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

- `GET/POST /api/cart/` - Cart operations
- `GET/POST /api/saved/` - Saved items
- `GET/PUT /api/profile/` - User profile
- `GET /api/orders/` - Order history

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
- `app/admin/page.tsx` - Admin dashboard

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
