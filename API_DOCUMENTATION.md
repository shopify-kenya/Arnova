# Arnova E-commerce API Documentation

**Version:** 1.0.0  
**Base URL:** `https://api.arnova.com/api/v1/`  
**Authentication:** JWT Bearer Token

---

## Table of Contents

1. [Authentication](#authentication)
2. [Products](#products)
3. [Cart](#cart)
4. [Saved Items](#saved-items)
5. [Orders](#orders)
6. [User Profile](#user-profile)
7. [Admin](#admin)
8. [Search & Filters](#search--filters)
9. [Error Handling](#error-handling)
10. [Rate Limiting](#rate-limiting)

---

## Authentication

### Register User

**Endpoint:** `POST /auth/register/`

**Request Body:**
\`\`\`json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "first_name": "John",
  "last_name": "Doe",
  "profile": {
    "phone_number": "+1234567890",
    "country_code": "+1",
    "country_name": "United States",
    "preferred_currency": "USD",
    "preferred_language": "en-US"
  }
}
\`\`\`

**Response:** `201 Created`
\`\`\`json
{
  "id": 1,
  "username": "johndoe",
  "email": "john@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "profile": {
    "phone_number": "+1234567890",
    "country_code": "+1",
    "country_name": "United States",
    "preferred_currency": "USD",
    "preferred_language": "en-US"
  },
  "tokens": {
    "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
    "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
  }
}
\`\`\`

---

### Login

**Endpoint:** `POST /auth/login/`

**Request Body:**
\`\`\`json
{
  "username": "johndoe",
  "password": "SecurePass123!"
}
\`\`\`

**Response:** `200 OK`
\`\`\`json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "user": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "profile": {
      "phone_number": "+1234567890",
      "preferred_currency": "USD",
      "preferred_language": "en-US"
    }
  }
}
\`\`\`

---

### Refresh Token

**Endpoint:** `POST /auth/refresh/`

**Request Body:**
\`\`\`json
{
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
\`\`\`

**Response:** `200 OK`
\`\`\`json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
\`\`\`

---

### Get Current User Profile

**Endpoint:** `GET /auth/profile/`  
**Authentication:** Required

**Response:** `200 OK`
\`\`\`json
{
  "id": 1,
  "username": "johndoe",
  "email": "john@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "profile": {
    "phone_number": "+1234567890",
    "country_code": "+1",
    "country_name": "United States",
    "preferred_currency": "USD",
    "preferred_language": "en-US",
    "avatar_url": "https://cdn.arnova.com/avatars/johndoe.jpg",
    "date_of_birth": "1990-01-15"
  }
}
\`\`\`

---

### Update Profile

**Endpoint:** `PUT /auth/profile/`  
**Authentication:** Required

**Request Body:**
\`\`\`json
{
  "first_name": "John",
  "last_name": "Doe",
  "profile": {
    "phone_number": "+1234567890",
    "preferred_currency": "EUR",
    "preferred_language": "en-GB"
  }
}
\`\`\`

**Response:** `200 OK`

---

## Products

### List Products

**Endpoint:** `GET /products/`

**Query Parameters:**
- `category` - Filter by category (clothing, shoes, bags, accessories)
- `min_price` - Minimum price
- `max_price` - Maximum price
- `size` - Filter by size
- `color` - Filter by color
- `is_on_sale` - Filter sale items (true/false)
- `is_featured` - Filter featured items (true/false)
- `is_new_arrival` - Filter new arrivals (true/false)
- `sort` - Sort by (price_asc, price_desc, newest, popular, name_asc, name_desc)
- `search` - Search query
- `page` - Page number (default: 1)
- `page_size` - Items per page (default: 20, max: 100)

**Example:** `GET /products/?category=clothing&min_price=50&max_price=200&sort=price_asc&page=1`

**Response:** `200 OK`
\`\`\`json
{
  "count": 150,
  "next": "https://api.arnova.com/api/v1/products/?page=2",
  "previous": null,
  "results": [
    {
      "id": 1,
      "name": "Premium Cotton T-Shirt",
      "slug": "premium-cotton-t-shirt",
      "description": "Comfortable and stylish cotton t-shirt",
      "category": "clothing",
      "price": "29.99",
      "compare_at_price": "39.99",
      "is_on_sale": true,
      "sale_percentage": 25,
      "stock_quantity": 150,
      "is_featured": true,
      "is_new_arrival": false,
      "brand": "Arnova Essentials",
      "material": "100% Cotton",
      "images": [
        {
          "id": 1,
          "image_url": "https://cdn.arnova.com/products/tshirt-1.jpg",
          "alt_text": "Premium Cotton T-Shirt - Front View",
          "is_primary": true
        },
        {
          "id": 2,
          "image_url": "https://cdn.arnova.com/products/tshirt-2.jpg",
          "alt_text": "Premium Cotton T-Shirt - Back View",
          "is_primary": false
        }
      ],
      "variants": [
        {
          "id": 1,
          "size": "S",
          "color": "Blue",
          "color_hex": "#0000FF",
          "stock_quantity": 30,
          "is_available": true
        },
        {
          "id": 2,
          "size": "M",
          "color": "Blue",
          "color_hex": "#0000FF",
          "stock_quantity": 50,
          "is_available": true
        }
      ],
      "avg_rating": 4.5,
      "review_count": 24,
      "created_at": "2024-01-15T10:30:00Z"
    }
  ]
}
\`\`\`

---

### Get Product Details

**Endpoint:** `GET /products/{id}/`

**Response:** `200 OK`
\`\`\`json
{
  "id": 1,
  "name": "Premium Cotton T-Shirt",
  "slug": "premium-cotton-t-shirt",
  "description": "Comfortable and stylish cotton t-shirt made from 100% organic cotton. Perfect for everyday wear.",
  "category": "clothing",
  "subcategory": "T-Shirts",
  "price": "29.99",
  "compare_at_price": "39.99",
  "is_on_sale": true,
  "sale_percentage": 25,
  "stock_quantity": 150,
  "low_stock_threshold": 10,
  "sku": "ARN-TS-001",
  "brand": "Arnova Essentials",
  "material": "100% Organic Cotton",
  "care_instructions": "Machine wash cold, tumble dry low",
  "weight": 0.2,
  "dimensions": {
    "length": 70,
    "width": 50,
    "height": 2
  },
  "is_featured": true,
  "is_new_arrival": false,
  "images": [
    {
      "id": 1,
      "image_url": "https://cdn.arnova.com/products/tshirt-1.jpg",
      "alt_text": "Premium Cotton T-Shirt - Front View",
      "is_primary": true,
      "display_order": 0
    }
  ],
  "variants": [
    {
      "id": 1,
      "size": "S",
      "color": "Blue",
      "color_hex": "#0000FF",
      "stock_quantity": 30,
      "price_adjustment": "0.00",
      "is_available": true,
      "sku": "ARN-TS-001-S-BLU"
    }
  ],
  "reviews": [
    {
      "id": 1,
      "user": {
        "id": 5,
        "username": "jane_smith",
        "first_name": "Jane"
      },
      "rating": 5,
      "title": "Excellent quality!",
      "comment": "Love this t-shirt. Very comfortable and fits perfectly.",
      "is_verified_purchase": true,
      "created_at": "2024-01-20T14:30:00Z"
    }
  ],
  "avg_rating": 4.5,
  "review_count": 24,
  "related_products": [2, 3, 4],
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-20T08:15:00Z"
}
\`\`\`

---

### Create Product (Admin Only)

**Endpoint:** `POST /products/`  
**Authentication:** Required (Admin)

**Request Body:**
\`\`\`json
{
  "name": "Leather Jacket",
  "slug": "leather-jacket",
  "description": "Premium leather jacket",
  "category": "clothing",
  "price": "299.99",
  "compare_at_price": "399.99",
  "stock_quantity": 50,
  "sku": "ARN-LJ-001",
  "brand": "Arnova Premium",
  "material": "Genuine Leather",
  "is_featured": true,
  "images": [
    {
      "image_url": "https://cdn.arnova.com/products/jacket-1.jpg",
      "alt_text": "Leather Jacket",
      "is_primary": true
    }
  ],
  "variants": [
    {
      "size": "M",
      "color": "Black",
      "color_hex": "#000000",
      "stock_quantity": 20
    }
  ]
}
\`\`\`

**Response:** `201 Created`

---

### Search Products

**Endpoint:** `GET /products/search/`

**Query Parameters:**
- `q` - Search query (searches name, description, brand, sku)
- `category` - Filter by category
- `page` - Page number

**Example:** `GET /products/search/?q=leather&category=clothing`

**Response:** `200 OK` (same format as List Products)

---

## Cart

### Get Cart

**Endpoint:** `GET /cart/`  
**Authentication:** Required

**Response:** `200 OK`
\`\`\`json
{
  "id": 1,
  "user_id": 1,
  "currency": "USD",
  "items": [
    {
      "id": 1,
      "product": {
        "id": 1,
        "name": "Premium Cotton T-Shirt",
        "slug": "premium-cotton-t-shirt",
        "price": "29.99",
        "image": "https://cdn.arnova.com/products/tshirt-1.jpg"
      },
      "variant": {
        "id": 1,
        "size": "M",
        "color": "Blue",
        "color_hex": "#0000FF"
      },
      "quantity": 2,
      "price": "29.99",
      "total": "59.98"
    },
    {
      "id": 2,
      "product": {
        "id": 5,
        "name": "Designer Handbag",
        "slug": "designer-handbag",
        "price": "149.99",
        "image": "https://cdn.arnova.com/products/handbag-1.jpg"
      },
      "variant": null,
      "quantity": 1,
      "price": "149.99",
      "total": "149.99"
    }
  ],
  "subtotal": "209.97",
  "total_items": 3,
  "created_at": "2024-01-15T10:00:00Z",
  "updated_at": "2024-01-20T14:30:00Z"
}
\`\`\`

---

### Add Item to Cart

**Endpoint:** `POST /cart/items/`  
**Authentication:** Required

**Request Body:**
\`\`\`json
{
  "product_id": 1,
  "variant_id": 1,
  "quantity": 2
}
\`\`\`

**Response:** `201 Created`
\`\`\`json
{
  "id": 1,
  "product": {
    "id": 1,
    "name": "Premium Cotton T-Shirt",
    "price": "29.99",
    "image": "https://cdn.arnova.com/products/tshirt-1.jpg"
  },
  "variant": {
    "id": 1,
    "size": "M",
    "color": "Blue"
  },
  "quantity": 2,
  "price": "29.99",
  "total": "59.98"
}
\`\`\`

---

### Update Cart Item

**Endpoint:** `PUT /cart/items/{id}/`  
**Authentication:** Required

**Request Body:**
\`\`\`json
{
  "quantity": 3
}
\`\`\`

**Response:** `200 OK`

---

### Remove Cart Item

**Endpoint:** `DELETE /cart/items/{id}/`  
**Authentication:** Required

**Response:** `204 No Content`

---

### Clear Cart

**Endpoint:** `DELETE /cart/clear/`  
**Authentication:** Required

**Response:** `204 No Content`

---

## Saved Items

### Get Saved Items

**Endpoint:** `GET /saved/`  
**Authentication:** Required

**Response:** `200 OK`
\`\`\`json
{
  "count": 5,
  "results": [
    {
      "id": 1,
      "product": {
        "id": 3,
        "name": "Running Shoes",
        "slug": "running-shoes",
        "price": "89.99",
        "compare_at_price": "119.99",
        "is_on_sale": true,
        "image": "https://cdn.arnova.com/products/shoes-1.jpg",
        "stock_quantity": 45,
        "is_available": true
      },
      "created_at": "2024-01-18T09:15:00Z"
    }
  ]
}
\`\`\`

---

### Add to Saved Items

**Endpoint:** `POST /saved/`  
**Authentication:** Required

**Request Body:**
\`\`\`json
{
  "product_id": 3
}
\`\`\`

**Response:** `201 Created`

---

### Remove from Saved Items

**Endpoint:** `DELETE /saved/{id}/`  
**Authentication:** Required

**Response:** `204 No Content`

---

### Move Saved Item to Cart

**Endpoint:** `POST /saved/move-to-cart/{id}/`  
**Authentication:** Required

**Request Body:**
\`\`\`json
{
  "variant_id": 5,
  "quantity": 1
}
\`\`\`

**Response:** `200 OK`

---

## Orders

### List Orders

**Endpoint:** `GET /orders/`  
**Authentication:** Required

**Query Parameters:**
- `status` - Filter by status
- `page` - Page number

**Response:** `200 OK`
\`\`\`json
{
  "count": 12,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": 1,
      "order_number": "ARN-2024-00001",
      "status": "delivered",
      "payment_status": "paid",
      "total": "209.97",
      "currency": "USD",
      "items_count": 3,
      "created_at": "2024-01-15T10:00:00Z",
      "delivered_at": "2024-01-20T14:30:00Z"
    }
  ]
}
\`\`\`

---

### Get Order Details

**Endpoint:** `GET /orders/{id}/`  
**Authentication:** Required

**Response:** `200 OK`
\`\`\`json
{
  "id": 1,
  "order_number": "ARN-2024-00001",
  "status": "delivered",
  "payment_status": "paid",
  "fulfillment_status": "fulfilled",
  
  "subtotal": "209.97",
  "shipping_cost": "10.00",
  "tax": "18.00",
  "discount": "0.00",
  "total": "237.97",
  "currency": "USD",
  
  "shipping_address": {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "address_line1": "123 Main St",
    "address_line2": "Apt 4B",
    "city": "New York",
    "state": "NY",
    "postal_code": "10001",
    "country": "United States"
  },
  
  "payment_method": "credit_card",
  "tracking_number": "1Z999AA10123456784",
  "carrier": "UPS",
  
  "items": [
    {
      "id": 1,
      "product_name": "Premium Cotton T-Shirt",
      "product_sku": "ARN-TS-001",
      "product_image_url": "https://cdn.arnova.com/products/tshirt-1.jpg",
      "variant_details": {
        "size": "M",
        "color": "Blue"
      },
      "quantity": 2,
      "unit_price": "29.99",
      "total_price": "59.98"
    }
  ],
  
  "created_at": "2024-01-15T10:00:00Z",
  "shipped_at": "2024-01-17T08:00:00Z",
  "delivered_at": "2024-01-20T14:30:00Z"
}
\`\`\`

---

### Create Order (Checkout)

**Endpoint:** `POST /orders/`  
**Authentication:** Required

**Request Body:**
\`\`\`json
{
  "shipping_address": {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "address_line1": "123 Main St",
    "address_line2": "Apt 4B",
    "city": "New York",
    "state": "NY",
    "postal_code": "10001",
    "country": "United States"
  },
  "billing_same_as_shipping": true,
  "payment_method": "credit_card",
  "payment_id": "pi_1234567890",
  "customer_notes": "Please ring doorbell"
}
\`\`\`

**Response:** `201 Created`

---

### Cancel Order

**Endpoint:** `PUT /orders/{id}/cancel/`  
**Authentication:** Required

**Request Body:**
\`\`\`json
{
  "cancellation_reason": "Changed my mind"
}
\`\`\`

**Response:** `200 OK`

---

### Track Order

**Endpoint:** `GET /orders/{id}/track/`  
**Authentication:** Required

**Response:** `200 OK`
\`\`\`json
{
  "order_number": "ARN-2024-00001",
  "status": "shipped",
  "tracking_number": "1Z999AA10123456784",
  "carrier": "UPS",
  "estimated_delivery": "2024-01-22",
  "history": [
    {
      "status": "pending",
      "comment": "Order placed",
      "created_at": "2024-01-15T10:00:00Z"
    },
    {
      "status": "processing",
      "comment": "Order confirmed and being prepared",
      "created_at": "2024-01-16T09:00:00Z"
    },
    {
      "status": "shipped",
      "comment": "Order shipped via UPS",
      "created_at": "2024-01-17T08:00:00Z"
    }
  ]
}
\`\`\`

---

## Admin

### Dashboard Statistics

**Endpoint:** `GET /admin/dashboard/`  
**Authentication:** Required (Admin)

**Response:** `200 OK`
\`\`\`json
{
  "total_revenue": "125430.50",
  "total_orders": 1247,
  "total_customers": 856,
  "total_products": 342,
  "pending_orders": 23,
  "low_stock_products": 12,
  "recent_orders": [...],
  "top_products": [...],
  "revenue_chart": {
    "labels": ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    "data": [12500, 15300, 18200, 21400, 19800, 22100]
  }
}
\`\`\`

---

### Manage Products

**Endpoint:** `GET /admin/products/`  
**Authentication:** Required (Admin)

**Query Parameters:**
- `search` - Search products
- `category` - Filter by category
- `status` - Filter by status (active, inactive, out_of_stock)
- `page` - Page number

**Response:** `200 OK` (same format as List Products with additional admin fields)

---

### Update Order Status

**Endpoint:** `PUT /admin/orders/{id}/status/`  
**Authentication:** Required (Admin)

**Request Body:**
\`\`\`json
{
  "status": "shipped",
  "tracking_number": "1Z999AA10123456784",
  "carrier": "UPS",
  "admin_notes": "Shipped via UPS Ground"
}
\`\`\`

**Response:** `200 OK`

---

## Error Handling

All errors follow this format:

\`\`\`json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request data",
    "details": {
      "email": ["This field is required"],
      "password": ["Password must be at least 8 characters"]
    }
  }
}
\`\`\`

### Common Error Codes

- `400` - Bad Request (validation errors)
- `401` - Unauthorized (missing or invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (duplicate resource)
- `429` - Too Many Requests (rate limit exceeded)
- `500` - Internal Server Error

---

## Rate Limiting

- **Anonymous users:** 100 requests per hour
- **Authenticated users:** 1000 requests per hour
- **Admin users:** 5000 requests per hour

Rate limit headers:
\`\`\`
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1640995200
\`\`\`

---

## Pagination

All list endpoints support pagination:

\`\`\`json
{
  "count": 150,
  "next": "https://api.arnova.com/api/v1/products/?page=2",
  "previous": null,
  "results": [...]
}
\`\`\`

---

## Webhooks

Subscribe to events:

- `order.created`
- `order.updated`
- `order.cancelled`
- `payment.succeeded`
- `payment.failed`
- `product.created`
- `product.updated`
- `product.out_of_stock`

Configure webhooks in admin dashboard.

---

**For support:** api-support@arnova.com  
**Documentation:** https://docs.arnova.com
