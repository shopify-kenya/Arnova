#!/usr/bin/env python3
"""
Payment GraphQL Test Script
Tests payment-related GraphQL operations
"""
import requests
from urllib3.exceptions import InsecureRequestWarning

# Suppress SSL warnings for testing
requests.urllib3.disable_warnings(InsecureRequestWarning)

BASE_URL = "http://127.0.0.1:8000"
GRAPHQL_URL = f"{BASE_URL}/graphql/"
ADMIN_CREDS = {"username": "ArnovaAdmin", "password": "Arnova@010126"}


def gql(session, query, variables=None, token=None):
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    payload = {"query": query}
    if variables:
        payload["variables"] = variables
    return session.post(GRAPHQL_URL, json=payload, headers=headers)


def test_payment_endpoints():
    print("🧪 Testing Payment GraphQL Operations")
    print("=" * 50)

    session = requests.Session()

    login_query = """
    mutation Login($username: String!, $password: String!) {
      login(username: $username, password: $password) {
        accessToken
      }
    }
    """
    login_response = gql(session, login_query, ADMIN_CREDS)
    token = login_response.json().get("data", {}).get("login", {}).get("accessToken")
    if not token:
        print("❌ Failed to login as admin")
        return

    # Test card validation
    print("\n1. Testing Card Validation")
    validate_query = """
    mutation ValidateCard($cardNumber: String!) {
      validateCard(cardNumber: $cardNumber) {
        valid
        cardType
      }
    }
    """
    response = gql(session, validate_query, {"cardNumber": "4111111111111111"}, token)
    print(f"Status: {response.status_code}")
    print(f"Response: {response.text[:200]}...")

    # Test payment processing
    print("\n2. Testing Payment Processing")
    process_query = """
    mutation ProcessPayment($input: PaymentInput!) {
      processPayment(input: $input) {
        success
        message
        error
        transactionId
      }
    }
    """
    payment_input = {"paymentMethod": "card", "amount": 100.00}
    response = gql(session, process_query, {"input": payment_input}, token)
    print(f"Status: {response.status_code}")
    print(f"Response: {response.text[:200]}...")

    # Test M-Pesa callback (simulate webhook)
    print("\n3. Testing M-Pesa Callback Webhook")
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
    webhook_response = session.post(
        f"{BASE_URL}/webhooks/mpesa/", json=mpesa_data
    )
    print(f"Status: {webhook_response.status_code}")
    print(f"Response: {webhook_response.text[:200]}...")

    # Test M-Pesa status check
    print("\n4. Testing M-Pesa Status Check")
    status_query = """
    query MpesaStatus($checkoutRequestId: String!) {
      mpesaStatus(checkoutRequestId: $checkoutRequestId) {
        status
        resultCode
        resultDesc
        transactionId
      }
    }
    """
    status_response = gql(
        session, status_query, {"checkoutRequestId": "ws_CO_test123"}, token
    )
    print(f"Status: {status_response.status_code}")
    print(f"Response: {status_response.text[:200]}...")

    print("\n✅ Payment GraphQL testing completed!")


if __name__ == "__main__":
    test_payment_endpoints()
