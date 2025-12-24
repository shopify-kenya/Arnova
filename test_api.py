#!/usr/bin/env python3
"""
Production readiness test for API endpoints
Run this before deploying to catch serialization issues
"""

import requests
import json
import sys
from urllib3.exceptions import InsecureRequestWarning

# Suppress SSL warnings for testing
requests.urllib3.disable_warnings(InsecureRequestWarning)

BASE_URL = "https://127.0.0.1:8443"
ADMIN_CREDS = {"username": "ArnovaAdmin", "password": "Arnova@010126"}

def test_endpoint(session, endpoint, method="GET", data=None):
    """Test an API endpoint for JSON serialization issues"""
    try:
        url = f"{BASE_URL}{endpoint}"
        response = session.request(method, url, json=data, verify=False)

        # Try to parse JSON
        json_data = response.json()
        print(f"✅ {method} {endpoint} - Status: {response.status_code}")
        return True
    except json.JSONDecodeError:
        print(f"❌ {method} {endpoint} - JSON decode error")
        return False
    except Exception as e:
        print(f"❌ {method} {endpoint} - Error: {str(e)}")
        return False

def main():
    session = requests.Session()

    # Get CSRF token
    csrf_response = session.get(f"{BASE_URL}/api/csrf-token/", verify=False)
    csrf_token = csrf_response.json()["csrfToken"]

    # Login as admin
    session.headers.update({
        "X-CSRFToken": csrf_token,
        "Referer": f"{BASE_URL}/",
        "Content-Type": "application/json"
    })

    login_response = session.post(f"{BASE_URL}/api/auth/login/", json=ADMIN_CREDS, verify=False)
    if login_response.status_code != 200:
        print("❌ Failed to login as admin")
        sys.exit(1)

    # Test critical endpoints
    endpoints = [
        "/api/products/",
        "/api/categories/",
        "/api/admin/analytics/",
        "/api/admin/orders/",
        "/api/admin/products/",
        "/api/admin/users/",
    ]

    failed = 0
    for endpoint in endpoints:
        if not test_endpoint(session, endpoint):
            failed += 1

    if failed == 0:
        print(f"\n🎉 All {len(endpoints)} endpoints passed!")
        sys.exit(0)
    else:
        print(f"\n💥 {failed}/{len(endpoints)} endpoints failed!")
        sys.exit(1)

if __name__ == "__main__":
    main()