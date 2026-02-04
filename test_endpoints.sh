#!/bin/bash
# GraphQL endpoint testing script

BASE_URL="${BASE_URL:-https://127.0.0.1:8443}"
GRAPHQL_URL="$BASE_URL/graphql/"
ACCESS_TOKEN=""

json_escape() {
  python - <<'PY'
import json,sys
print(json.dumps(sys.stdin.read()))
PY
}

gql() {
  local query="$1"
  local variables="$2"

  local payload
  if [ -n "$variables" ]; then
    payload=$(python - <<PY
import json
query = """$query"""
variables = json.loads('''$variables''')
print(json.dumps({"query": query, "variables": variables}))
PY
)
  else
    payload=$(python - <<PY
import json
query = """$query"""
print(json.dumps({"query": query}))
PY
)
  fi

  if [ -n "$ACCESS_TOKEN" ]; then
    curl -k -s -H "Content-Type: application/json" -H "Authorization: Bearer $ACCESS_TOKEN" \
      -d "$payload" "$GRAPHQL_URL"
  else
    curl -k -s -H "Content-Type: application/json" -d "$payload" "$GRAPHQL_URL"
  fi
}

echo "🧪 Testing Arnova GraphQL endpoint..."
echo "=================================="

# Test 1: Health
printf "1. Health check...\n"
HEALTH=$(gql "query { health }")
echo "$HEALTH" | head -200

echo "\n2. Public queries (products, categories)..."
PRODUCTS_RESPONSE=$(gql "query Products { products { id name price sizes colors } }")
echo "$PRODUCTS_RESPONSE" | head -200
CATEGORIES_RESPONSE=$(gql "query Categories { categories { id name slug } }")
echo "$CATEGORIES_RESPONSE" | head -200

# Extract product id/size/color
PRODUCT_ID=$(python - <<PY
import json
import sys
resp = json.loads('''$PRODUCTS_RESPONSE''')
items = resp.get('data', {}).get('products', [])
print(items[0].get('id') if items else "")
PY
)
SELECTED_SIZE=$(python - <<PY
import json
resp = json.loads('''$PRODUCTS_RESPONSE''')
items = resp.get('data', {}).get('products', [])
print((items[0].get('sizes') or [""])[0] if items else "")
PY
)
SELECTED_COLOR=$(python - <<PY
import json
resp = json.loads('''$PRODUCTS_RESPONSE''')
items = resp.get('data', {}).get('products', [])
print((items[0].get('colors') or [""])[0] if items else "")
PY
)

# Test 3: Login
printf "\n3. Login (admin)...\n"
LOGIN_RESPONSE=$(gql "mutation Login($username: String!, $password: String!) { login(username: $username, password: $password) { accessToken refreshToken user { id username role } } }" "{\"username\": \"ArnovaAdmin\", \"password\": \"Arnova@010126\"}")
echo "$LOGIN_RESPONSE" | head -200
ACCESS_TOKEN=$(python - <<PY
import json
resp = json.loads('''$LOGIN_RESPONSE''')
print(resp.get('data', {}).get('login', {}).get('accessToken', ""))
PY
)

if [ -z "$ACCESS_TOKEN" ]; then
  echo "Failed to login. Aborting protected tests."
  exit 1
fi

# Test 4: Admin queries
printf "\n4. Admin queries...\n"
ADMIN_ANALYTICS=$(gql "query { adminAnalytics { totalOrders totalRevenue totalUsers totalProducts } }")
echo "$ADMIN_ANALYTICS" | head -200
ADMIN_PRODUCTS=$(gql "query { adminProducts { id name price } }")
echo "$ADMIN_PRODUCTS" | head -200
ADMIN_USERS=$(gql "query { adminUsers { id username email isStaff } }")
echo "$ADMIN_USERS" | head -200
ADMIN_ORDERS=$(gql "query { adminOrders { id orderId totalAmount status } }")
echo "$ADMIN_ORDERS" | head -200

# Test 5: Create product (if categories available)
CATEGORY_ID=$(python - <<PY
import json
resp = json.loads('''$CATEGORIES_RESPONSE''')
items = resp.get('data', {}).get('categories', [])
print(items[0].get('id') if items else "")
PY
)

printf "\n5. Admin create product...\n"
if [ -n "$CATEGORY_ID" ]; then
  CREATE_PRODUCT=$(gql "mutation AdminCreateProduct($input: AdminCreateProductInput!) { adminCreateProduct(input: $input) { success productId } }" "{\"input\": {\"name\": \"Test Product\", \"description\": \"GraphQL test product\", \"price\": 99.99, \"categoryId\": $CATEGORY_ID, \"sizes\": [\"M\", \"L\"], \"colors\": [\"Red\", \"Blue\"], \"images\": [\"https://example.com/test.jpg\"], \"inStock\": true }}")
  echo "$CREATE_PRODUCT" | head -200
else
  echo "Create Product: skipped (no categories found)"
fi

# Test 6: User queries
printf "\n6. User queries (profile, cart, orders)...\n"
PROFILE=$(gql "query { profile { user { username email } profile { phone address city country postalCode } } }")
echo "$PROFILE" | head -200
CART=$(gql "query { cart { items { id quantity selectedSize selectedColor product { id name price } } } }")
echo "$CART" | head -200
ORDERS=$(gql "query { orders { id orderId totalAmount status createdAt } }")
echo "$ORDERS" | head -200

# Test 7: Cart add
printf "\n7. Cart add...\n"
if [ -n "$PRODUCT_ID" ]; then
  ADD_TO_CART=$(gql "mutation CartAdd($input: CartAddInput!) { cartAdd(input: $input) { success } }" "{\"input\": {\"productId\": $PRODUCT_ID, \"quantity\": 2, \"selectedSize\": \"$SELECTED_SIZE\", \"selectedColor\": \"$SELECTED_COLOR\" }}")
  echo "$ADD_TO_CART" | head -200
else
  echo "Add to Cart: skipped (no product available)"
fi

# Test 8: Logout
printf "\n8. Logout...\n"
LOGOUT=$(gql "mutation { logout { success } }")
echo "$LOGOUT" | head -200

# Test 9: Protected query after logout (should fail)
printf "\n9. Protected query after logout (should fail)...\n"
ACCESS_TOKEN=""
ADMIN_FAIL=$(gql "query { adminAnalytics { totalOrders } }")
echo "$ADMIN_FAIL" | head -200

echo "\n🎉 GraphQL endpoint testing completed!"
