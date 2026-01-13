#!/usr/bin/env python3
"""
Payment Endpoints Test Script
Tests all payment-related API endpoints for functionality
"""
import json
from datetime import datetime

import requests

BASE_URL = "http://127.0.0.1:8000"


def test_endpoint(method, endpoint, data=None, headers=None):
    """Test an API endpoint and return response"""
    url = f"{BASE_URL}{endpoint}"
    try:
        if method == "GET":
            response = requests.get(url, headers=headers)
        elif method == "POST":
            response = requests.post(url, json=data, headers=headers)

        print(f"\n{method} {endpoint}")
        print(f"Status: {response.status_code}")
        print(f"Response: {response.text[:200]}...")
        return response
    except Exception as e:
        print(f"Error testing {endpoint}: {e}")
        return None


def get_csrf_token():
    """Get CSRF token for authenticated requests"""
    response = test_endpoint("GET", "/api/csrf-token/")
    if response and response.status_code == 200:
        return response.json().get("csrfToken")
    return None


def test_payment_endpoints():
    """Test all payment endpoints"""
    print("🧪 Testing Payment Endpoints")
    print("=" * 50)

    # Get CSRF token
    csrf_token = get_csrf_token()
    headers = (
        {"Content-Type": "application/json", "X-CSRFToken": csrf_token}
        if csrf_token
        else {"Content-Type": "application/json"}
    )

    # Test card validation
    print("\n1. Testing Card Validation")
    card_data = {
        "card_number": "4111111111111111",
        "expiry_month": "12",
        "expiry_year": "2025",
        "cvv": "123",
    }
    test_endpoint("POST", "/api/payment/validate-card/", card_data, headers)

    # Test payment processing
    print("\n2. Testing Payment Processing")
    payment_data = {
        "amount": 100.00,
        "currency": "USD",
        "payment_method": "card",
        "card_number": "4111111111111111",
        "expiry_month": "12",
        "expiry_year": "2025",
        "cvv": "123",
        "cardholder_name": "Test User",
    }
    test_endpoint("POST", "/api/payment/process/", payment_data, headers)

    # Test M-Pesa callback (simulate)
    print("\n3. Testing M-Pesa Callback")
    mpesa_data = {
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
                        {"Name": "PhoneNumber", "Value": "254700000000"},
                    ]
                },
            }
        }
    }
    test_endpoint("POST", "/api/payment/mpesa/callback/", mpesa_data, headers)

    # Test M-Pesa status check
    print("\n4. Testing M-Pesa Status Check")
    test_endpoint("GET", "/api/payment/mpesa/status/ws_CO_test123/")

    print("\n✅ Payment endpoint testing completed!")


if __name__ == "__main__":
    test_payment_endpoints()
