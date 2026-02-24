#!/usr/bin/env python3
"""
GraphQL readiness test for API endpoints
Run this before deploying to catch serialization issues
"""

import sys

import requests
from urllib3.exceptions import InsecureRequestWarning

# Suppress SSL warnings for testing
requests.urllib3.disable_warnings(InsecureRequestWarning)

BASE_URL = "https://127.0.0.1:8443"
GRAPHQL_URL = f"{BASE_URL}/graphql/"
ADMIN_CREDS = {"username": "ArnovaAdmin", "password": "Arnova@010126"}


def gql(session, query, variables=None, token=None):
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    payload = {"query": query}
    if variables:
        payload["variables"] = variables
    response = session.post(GRAPHQL_URL, json=payload, headers=headers, verify=False)
    return response


def main():
    session = requests.Session()

    # Login as admin
    login_query = """
    mutation Login($username: String!, $password: String!) {
      login(username: $username, password: $password) {
        accessToken
      }
    }
    """
    login_response = gql(session, login_query, ADMIN_CREDS)
    login_payload = login_response.json()
    token = login_payload.get("data", {}).get("login", {}).get("accessToken")
    if not token:
        print("❌ Failed to login as admin")
        sys.exit(1)

    # Test critical GraphQL queries
    queries = {
        "products": "query { products { id name price } }",
        "categories": "query { categories { id name slug } }",
        "adminAnalytics": "query { adminAnalytics { totalOrders totalRevenue } }",
        "adminOrders": "query { adminOrders { id orderId totalAmount } }",
        "adminProducts": "query { adminProducts { id name price } }",
        "adminUsers": "query { adminUsers { id username email } }",
    }

    failed = 0
    for name, query in queries.items():
        response = gql(session, query, token=token)
        try:
            payload = response.json()
            if payload.get("errors"):
                raise ValueError(payload["errors"][0].get("message"))
            print(f"✅ {name} - Status: {response.status_code}")
        except Exception as e:
            print(f"❌ {name} - Error: {str(e)}")
            failed += 1

    if failed == 0:
        print(f"\n🎉 All {len(queries)} queries passed!")
        sys.exit(0)
    else:
        print(f"\n💥 {failed}/{len(queries)} queries failed!")
        sys.exit(1)


if __name__ == "__main__":
    main()
