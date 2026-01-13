#!/bin/bash
# Comprehensive API endpoint testing script

BASE_URL="https://127.0.0.1:8443"
COOKIE_JAR="test_cookies.txt"

echo "🧪 Testing all Arnova API endpoints..."
echo "=================================="

# Clean up previous cookies
rm -f $COOKIE_JAR

# Test 1: Get CSRF Token
echo "1. Testing CSRF Token endpoint..."
CSRF_RESPONSE=$(curl -k -s -c $COOKIE_JAR "$BASE_URL/api/csrf-token/")
echo "Response: $CSRF_RESPONSE"
CSRF_TOKEN=$(echo $CSRF_RESPONSE | grep -o '"csrfToken":"[^"]*' | cut -d'"' -f4)
echo "CSRF Token: $CSRF_TOKEN"
echo ""

# Test 2: Public endpoints (no auth required)
echo "2. Testing public endpoints..."
echo "   - Products:"
curl -k -s -b $COOKIE_JAR "$BASE_URL/api/products/" | head -100
echo ""
echo "   - Categories:"
curl -k -s -b $COOKIE_JAR "$BASE_URL/api/categories/"
echo ""
echo "   - Health check:"
curl -k -s -b $COOKIE_JAR "$BASE_URL/api/health/"
echo ""

# Test 3: Login as admin
echo "3. Testing admin login..."
LOGIN_RESPONSE=$(curl -k -s -X POST \
  -H "Content-Type: application/json" \
  -H "X-CSRFToken: $CSRF_TOKEN" \
  -H "Referer: $BASE_URL/" \
  -c $COOKIE_JAR -b $COOKIE_JAR \
  -d '{"username":"ArnovaAdmin","password":"Arnova@010126"}' \
  "$BASE_URL/api/auth/login/")
echo "Login Response: $LOGIN_RESPONSE"
echo ""

# Test 4: Admin endpoints (require auth + admin)
echo "4. Testing admin endpoints..."
echo "   - Admin Analytics:"
curl -k -s -H "X-CSRFToken: $CSRF_TOKEN" -b $COOKIE_JAR "$BASE_URL/api/admin/analytics/" | head -200
echo ""
echo "   - Admin Products:"
curl -k -s -H "X-CSRFToken: $CSRF_TOKEN" -b $COOKIE_JAR "$BASE_URL/api/admin/products/" | head -200
echo ""
echo "   - Admin Users:"
curl -k -s -H "X-CSRFToken: $CSRF_TOKEN" -b $COOKIE_JAR "$BASE_URL/api/admin/users/" | head -200
echo ""
echo "   - Admin Orders:"
curl -k -s -H "X-CSRFToken: $CSRF_TOKEN" -b $COOKIE_JAR "$BASE_URL/api/admin/orders/"
echo ""

# Test 5: Create a test product
echo "5. Testing product creation..."
CREATE_RESPONSE=$(curl -k -s -X POST \
  -H "Content-Type: application/json" \
  -H "X-CSRFToken: $CSRF_TOKEN" \
  -H "Referer: $BASE_URL/" \
  -c $COOKIE_JAR -b $COOKIE_JAR \
  -d '{
    "id": "TEST001",
    "name": "Test Product",
    "description": "A test product for API testing",
    "price": 99.99,
    "currency": "KES",
    "category_id": 1,
    "sizes": ["M", "L"],
    "colors": ["Red", "Blue"],
    "images": ["https://example.com/test.jpg"],
    "in_stock": true
  }' \
  "$BASE_URL/api/admin/products/")
echo "Create Product Response: $CREATE_RESPONSE"
echo ""

# Test 6: User endpoints (require auth)
echo "6. Testing user endpoints..."
echo "   - User Profile:"
curl -k -s -H "X-CSRFToken: $CSRF_TOKEN" -b $COOKIE_JAR "$BASE_URL/api/profile/"
echo ""
echo "   - User Cart:"
curl -k -s -H "X-CSRFToken: $CSRF_TOKEN" -b $COOKIE_JAR "$BASE_URL/api/cart/"
echo ""
echo "   - User Orders:"
curl -k -s -H "X-CSRFToken: $CSRF_TOKEN" -b $COOKIE_JAR "$BASE_URL/api/orders/"
echo ""

# Test 7: Test cart operations
echo "7. Testing cart operations..."
ADD_TO_CART=$(curl -k -s -X POST \
  -H "Content-Type: application/json" \
  -H "X-CSRFToken: $CSRF_TOKEN" \
  -H "Referer: $BASE_URL/" \
  -c $COOKIE_JAR -b $COOKIE_JAR \
  -d '{
    "product_id": "cl-001",
    "quantity": 2,
    "selected_size": "M",
    "selected_color": "Blue"
  }' \
  "$BASE_URL/api/cart/")
echo "Add to Cart Response: $ADD_TO_CART"
echo ""

# Test 8: Logout
echo "8. Testing logout..."
LOGOUT_RESPONSE=$(curl -k -s -X POST \
  -H "X-CSRFToken: $CSRF_TOKEN" \
  -H "Referer: $BASE_URL/" \
  -c $COOKIE_JAR -b $COOKIE_JAR \
  "$BASE_URL/api/auth/logout/")
echo "Logout Response: $LOGOUT_RESPONSE"
echo ""

# Test 9: Test endpoints after logout (should fail)
echo "9. Testing protected endpoints after logout..."
echo "   - Admin Analytics (should fail):"
curl -k -s -H "X-CSRFToken: $CSRF_TOKEN" -b $COOKIE_JAR "$BASE_URL/api/admin/analytics/"
echo ""

# Clean up
rm -f $COOKIE_JAR

echo "🎉 API endpoint testing completed!"
echo "Check the responses above for any errors or issues."