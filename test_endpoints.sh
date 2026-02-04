#!/bin/bash
# Comprehensive API endpoint testing script

BASE_URL="${BASE_URL:-https://127.0.0.1:8443}"
COOKIE_JAR="test_cookies.txt"

echo "🧪 Testing all Arnova API endpoints..."
echo "=================================="

# Clean up previous cookies
rm -f $COOKIE_JAR

# Test 1: Get CSRF Token
echo "1. Testing CSRF Token endpoint..."
CSRF_RESPONSE=$(curl -k -s -c $COOKIE_JAR "$BASE_URL/api/csrf-token/")
echo "Response: $CSRF_RESPONSE"
CSRF_TOKEN=$(python -c 'import json,sys; 
import sys
import json
data = json.loads(sys.stdin.read() or "{}")
print(data.get("csrfToken",""))' <<< "$CSRF_RESPONSE")
echo "CSRF Token: $CSRF_TOKEN"
echo ""

# Test 2: Public endpoints (no auth required)
echo "2. Testing public endpoints..."
echo "   - Products:"
PRODUCTS_RESPONSE=$(curl -k -s -b $COOKIE_JAR "$BASE_URL/api/products/")
echo "$PRODUCTS_RESPONSE" | head -100
echo ""
echo "   - Categories:"
categories_response=$(curl -k -s -b $COOKIE_JAR "$BASE_URL/api/categories/")
echo "$categories_response"
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

# Refresh CSRF token after login (token can rotate on auth)
CSRF_RESPONSE=$(curl -k -s -b $COOKIE_JAR -c $COOKIE_JAR "$BASE_URL/api/csrf-token/")
CSRF_TOKEN=$(python -c 'import json,sys; 
data=json.loads(sys.stdin.read() or "{}");
print(data.get("csrfToken",""))' <<< "$CSRF_RESPONSE")

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

# Extract a category id for product creation
CATEGORY_ID=$(python -c 'import json,sys; 
data=json.loads(sys.stdin.read() or "{}"); 
categories=data.get("categories") or [];
print(categories[0].get("id","") if categories else "")' <<< "$categories_response")

# Extract a product id/size/color for cart tests
PRODUCT_ID=$(python -c 'import json,sys; 
data=json.loads(sys.stdin.read() or "{}"); 
products=data.get("products") or [];
print(products[0].get("id","") if products else "")' <<< "$PRODUCTS_RESPONSE")

SELECTED_SIZE=$(python -c 'import json,sys; 
data=json.loads(sys.stdin.read() or "{}");
products=data.get("products") or [];
sizes=(products[0].get("sizes") or []) if products else [];
print(sizes[0] if sizes else "")' <<< "$PRODUCTS_RESPONSE")

SELECTED_COLOR=$(python -c 'import json,sys; 
data=json.loads(sys.stdin.read() or "{}");
products=data.get("products") or [];
colors=(products[0].get("colors") or []) if products else [];
print(colors[0] if colors else "")' <<< "$PRODUCTS_RESPONSE")

# Test 5: Create a test product
echo "5. Testing product creation..."
NEW_PRODUCT_ID=$(date +%s)
if [ -n "$CATEGORY_ID" ]; then
  CREATE_RESPONSE=$(curl -k -s -X POST \
    -H "Content-Type: application/json" \
    -H "X-CSRFToken: $CSRF_TOKEN" \
    -H "Referer: $BASE_URL/" \
    -c $COOKIE_JAR -b $COOKIE_JAR \
    -d '{
      "id": '"$NEW_PRODUCT_ID"',
      "name": "Test Product",
      "description": "A test product for API testing",
      "price": 99.99,
      "currency": "KES",
      "category_id": '"$CATEGORY_ID"',
      "sizes": ["M", "L"],
      "colors": ["Red", "Blue"],
      "images": ["https://example.com/test.jpg"],
      "in_stock": true
    }' \
    "$BASE_URL/api/admin/products/")
  echo "Create Product Response: $CREATE_RESPONSE"
else
  echo "Create Product Response: skipped (no categories found)"
fi
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
if [ -z "$PRODUCT_ID" ] && [ -n "$CATEGORY_ID" ]; then
  PRODUCT_ID="$NEW_PRODUCT_ID"
  SELECTED_SIZE="M"
  SELECTED_COLOR="Red"
fi

if [ -n "$PRODUCT_ID" ]; then
  ADD_TO_CART=$(curl -k -s -X POST \
    -H "Content-Type: application/json" \
    -H "X-CSRFToken: $CSRF_TOKEN" \
    -H "Referer: $BASE_URL/" \
    -c $COOKIE_JAR -b $COOKIE_JAR \
    -d '{
      "product_id": '"${PRODUCT_ID}"',
      "quantity": 2,
      "selected_size": "'"$SELECTED_SIZE"'",
      "selected_color": "'"$SELECTED_COLOR"'"
    }' \
    "$BASE_URL/api/cart/add/")
  echo "Add to Cart Response: $ADD_TO_CART"
else
  echo "Add to Cart Response: skipped (no product available)"
fi
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
