#!/bin/bash
# GraphQL payment testing script

BASE_URL="${BASE_URL:-https://127.0.0.1:8443}"
GRAPHQL_URL="$BASE_URL/graphql/"
ACCESS_TOKEN=""

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

echo "🧪 GraphQL payment tests"

# Login
LOGIN=$(gql "mutation Login($username: String!, $password: String!) { login(username: $username, password: $password) { accessToken } }" "{\"username\": \"ArnovaAdmin\", \"password\": \"Arnova@010126\"}")
ACCESS_TOKEN=$(python - <<PY
import json
resp = json.loads('''$LOGIN''')
print(resp.get('data', {}).get('login', {}).get('accessToken', ""))
PY
)

if [ -z "$ACCESS_TOKEN" ]; then
  echo "Login failed."
  exit 1
fi

# Validate card
echo "\n1. Validate Card"
VALIDATE=$(gql "mutation ValidateCard($cardNumber: String!) { validateCard(cardNumber: $cardNumber) { valid cardType } }" "{\"cardNumber\": \"4111111111111111\"}")
echo "$VALIDATE" | head -200

# Process payment (card)
echo "\n2. Process Payment (card)"
PAYMENT=$(gql "mutation ProcessPayment($input: PaymentInput!) { processPayment(input: $input) { success message error transactionId } }" "{\"input\": {\"paymentMethod\": \"card\", \"amount\": 100.0 }}")
echo "$PAYMENT" | head -200

# Process payment (mpesa) - expects phone number
echo "\n3. Process Payment (mpesa)"
PAYMENT_MPESA=$(gql "mutation ProcessPayment($input: PaymentInput!) { processPayment(input: $input) { success message error checkoutRequestId merchantRequestId } }" "{\"input\": {\"paymentMethod\": \"mpesa\", \"amount\": 100.0, \"phoneNumber\": \"0712345678\" }}")
echo "$PAYMENT_MPESA" | head -200

