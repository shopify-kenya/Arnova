# Arnova E-commerce - Django Integration Guide

This document provides comprehensive instructions for integrating the Arnova Next.js frontend with a Django backend.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Django Project Setup](#django-project-setup)
3. [Database Schema (PostgreSQL)](#database-schema-postgresql)
4. [API Endpoints](#api-endpoints)
5. [Authentication Integration](#authentication-integration)
6. [Static Files & PWA](#static-files--pwa)
7. [SEO Configuration](#seo-configuration)
8. [Microservices Architecture](#microservices-architecture)
9. [Deployment](#deployment)

---

## Architecture Overview

The Arnova platform uses a decoupled architecture:

- **Frontend**: Next.js (this repository) - handles UI, routing, and client-side logic
- **Backend**: Django REST Framework - handles business logic, database, and APIs
- **Database**: PostgreSQL - stores all application data
- **Communication**: RESTful APIs with JSON responses

### Technology Stack

- Frontend: Next.js 14+, React 18+, TypeScript, Tailwind CSS v4
- Backend: Django 4.2+, Django REST Framework, PostgreSQL 14+
- Authentication: JWT tokens (djangorestframework-simplejwt)
- File Storage: Django media files or cloud storage (AWS S3, Cloudinary)

---

## Django Project Setup

### 1. Create Django Project

\`\`\`bash

# Create virtual environment

python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies

pip install django djangorestframework djangorestframework-simplejwt
pip install psycopg2-binary pillow django-cors-headers django-filter
pip install python-decouple gunicorn whitenoise

# Create project

django-admin startproject arnova_backend
cd arnova_backend

# Create apps for microservices

python manage.py startapp products
python manage.py startapp orders
python manage.py startapp users
python manage.py startapp cart
python manage.py startapp payments
\`\`\`

### 2. Configure Settings (settings.py)

\`\`\`python

# arnova_backend/settings.py

from decouple import config
from datetime import timedelta

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'django.contrib.sitemaps',  # For SEO

    # Third-party apps
    'rest_framework',
    'rest_framework_simplejwt',
    'corsheaders',
    'django_filters',

    # Local apps (microservices)
    'products',
    'orders',
    'users',
    'cart',
    'payments',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',  # Must be first
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',  # For static files
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

# CORS Configuration

CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "https://arnova.vercel.app",
    # Add your production domains
]
CORS_ALLOW_CREDENTIALS = True

# Database Configuration

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': config('DB_NAME', default='arnova_db'),
        'USER': config('DB_USER', default='postgres'),
        'PASSWORD': config('DB_PASSWORD'),
        'HOST': config('DB_HOST', default='localhost'),
        'PORT': config('DB_PORT', default='5432'),
    }
}

# REST Framework Configuration

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticatedOrReadOnly',
    ],
    'DEFAULT_FILTER_BACKENDS': [
        'django_filters.rest_framework.DjangoFilterBackend',
        'rest_framework.filters.SearchFilter',
        'rest_framework.filters.OrderingFilter',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
}

# JWT Configuration

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(hours=1),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
}

# Media Files

MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

# Static Files

STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'
\`\`\`

---

## Database Schema (PostgreSQL)

### Complete PostgreSQL Schema

\`\`\`sql
-- Users Table (extends Django's default User model)
CREATE TABLE users_profile (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE REFERENCES auth_user(id) ON DELETE CASCADE,
    phone_number VARCHAR(20),
    country_code VARCHAR(10),
    country_name VARCHAR(100),
    preferred_currency VARCHAR(3) DEFAULT 'USD',
    preferred_language VARCHAR(10) DEFAULT 'en-US',
    avatar_url TEXT,
    date_of_birth DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Products Table
CREATE TABLE products_product (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL CHECK (category IN ('clothing', 'shoes', 'bags', 'accessories')),
    subcategory VARCHAR(100),
    price DECIMAL(10, 2) NOT NULL,
    compare_at_price DECIMAL(10, 2),
    cost_price DECIMAL(10, 2),
    sku VARCHAR(100) UNIQUE,
    barcode VARCHAR(100),
    brand VARCHAR(100),
    is_featured BOOLEAN DEFAULT FALSE,
    is_new_arrival BOOLEAN DEFAULT FALSE,
    is_on_sale BOOLEAN DEFAULT FALSE,
    sale_percentage INTEGER,
    stock_quantity INTEGER DEFAULT 0,
    low_stock_threshold INTEGER DEFAULT 10,
    weight DECIMAL(8, 2),
    dimensions JSONB,  -- {length, width, height}
    material VARCHAR(255),
    care_instructions TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by_id INTEGER REFERENCES auth_user(id)
);

-- Product Images Table
CREATE TABLE products_productimage (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products_product(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    alt_text VARCHAR(255),
    is_primary BOOLEAN DEFAULT FALSE,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Product Variants Table (for sizes, colors)
CREATE TABLE products_productvariant (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products_product(id) ON DELETE CASCADE,
    size VARCHAR(20),
    color VARCHAR(50),
    color_hex VARCHAR(7),
    stock_quantity INTEGER DEFAULT 0,
    price_adjustment DECIMAL(10, 2) DEFAULT 0,
    sku VARCHAR(100) UNIQUE,
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Categories Table
CREATE TABLE products_category (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    parent_id INTEGER REFERENCES products_category(id) ON DELETE SET NULL,
    image_url TEXT,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Cart Table
CREATE TABLE cart_cart (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES auth_user(id) ON DELETE CASCADE,
    session_id VARCHAR(255),  -- For guest users
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id),
    UNIQUE(session_id)
);

-- Cart Items Table
CREATE TABLE cart_cartitem (
    id SERIAL PRIMARY KEY,
    cart_id INTEGER REFERENCES cart_cart(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products_product(id) ON DELETE CASCADE,
    variant_id INTEGER REFERENCES products_productvariant(id) ON DELETE SET NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    price DECIMAL(10, 2) NOT NULL,  -- Price at time of adding
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(cart_id, product_id, variant_id)
);

-- Saved Items (Favorites) Table
CREATE TABLE users_saveditem (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES auth_user(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products_product(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, product_id)
);

-- Orders Table
CREATE TABLE orders_order (
    id SERIAL PRIMARY KEY,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    user_id INTEGER REFERENCES auth_user(id) ON DELETE SET NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded')),

    -- Pricing
    subtotal DECIMAL(10, 2) NOT NULL,
    shipping_cost DECIMAL(10, 2) DEFAULT 0,
    tax DECIMAL(10, 2) DEFAULT 0,
    discount DECIMAL(10, 2) DEFAULT 0,
    total DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',

    -- Shipping Information
    shipping_name VARCHAR(255) NOT NULL,
    shipping_email VARCHAR(255) NOT NULL,
    shipping_phone VARCHAR(20),
    shipping_address_line1 VARCHAR(255) NOT NULL,
    shipping_address_line2 VARCHAR(255),
    shipping_city VARCHAR(100) NOT NULL,
    shipping_state VARCHAR(100),
    shipping_postal_code VARCHAR(20) NOT NULL,
    shipping_country VARCHAR(100) NOT NULL,

    -- Billing Information
    billing_name VARCHAR(255),
    billing_email VARCHAR(255),
    billing_address_line1 VARCHAR(255),
    billing_city VARCHAR(100),
    billing_postal_code VARCHAR(20),
    billing_country VARCHAR(100),

    -- Payment
    payment_method VARCHAR(50),
    payment_status VARCHAR(20) DEFAULT 'pending',
    payment_id VARCHAR(255),

    -- Tracking
    tracking_number VARCHAR(100),
    shipped_at TIMESTAMP,
    delivered_at TIMESTAMP,

    -- Notes
    customer_notes TEXT,
    admin_notes TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Order Items Table
CREATE TABLE orders_orderitem (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders_order(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products_product(id) ON DELETE SET NULL,
    variant_id INTEGER REFERENCES products_productvariant(id) ON DELETE SET NULL,
    product_name VARCHAR(255) NOT NULL,
    product_sku VARCHAR(100),
    variant_details JSONB,  -- Store size, color at time of order
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(10, 2) NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Reviews Table
CREATE TABLE products_review (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products_product(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES auth_user(id) ON DELETE CASCADE,
    order_id INTEGER REFERENCES orders_order(id) ON DELETE SET NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(255),
    comment TEXT,
    is_verified_purchase BOOLEAN DEFAULT FALSE,
    is_approved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(product_id, user_id, order_id)
);

-- Indexes for Performance
CREATE INDEX idx_products_category ON products_product(category);
CREATE INDEX idx_products_slug ON products_product(slug);
CREATE INDEX idx_products_featured ON products_product(is_featured);
CREATE INDEX idx_products_new_arrival ON products_product(is_new_arrival);
CREATE INDEX idx_products_sale ON products_product(is_on_sale);
CREATE INDEX idx_orders_user ON orders_order(user_id);
CREATE INDEX idx_orders_status ON orders_order(status);
CREATE INDEX idx_orders_number ON orders_order(order_number);
CREATE INDEX idx_cart_user ON cart_cart(user_id);
CREATE INDEX idx_cart_session ON cart_cart(session_id);
\`\`\`

---

## API Endpoints

### Base URL

\`\`\`
Development: <http://localhost:8000/api/v1/>
Production: <https://api.arnova.com/api/v1/>
\`\`\`

### Authentication Endpoints

\`\`\`
POST   /auth/register/          - Register new user
POST   /auth/login/             - Login (returns JWT tokens)
POST   /auth/refresh/           - Refresh access token
POST   /auth/logout/            - Logout (blacklist refresh token)
GET    /auth/profile/           - Get current user profile
PUT    /auth/profile/           - Update user profile
POST   /auth/password/change/   - Change password
POST   /auth/password/reset/    - Request password reset
POST   /auth/password/reset/confirm/ - Confirm password reset
\`\`\`

### Products Endpoints

\`\`\`
GET    /products/               - List all products (with filters)
GET    /products/{id}/          - Get product details
POST   /products/               - Create product (admin only)
PUT    /products/{id}/          - Update product (admin only)
DELETE /products/{id}/          - Delete product (admin only)
GET    /products/categories/    - List categories
GET    /products/new-arrivals/  - Get new arrivals
GET    /products/sale/          - Get sale items
GET    /products/featured/      - Get featured products
GET    /products/search/        - Search products
\`\`\`

**Query Parameters for Filtering:**
\`\`\`
?category=clothing
?min_price=50&max_price=200
?size=M
?color=blue
?sort=price_asc|price_desc|newest|popular
?search=jacket
?is_on_sale=true
?page=1
\`\`\`

### Cart Endpoints

\`\`\`
GET    /cart/                   - Get user's cart
POST   /cart/items/             - Add item to cart
PUT    /cart/items/{id}/        - Update cart item quantity
DELETE /cart/items/{id}/        - Remove item from cart
DELETE /cart/clear/              - Clear entire cart
POST   /cart/merge/             - Merge guest cart with user cart
\`\`\`

### Saved Items Endpoints

\`\`\`
GET    /saved/                  - Get user's saved items
POST   /saved/                  - Add item to saved
DELETE /saved/{id}/             - Remove from saved
POST   /saved/move-to-cart/{id}/ - Move saved item to cart
\`\`\`

### Orders Endpoints

\`\`\`
GET    /orders/                 - List user's orders
GET    /orders/{id}/            - Get order details
POST   /orders/                 - Create new order (checkout)
PUT    /orders/{id}/cancel/     - Cancel order
GET    /orders/{id}/track/      - Track order
\`\`\`

### Admin Endpoints

\`\`\`
GET    /admin/dashboard/        - Dashboard statistics
GET    /admin/products/         - Manage products
GET    /admin/orders/           - Manage orders
PUT    /admin/orders/{id}/status/ - Update order status
GET    /admin/users/            - Manage users
GET    /admin/analytics/        - Analytics data
\`\`\`

### Example API Response Formats

**Product List Response:**
\`\`\`json
{
  "count": 100,
  "next": "<http://api.arnova.com/api/v1/products/?page=2>",
  "previous": null,
  "results": [
    {
      "id": 1,
      "name": "Premium Cotton T-Shirt",
      "slug": "premium-cotton-t-shirt",
      "description": "Comfortable cotton t-shirt",
      "category": "clothing",
      "price": "29.99",
      "compare_at_price": "39.99",
      "is_on_sale": true,
      "sale_percentage": 25,
      "images": [
        {
          "id": 1,
          "image_url": "/media/products/tshirt.jpg",
          "is_primary": true
        }
      ],
      "variants": [
        {
          "id": 1,
          "size": "M",
          "color": "Blue",
          "color_hex": "#0000FF",
          "stock_quantity": 50,
          "is_available": true
        }
      ],
      "stock_quantity": 150,
      "is_featured": true,
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
\`\`\`

**Cart Response:**
\`\`\`json
{
  "id": 1,
  "items": [
    {
      "id": 1,
      "product": {
        "id": 1,
        "name": "Premium Cotton T-Shirt",
        "slug": "premium-cotton-t-shirt",
        "image": "/media/products/tshirt.jpg"
      },
      "variant": {
        "size": "M",
        "color": "Blue"
      },
      "quantity": 2,
      "price": "29.99",
      "total": "59.98"
    }
  ],
  "subtotal": "59.98",
  "total_items": 2
}
\`\`\`

---

## Authentication Integration

### Django Models (users/models.py)

\`\`\`python
from django.contrib.auth.models import User
from django.db import models

class Profile(models.Model):
    LANGUAGE_CHOICES = [
        ('en-US', 'English (US)'),
        ('en-GB', 'English (UK)'),
        ('sw', 'Swahili'),
    ]

    CURRENCY_CHOICES = [
        ('USD', 'US Dollar'),
        ('EUR', 'Euro'),
        ('GBP', 'British Pound'),
        ('KES', 'Kenyan Shilling'),
        ('TZS', 'Tanzanian Shilling'),
        ('UGX', 'Ugandan Shilling'),
        ('ZAR', 'South African Rand'),
        ('NGN', 'Nigerian Naira'),
        ('GHS', 'Ghanaian Cedi'),
        ('JPY', 'Japanese Yen'),
        ('CNY', 'Chinese Yuan'),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    phone_number = models.CharField(max_length=20, blank=True)
    country_code = models.CharField(max_length=10, blank=True)
    country_name = models.CharField(max_length=100, blank=True)
    preferred_currency = models.CharField(max_length=3, choices=CURRENCY_CHOICES, default='USD')
    preferred_language = models.CharField(max_length=10, choices=LANGUAGE_CHOICES, default='en-US')
    avatar_url = models.URLField(blank=True)
    date_of_birth = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username}'s Profile"
\`\`\`

### Django Serializers (users/serializers.py)

\`\`\`python
from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Profile

class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = ['phone_number', 'country_code', 'country_name',
                  'preferred_currency', 'preferred_language', 'avatar_url',
                  'date_of_birth']

class UserSerializer(serializers.ModelSerializer):
    profile = ProfileSerializer()

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'profile']
        read_only_fields = ['id']

    def update(self, instance, validated_data):
        profile_data = validated_data.pop('profile', {})
        profile = instance.profile

        # Update user fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # Update profile fields
        for attr, value in profile_data.items():
            setattr(profile, attr, value)
        profile.save()

        return instance

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    profile = ProfileSerializer()

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'first_name', 'last_name', 'profile']

    def create(self, validated_data):
        profile_data = validated_data.pop('profile')
        user = User.objects.create_user(**validated_data)
        Profile.objects.create(user=user, **profile_data)
        return user
\`\`\`

### Frontend Integration (lib/api.ts)

\`\`\`typescript
// Update this file in your Next.js project

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '<http://localhost:8000/api/v1>'

export async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem('access_token')

  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  })

  if (response.status === 401) {
    // Token expired, try to refresh
    const refreshed = await refreshToken()
    if (refreshed) {
      // Retry request with new token
      return apiRequest(endpoint, options)
    } else {
      // Redirect to login
      window.location.href = '/login'
    }
  }

  return response.json()
}

async function refreshToken() {
  const refreshToken = localStorage.getItem('refresh_token')
  if (!refreshToken) return false

  try {
    const response = await fetch(`${API_BASE_URL}/auth/refresh/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh: refreshToken }),
    })

    if (response.ok) {
      const data = await response.json()
      localStorage.setItem('access_token', data.access)
      return true
    }
  } catch (error) {
    console.error('Token refresh failed:', error)
  }

  return false
}
\`\`\`

---

## Static Files & PWA

### Django Configuration for PWA

\`\`\`python

# settings.py

# Serve PWA files

STATICFILES_DIRS = [
    BASE_DIR / 'pwa',  # Create this directory for PWA files
]

# Add to TEMPLATES

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]
\`\`\`

### Serve PWA Files (urls.py)

\`\`\`python
from django.urls import path
from django.views.generic import TemplateView
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    # ... other URLs

    # PWA files
    path('manifest.json', TemplateView.as_view(
        template_name='manifest.json',
        content_type='application/json'
    )),
    path('service-worker.js', TemplateView.as_view(
        template_name='service-worker.js',
        content_type='application/javascript'
    )),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
\`\`\`

---

## SEO Configuration

### Django Sitemap (products/sitemaps.py)

\`\`\`python
from django.contrib.sitemaps import Sitemap
from .models import Product, Category

class ProductSitemap(Sitemap):
    changefreq = "weekly"
    priority = 0.8

    def items(self):
        return Product.objects.filter(is_active=True)

    def lastmod(self, obj):
        return obj.updated_at

class CategorySitemap(Sitemap):
    changefreq = "monthly"
    priority = 0.7

    def items(self):
        return Category.objects.filter(is_active=True)

    def lastmod(self, obj):
        return obj.created_at
\`\`\`

### Register Sitemaps (urls.py)

\`\`\`python
from django.contrib.sitemaps.views import sitemap
from products.sitemaps import ProductSitemap, CategorySitemap

sitemaps = {
    'products': ProductSitemap,
    'categories': CategorySitemap,
}

urlpatterns = [
    # ... other URLs
    path('sitemap.xml', sitemap, {'sitemaps': sitemaps},
         name='django.contrib.sitemaps.views.sitemap'),
]
\`\`\`

---

## Microservices Architecture

### Service Separation

Each Django app represents an independent microservice:

1. **Products Service** (`products/`)
   - Manages products, categories, variants, images
   - Independent database tables
   - API: `/api/v1/products/`

2. **Orders Service** (`orders/`)
   - Manages orders, order items, order status
   - Independent database tables
   - API: `/api/v1/orders/`

3. **Users Service** (`users/`)
   - Manages user profiles, authentication
   - Independent database tables
   - API: `/api/v1/auth/`, `/api/v1/users/`

4. **Cart Service** (`cart/`)
   - Manages shopping cart, cart items
   - Independent database tables
   - API: `/api/v1/cart/`

5. **Payments Service** (`payments/`)
   - Manages payment processing, transactions
   - Independent database tables
   - API: `/api/v1/payments/`

### Inter-Service Communication

\`\`\`python

# Example: Orders service calling Products service

# orders/services.py

import requests
from django.conf import settings

class OrderService:
    def create_order(self, cart_items):
        # Validate product availability
        for item in cart_items:
            product = self._get_product(item['product_id'])
            if product['stock_quantity'] < item['quantity']:
                raise ValueError(f"Insufficient stock for {product['name']}")

        # Create order
        order = Order.objects.create(...)

        # Update product stock (call Products service)
        self._update_product_stock(cart_items)

        return order

    def _get_product(self, product_id):
        response = requests.get(
            f"{settings.PRODUCTS_SERVICE_URL}/api/v1/products/{product_id}/"
        )
        return response.json()

    def _update_product_stock(self, cart_items):
        for item in cart_items:
            requests.patch(
                f"{settings.PRODUCTS_SERVICE_URL}/api/v1/products/{item['product_id']}/",
                json={'stock_quantity': item['new_stock']}
            )
\`\`\`

### Docker Compose for Microservices

\`\`\`yaml

# docker-compose.yml

version: '3.8'

services:
  postgres:
    image: postgres:14
    environment:
      POSTGRES_DB: arnova_db
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  products_service:
    build: ./services/products
    command: gunicorn products.wsgi:application --bind 0.0.0.0:8001
    volumes:
      - ./services/products:/app
    ports:
      - "8001:8001"
    depends_on:
      - postgres
    environment:
      - DATABASE_URL=postgresql://postgres:${DB_PASSWORD}@postgres:5432/arnova_db

  orders_service:
    build: ./services/orders
    command: gunicorn orders.wsgi:application --bind 0.0.0.0:8002
    volumes:
      - ./services/orders:/app
    ports:
      - "8002:8002"
    depends_on:
      - postgres
    environment:
      - DATABASE_URL=postgresql://postgres:${DB_PASSWORD}@postgres:5432/arnova_db

  users_service:
    build: ./services/users
    command: gunicorn users.wsgi:application --bind 0.0.0.0:8003
    volumes:
      - ./services/users:/app
    ports:
      - "8003:8003"
    depends_on:
      - postgres
    environment:
      - DATABASE_URL=postgresql://postgres:${DB_PASSWORD}@postgres:5432/arnova_db

  cart_service:
    build: ./services/cart
    command: gunicorn cart.wsgi:application --bind 0.0.0.0:8004
    volumes:
      - ./services/cart:/app
    ports:
      - "8004:8004"
    depends_on:
      - postgres
    environment:
      - DATABASE_URL=postgresql://postgres:${DB_PASSWORD}@postgres:5432/arnova_db

  nginx:
    image: nginx:alpine
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
    ports:
      - "8000:8000"
    depends_on:
      - products_service
      - orders_service
      - users_service
      - cart_service

volumes:
  postgres_data:
\`\`\`

---

## Deployment

### Environment Variables

Create `.env` file:

\`\`\`bash

# Django

SECRET_KEY=your-secret-key-here
DEBUG=False
ALLOWED_HOSTS=arnova.com,www.arnova.com,api.arnova.com

# Database

DB_NAME=arnova_db
DB_USER=postgres
DB_PASSWORD=your-db-password
DB_HOST=localhost
DB_PORT=5432

# CORS

CORS_ALLOWED_ORIGINS=<https://arnova.com,https://www.arnova.com>

# JWT

JWT_SECRET_KEY=your-jwt-secret

# Email (for password reset)

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=<your-email@gmail.com>
EMAIL_HOST_PASSWORD=your-email-password

# AWS S3 (optional, for media files)

AWS_ACCESS_KEY_ID=your-aws-key
AWS_SECRET_ACCESS_KEY=your-aws-secret
AWS_STORAGE_BUCKET_NAME=arnova-media
AWS_S3_REGION_NAME=us-east-1

# Payment Gateway (Stripe, PayPal, etc.)

STRIPE_SECRET_KEY=your-stripe-secret
STRIPE_PUBLISHABLE_KEY=your-stripe-public
\`\`\`

### Production Deployment Steps

1. **Prepare Django for Production**
\`\`\`bash
python manage.py collectstatic --noinput
python manage.py migrate
python manage.py createsuperuser
\`\`\`

2. **Use Gunicorn**
\`\`\`bash
gunicorn arnova_backend.wsgi:application --bind 0.0.0.0:8000 --workers 4
\`\`\`

3. **Nginx Configuration**
\`\`\`nginx
server {
    listen 80;
    server_name api.arnova.com;

    location / {
        proxy_pass <http://127.0.0.1:8000>;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /static/ {
        alias /path/to/staticfiles/;
    }

    location /media/ {
        alias /path/to/media/;
    }
}
\`\`\`

4. **SSL Certificate**
\`\`\`bash
sudo certbot --nginx -d api.arnova.com
\`\`\`

---

## Testing

### Run Tests

\`\`\`bash
python manage.py test
\`\`\`

### Example Test (products/tests.py)

\`\`\`python
from django.test import TestCase
from rest_framework.test import APIClient
from .models import Product

class ProductAPITest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.product = Product.objects.create(
            name="Test Product",
            price=29.99,
            category="clothing"
        )

    def test_get_products(self):
        response = self.client.get('/api/v1/products/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data['results']), 1)
\`\`\`

---

## Support

For questions or issues with Django integration:

1. Check Django documentation: <https://docs.djangoproject.com/>
2. Check DRF documentation: <https://www.django-rest-framework.org/>
3. Review this integration guide
4. Contact the development team

---

**Last Updated**: January 2024
**Version**: 1.0.0
