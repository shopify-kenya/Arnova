# Arnova Microservices Architecture Guide

This guide explains how to implement and deploy Arnova as a microservices-based application using Django.

## Architecture Overview

Arnova is designed to be split into independent microservices:

1. **Products Service** - Product catalog, categories, variants
2. **Orders Service** - Order management, fulfillment
3. **Users Service** - Authentication, user profiles
4. **Cart Service** - Shopping cart management
5. **Payments Service** - Payment processing

Each service:
- Has its own database schema (or separate database)
- Exposes REST APIs
- Can be deployed independently
- Communicates via HTTP/REST or message queues

## Service Structure

\`\`\`
arnova-backend/
├── services/
│   ├── products/
│   │   ├── manage.py
│   │   ├── products/
│   │   │   ├── settings.py
│   │   │   ├── urls.py
│   │   │   └── wsgi.py
│   │   ├── api/
│   │   │   ├── models.py
│   │   │   ├── serializers.py
│   │   │   ├── views.py
│   │   │   └── urls.py
│   │   ├── requirements.txt
│   │   └── Dockerfile
│   ├── orders/
│   ├── users/
│   ├── cart/
│   └── payments/
├── docker-compose.yml
└── nginx.conf
\`\`\`

## Setting Up Each Service

### 1. Products Service

**Database Tables:**
- products_product
- products_productimage
- products_productvariant
- products_category
- products_review

**API Endpoints:**
- GET /api/v1/products/
- GET /api/v1/products/{id}/
- POST /api/v1/products/ (admin)
- PUT /api/v1/products/{id}/ (admin)
- DELETE /api/v1/products/{id}/ (admin)

**Environment Variables:**
\`\`\`bash
PRODUCTS_DB_NAME=arnova_products
PRODUCTS_DB_USER=products_user
PRODUCTS_DB_PASSWORD=secure_password
PRODUCTS_DB_HOST=postgres
PRODUCTS_DB_PORT=5432
\`\`\`

### 2. Orders Service

**Database Tables:**
- orders_order
- orders_orderitem
- orders_orderhistory

**API Endpoints:**
- GET /api/v1/orders/
- GET /api/v1/orders/{id}/
- POST /api/v1/orders/
- PUT /api/v1/orders/{id}/cancel/
- GET /api/v1/orders/{id}/track/

**Dependencies:**
- Products Service (to validate product availability)
- Users Service (to get user details)
- Payments Service (to process payments)

### 3. Users Service

**Database Tables:**
- auth_user (Django default)
- users_profile
- users_saveditem

**API Endpoints:**
- POST /api/v1/auth/register/
- POST /api/v1/auth/login/
- POST /api/v1/auth/refresh/
- GET /api/v1/auth/profile/
- PUT /api/v1/auth/profile/

### 4. Cart Service

**Database Tables:**
- cart_cart
- cart_cartitem

**API Endpoints:**
- GET /api/v1/cart/
- POST /api/v1/cart/items/
- PUT /api/v1/cart/items/{id}/
- DELETE /api/v1/cart/items/{id}/
- DELETE /api/v1/cart/clear/

**Dependencies:**
- Products Service (to get product details and prices)

### 5. Payments Service

**Database Tables:**
- payments_transaction

**API Endpoints:**
- POST /api/v1/payments/process/
- GET /api/v1/payments/{id}/
- POST /api/v1/payments/{id}/refund/

**Dependencies:**
- Orders Service (to update order payment status)

## Inter-Service Communication

### Option 1: Direct HTTP Calls

\`\`\`python
# orders/services.py
import requests
from django.conf import settings

class OrderService:
    def create_order(self, user_id, cart_items):
        # Get product details from Products Service
        for item in cart_items:
            response = requests.get(
                f"{settings.PRODUCTS_SERVICE_URL}/api/v1/products/{item['product_id']}/"
            )
            product = response.json()
            
            # Validate stock
            if product['stock_quantity'] < item['quantity']:
                raise ValueError(f"Insufficient stock for {product['name']}")
        
        # Create order
        order = Order.objects.create(...)
        
        # Update stock in Products Service
        for item in cart_items:
            requests.patch(
                f"{settings.PRODUCTS_SERVICE_URL}/api/v1/products/{item['product_id']}/",
                json={'stock_quantity': product['stock_quantity'] - item['quantity']},
                headers={'Authorization': f'Bearer {settings.SERVICE_TOKEN}'}
            )
        
        return order
\`\`\`

### Option 2: Message Queue (RabbitMQ/Redis)

\`\`\`python
# orders/services.py
import pika

class OrderService:
    def create_order(self, user_id, cart_items):
        order = Order.objects.create(...)
        
        # Publish event to message queue
        connection = pika.BlockingConnection(pika.ConnectionParameters('rabbitmq'))
        channel = connection.channel()
        channel.queue_declare(queue='order_created')
        
        message = {
            'order_id': order.id,
            'items': cart_items
        }
        
        channel.basic_publish(
            exchange='',
            routing_key='order_created',
            body=json.dumps(message)
        )
        
        connection.close()
        return order

# products/consumers.py
import pika
import json

def consume_order_created():
    connection = pika.BlockingConnection(pika.ConnectionParameters('rabbitmq'))
    channel = connection.channel()
    channel.queue_declare(queue='order_created')
    
    def callback(ch, method, properties, body):
        data = json.loads(body)
        # Update product stock
        for item in data['items']:
            product = Product.objects.get(id=item['product_id'])
            product.stock_quantity -= item['quantity']
            product.save()
    
    channel.basic_consume(queue='order_created', on_message_callback=callback, auto_ack=True)
    channel.start_consuming()
\`\`\`

## Docker Compose Setup

\`\`\`yaml
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
    networks:
      - arnova-network

  redis:
    image: redis:7-alpine
    networks:
      - arnova-network

  rabbitmq:
    image: rabbitmq:3-management
    ports:
      - "15672:15672"
    networks:
      - arnova-network

  products-service:
    build: ./services/products
    command: gunicorn products.wsgi:application --bind 0.0.0.0:8001
    environment:
      - DATABASE_URL=postgresql://postgres:${DB_PASSWORD}@postgres:5432/arnova_db
      - REDIS_URL=redis://redis:6379/0
    depends_on:
      - postgres
      - redis
    networks:
      - arnova-network

  orders-service:
    build: ./services/orders
    command: gunicorn orders.wsgi:application --bind 0.0.0.0:8002
    environment:
      - DATABASE_URL=postgresql://postgres:${DB_PASSWORD}@postgres:5432/arnova_db
      - PRODUCTS_SERVICE_URL=http://products-service:8001
      - USERS_SERVICE_URL=http://users-service:8003
      - PAYMENTS_SERVICE_URL=http://payments-service:8005
    depends_on:
      - postgres
      - products-service
    networks:
      - arnova-network

  users-service:
    build: ./services/users
    command: gunicorn users.wsgi:application --bind 0.0.0.0:8003
    environment:
      - DATABASE_URL=postgresql://postgres:${DB_PASSWORD}@postgres:5432/arnova_db
    depends_on:
      - postgres
    networks:
      - arnova-network

  cart-service:
    build: ./services/cart
    command: gunicorn cart.wsgi:application --bind 0.0.0.0:8004
    environment:
      - DATABASE_URL=postgresql://postgres:${DB_PASSWORD}@postgres:5432/arnova_db
      - PRODUCTS_SERVICE_URL=http://products-service:8001
      - REDIS_URL=redis://redis:6379/1
    depends_on:
      - postgres
      - redis
      - products-service
    networks:
      - arnova-network

  payments-service:
    build: ./services/payments
    command: gunicorn payments.wsgi:application --bind 0.0.0.0:8005
    environment:
      - DATABASE_URL=postgresql://postgres:${DB_PASSWORD}@postgres:5432/arnova_db
      - STRIPE_SECRET_KEY=${STRIPE_SECRET_KEY}
      - ORDERS_SERVICE_URL=http://orders-service:8002
    depends_on:
      - postgres
    networks:
      - arnova-network

  nginx:
    image: nginx:alpine
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
    ports:
      - "8000:8000"
    depends_on:
      - products-service
      - orders-service
      - users-service
      - cart-service
      - payments-service
    networks:
      - arnova-network

networks:
  arnova-network:
    driver: bridge

volumes:
  postgres_data:
\`\`\`

## Nginx Configuration

\`\`\`nginx
events {
    worker_connections 1024;
}

http {
    upstream products {
        server products-service:8001;
    }

    upstream orders {
        server orders-service:8002;
    }

    upstream users {
        server users-service:8003;
    }

    upstream cart {
        server cart-service:8004;
    }

    upstream payments {
        server payments-service:8005;
    }

    server {
        listen 8000;
        server_name api.arnova.com;

        location /api/v1/products/ {
            proxy_pass http://products;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }

        location /api/v1/orders/ {
            proxy_pass http://orders;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }

        location /api/v1/auth/ {
            proxy_pass http://users;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }

        location /api/v1/cart/ {
            proxy_pass http://cart;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }

        location /api/v1/payments/ {
            proxy_pass http://payments;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }
    }
}
\`\`\`

## Deployment

### Development
\`\`\`bash
docker-compose up --build
\`\`\`

### Production (Kubernetes)

Create Kubernetes manifests for each service:

\`\`\`yaml
# products-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: products-service
spec:
  replicas: 3
  selector:
    matchLabels:
      app: products-service
  template:
    metadata:
      labels:
        app: products-service
    spec:
      containers:
      - name: products
        image: arnova/products-service:latest
        ports:
        - containerPort: 8001
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: db-secrets
              key: database-url
---
apiVersion: v1
kind: Service
metadata:
  name: products-service
spec:
  selector:
    app: products-service
  ports:
  - port: 8001
    targetPort: 8001
\`\`\`

Deploy:
\`\`\`bash
kubectl apply -f products-deployment.yaml
kubectl apply -f orders-deployment.yaml
kubectl apply -f users-deployment.yaml
kubectl apply -f cart-deployment.yaml
kubectl apply -f payments-deployment.yaml
\`\`\`

## Monitoring & Logging

Use centralized logging (ELK Stack) and monitoring (Prometheus + Grafana):

\`\`\`yaml
# docker-compose.monitoring.yml
services:
  prometheus:
    image: prom/prometheus
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
    ports:
      - "9090:9090"

  grafana:
    image: grafana/grafana
    ports:
      - "3001:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin

  elasticsearch:
    image: elasticsearch:8.5.0
    environment:
      - discovery.type=single-node

  logstash:
    image: logstash:8.5.0
    volumes:
      - ./logstash.conf:/usr/share/logstash/pipeline/logstash.conf

  kibana:
    image: kibana:8.5.0
    ports:
      - "5601:5601"
\`\`\`

## Best Practices

1. **Service Independence** - Each service should be deployable independently
2. **API Versioning** - Use /api/v1/, /api/v2/ for backward compatibility
3. **Circuit Breakers** - Implement circuit breakers for inter-service calls
4. **Caching** - Use Redis for caching frequently accessed data
5. **Database per Service** - Each service should have its own database schema
6. **Event-Driven** - Use message queues for asynchronous communication
7. **Health Checks** - Implement /health endpoints for each service
8. **Authentication** - Use JWT tokens shared across services
9. **Rate Limiting** - Implement rate limiting per service
10. **Documentation** - Keep API documentation up to date

---

**For questions:** devops@arnova.com
