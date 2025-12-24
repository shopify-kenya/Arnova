#!/bin/bash
# Payment Endpoints Test Script using curl
# Run this when the server is running on localhost:8000

BASE_URL="http://127.0.0.1:8000"

echo "🧪 Testing Payment Endpoints with curl"
echo "======================================"

# Get CSRF token first
echo -e "\n1. Getting CSRF Token..."
CSRF_RESPONSE=$(curl -s -X GET "$BASE_URL/api/csrf-token/")
echo "CSRF Response: $CSRF_RESPONSE"

# Extract CSRF token (basic extraction)
CSRF_TOKEN=$(echo $CSRF_RESPONSE | grep -o '"csrfToken":"[^"]*"' | cut -d'"' -f4)
echo "CSRF Token: $CSRF_TOKEN"

# Test card validation
echo -e "\n2. Testing Card Validation..."
curl -X POST "$BASE_URL/api/payment/validate-card/" \
  -H "Content-Type: application/json" \
  -H "X-CSRFToken: $CSRF_TOKEN" \
  -d '{
    "card_number": "4111111111111111",
    "expiry_month": "12",
    "expiry_year": "2025",
    "cvv": "123"
  }' \
  -w "\nStatus Code: %{http_code}\n"

# Test payment processing
echo -e "\n3. Testing Payment Processing..."
curl -X POST "$BASE_URL/api/payment/process/" \
  -H "Content-Type: application/json" \
  -H "X-CSRFToken: $CSRF_TOKEN" \
  -d '{
    "amount": 100.00,
    "currency": "USD",
    "payment_method": "card",
    "card_number": "4111111111111111",
    "expiry_month": "12",
    "expiry_year": "2025",
    "cvv": "123",
    "cardholder_name": "Test User"
  }' \
  -w "\nStatus Code: %{http_code}\n"

# Test M-Pesa callback
echo -e "\n4. Testing M-Pesa Callback..."
curl -X POST "$BASE_URL/api/payment/mpesa/callback/" \
  -H "Content-Type: application/json" \
  -H "X-CSRFToken: $CSRF_TOKEN" \
  -d '{
    "Body": {
      "stkCallback": {
        "MerchantRequestID": "test-123",
        "CheckoutRequestID": "ws_CO_test123",
        "ResultCode": 0,
        "ResultDesc": "The service request is processed successfully.",
        "CallbackMetadata": {
          "Item": [
            {"Name": "Amount", "Value": 100},
            {"Name": "MpesaReceiptNumber", "Value": "TEST123"},
            {"Name": "PhoneNumber", "Value": "254700000000"}
          ]
        }
      }
    }
  }' \
  -w "\nStatus Code: %{http_code}\n"

# Test M-Pesa status check
echo -e "\n5. Testing M-Pesa Status Check..."
curl -X GET "$BASE_URL/api/payment/mpesa/status/ws_CO_test123/" \
  -H "Content-Type: application/json" \
  -w "\nStatus Code: %{http_code}\n"

# Test health check
echo -e "\n6. Testing API Health Check..."
curl -X GET "$BASE_URL/api/health/" \
  -w "\nStatus Code: %{http_code}\n"

echo -e "\n✅ Payment endpoint testing completed!"
echo "Note: Start the server with 'python unified_server.py' to see actual responses"