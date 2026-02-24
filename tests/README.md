# Tests

This directory contains all test files for the Arnova project.

## Running Tests

### Redis Connection Test

```bash
python tests/test_redis.py
```

### API Tests

```bash
python tests/test_api.py
```

### Payment Endpoint Tests

```bash
python tests/test_payment_endpoints.py
```

### Permission Tests

```bash
python tests/test_permissions.py
```

### Django Unit Tests

```bash
python manage.py test
```

## Test Files

- `test_redis.py` - Tests Redis cache connection and functionality
- `test_api.py` - Tests GraphQL API endpoints
- `test_payment_endpoints.py` - Tests payment-related GraphQL operations
- `test_permissions.py` - Tests user permissions and roles
