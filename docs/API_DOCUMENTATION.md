# Arnova API Documentation

**Base URL:** `/api/` (same origin in unified mode)  
**Auth:** Session cookies + CSRF (`X-CSRFToken` header)

This document is a practical overview of request/response shapes for the current
implementation. For a canonical endpoint list, see `docs/API_ENDPOINTS.md`.

## Authentication

### Get CSRF Token

`GET /api/csrf-token/`

Response:
```json
{ "csrfToken": "<token>", "success": true }
```

### Login

`POST /api/auth/login/`

Request:
```json
{ "username": "jane", "password": "secret" }
```

Response (success):
```json
{
  "success": true,
  "redirect": "/",
  "user": {
    "id": 1,
    "username": "jane",
    "email": "jane@example.com",
    "is_staff": false,
    "role": "buyer"
  }
}
```

Notes:
- `username` may be an email address.
- Rate limited to 5 requests/min.

### Register

`POST /api/auth/register/`

Request:
```json
{
  "username": "jane",
  "email": "jane@example.com",
  "password": "secret",
  "password_confirm": "secret"
}
```

Response (success):
```json
{ "success": true, "message": "User created successfully" }
```

Notes:
- Rate limited to 3 requests/min.

### Logout

`POST /api/auth/logout/`

Response:
```json
{ "success": true }
```

## Products

### List Products

`GET /api/products/`

Response:
```json
{
  "products": [
    {
      "id": 1,
      "name": "Premium Cotton T-Shirt",
      "description": "Comfortable and stylish",
      "price": 29.99,
      "sale_price": 19.99,
      "currency": "USD",
      "base_currency": "KES",
      "category": "Clothing",
      "sizes": ["S", "M"],
      "colors": ["Blue"],
      "images": ["/placeholder.svg"],
      "in_stock": true,
      "is_new": true,
      "on_sale": true,
      "rating": 4.5,
      "reviews": 12
    }
  ]
}
```

Notes:
- Rate limited to 100 requests/hour.

### Product Detail

`GET /api/products/<id>/`

Response:
```json
{
  "id": 1,
  "name": "Premium Cotton T-Shirt",
  "description": "Comfortable and stylish",
  "price": 29.99,
  "salePrice": 19.99,
  "category": "Clothing",
  "sizes": ["S", "M"],
  "colors": ["Blue"],
  "images": ["/placeholder.svg"],
  "inStock": true,
  "isNew": true,
  "onSale": true,
  "rating": 4.5,
  "reviews": 12
}
```

### Product Reviews

`GET /api/products/<id>/reviews/`

Response:
```json
{
  "reviews": [
    {
      "id": 10,
      "user": "jane",
      "rating": 5,
      "comment": "Great fit!",
      "created_at": "2026-02-04T12:00:00Z"
    }
  ],
  "average_rating": 4.5,
  "review_count": 12
}
```

`POST /api/products/<id>/review/` (auth required)

Request:
```json
{ "rating": 5, "comment": "Great fit!" }
```

## Cart

### Get Cart

`GET /api/cart/`

Response (authenticated):
```json
{
  "items": [
    {
      "id": 5,
      "product": { "id": 1, "name": "T-Shirt", "price": 29.99, "images": [] },
      "quantity": 2,
      "selected_size": "M",
      "selected_color": "Blue"
    }
  ],
  "authenticated": true
}
```

Response (unauthenticated):
```json
{ "items": [], "authenticated": false }
```

### Add to Cart

`POST /api/cart/add/` (auth required)

Request:
```json
{
  "product_id": 1,
  "quantity": 2,
  "selected_size": "M",
  "selected_color": "Blue"
}
```

Response:
```json
{ "success": true, "item_id": 5 }
```

### Update/Delete Cart Item

`PUT /api/cart/<item_id>/`  
`DELETE /api/cart/<item_id>/`

## Saved Items

`GET /api/saved/` returns empty when unauthenticated.  
`POST /api/saved/add/` (auth required)  
`DELETE /api/saved/<id>/` (auth required)

## Profile & Orders

`GET /api/profile/` (auth required)  
`PUT /api/profile/` (auth required)  
`GET /api/orders/` (auth required)

## Payments

`POST /api/payment/process/`  
`POST /api/payment/validate-card/`  
`POST /api/payment/mpesa/callback/`  
`GET /api/payment/mpesa/status/<checkout_id>/`

Notes:
- Payment processing is rate limited to 10 requests/hour.

## Notifications

`GET /api/notifications/`  
`POST /api/notifications/<id>/read/`  
`POST /api/notifications/mark-all-read/`

## Admin API

All admin API endpoints require staff authentication:

- `GET /api/admin/orders/`
- `GET /api/admin/products/`
- `GET /api/admin/users/`
- `GET/PUT/DELETE /api/admin/products/<id>/`
- `GET/PUT/DELETE /api/admin/users/<id>/`
- `GET /api/admin/analytics/`
- `GET /api/admin/settings/`
