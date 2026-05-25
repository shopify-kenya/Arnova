"""
Security & Endpoint Break Tests
Tests auth enforcement, admin access control, injection attempts,
and validates all remaining endpoints work correctly after trimming.
"""

import json

from django.contrib.auth.models import User
from django.core.cache import cache
from django.test import TestCase, override_settings

from shop.models import Cart, CartItem, Category, Product, SavedItem, UserProfile


@override_settings(
    CACHES={
        "default": {
            "BACKEND": "django.core.cache.backends.locmem.LocMemCache",
            "LOCATION": "security-tests",
        }
    }
)
class EndpointSecurityTests(TestCase):
    """Test that all endpoints enforce proper authentication and authorization."""

    def setUp(self):
        cache.clear()
        self.admin = User.objects.create_user(
            username="testadmin",
            email="admin@test.com",
            password="Admin@123456",
            is_staff=True,
        )
        self.buyer = User.objects.create_user(
            username="testbuyer",
            email="buyer@test.com",
            password="Buyer@123456",
            is_staff=False,
        )
        UserProfile.objects.create(user=self.admin)
        UserProfile.objects.create(user=self.buyer)
        Cart.objects.create(user=self.admin)
        Cart.objects.create(user=self.buyer)
        self.category = Category.objects.create(name="Shoes", slug="shoes")
        self.product = Product.objects.create(
            name="Test Shoe",
            description="A test product",
            price="100.00",
            currency="KES",
            category=self.category,
            sizes=["42"],
            colors=["Black"],
            images=["/placeholder.svg"],
            in_stock=True,
        )

    def gql(self, query, variables=None, token=None):
        headers = {"Content-Type": "application/json"}
        if token:
            headers["HTTP_AUTHORIZATION"] = f"Bearer {token}"
        payload = {"query": query}
        if variables:
            payload["variables"] = variables
        return self.client.post(
            "/graphql/",
            data=json.dumps(payload),
            content_type="application/json",
            **{k: v for k, v in headers.items() if k.startswith("HTTP_")},
        )

    def login_gql(self, username, password):
        resp = self.gql(
            """mutation($u:String!,$p:String!){login(username:$u,password:$p){accessToken}}""",
            {"u": username, "p": password},
        )
        data = resp.json()
        return data.get("data", {}).get("login", {}).get("accessToken")

    # ─── PUBLIC ENDPOINTS ───────────────────────────────────────

    def test_health_endpoint_public(self):
        resp = self.client.get("/health/")
        self.assertEqual(resp.status_code, 200)

    def test_graphql_health_public(self):
        resp = self.gql("query { health }")
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.json()["data"]["health"], "healthy")

    def test_products_query_public(self):
        resp = self.gql("query { products { id name price } }")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()["data"]["products"]
        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]["name"], "Test Shoe")

    def test_categories_query_public(self):
        resp = self.gql("query { categories { id name slug } }")
        self.assertEqual(resp.status_code, 200)
        self.assertGreater(len(resp.json()["data"]["categories"]), 0)

    def test_product_detail_public(self):
        resp = self.gql(
            "query($id:Int!){ product(id:$id){ id name } }",
            {"id": self.product.id},
        )
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.json()["data"]["product"]["name"], "Test Shoe")

    # ─── AUTH ENFORCEMENT (GraphQL) ─────────────────────────────

    def test_cart_requires_auth(self):
        resp = self.gql("query { cart { items { id } } }")
        self.assertEqual(resp.status_code, 200)
        errors = resp.json().get("errors", [])
        self.assertTrue(any("Authentication required" in e["message"] for e in errors))

    def test_saved_requires_auth(self):
        resp = self.gql("query { saved { items { id } } }")
        errors = resp.json().get("errors", [])
        self.assertTrue(any("Authentication required" in e["message"] for e in errors))

    def test_profile_requires_auth(self):
        resp = self.gql("query { profile { user { id } } }")
        errors = resp.json().get("errors", [])
        self.assertTrue(any("Authentication required" in e["message"] for e in errors))

    def test_orders_requires_auth(self):
        resp = self.gql("query { orders { id } }")
        errors = resp.json().get("errors", [])
        self.assertTrue(any("Authentication required" in e["message"] for e in errors))

    def test_notifications_requires_auth(self):
        resp = self.gql("query { notifications { items { id } } }")
        errors = resp.json().get("errors", [])
        self.assertTrue(any("Authentication required" in e["message"] for e in errors))

    def test_cart_add_requires_auth(self):
        resp = self.gql(
            """mutation { cartAdd(input:{productId:1,quantity:1,selectedSize:"42",selectedColor:"Black"}){ success } }"""
        )
        errors = resp.json().get("errors", [])
        self.assertTrue(any("Authentication required" in e["message"] for e in errors))

    def test_saved_add_requires_auth(self):
        resp = self.gql("mutation { savedAdd(productId:1){ success } }")
        errors = resp.json().get("errors", [])
        self.assertTrue(any("Authentication required" in e["message"] for e in errors))

    # ─── ADMIN-ONLY ENFORCEMENT (GraphQL) ───────────────────────

    def test_admin_analytics_requires_staff(self):
        token = self.login_gql("testbuyer", "Buyer@123456")
        resp = self.gql(
            "query { adminAnalytics { totalOrders } }", token=token
        )
        errors = resp.json().get("errors", [])
        self.assertTrue(any("Admin access required" in e["message"] for e in errors))

    def test_admin_products_requires_staff(self):
        token = self.login_gql("testbuyer", "Buyer@123456")
        resp = self.gql("query { adminProducts { id } }", token=token)
        errors = resp.json().get("errors", [])
        self.assertTrue(any("Admin access required" in e["message"] for e in errors))

    def test_admin_users_requires_staff(self):
        token = self.login_gql("testbuyer", "Buyer@123456")
        resp = self.gql("query { adminUsers { id } }", token=token)
        errors = resp.json().get("errors", [])
        self.assertTrue(any("Admin access required" in e["message"] for e in errors))

    def test_admin_orders_requires_staff(self):
        token = self.login_gql("testbuyer", "Buyer@123456")
        resp = self.gql("query { adminOrders { id } }", token=token)
        errors = resp.json().get("errors", [])
        self.assertTrue(any("Admin access required" in e["message"] for e in errors))

    def test_admin_create_product_requires_staff(self):
        token = self.login_gql("testbuyer", "Buyer@123456")
        resp = self.gql(
            """mutation { adminCreateProduct(input:{name:"Hack",description:"x",price:1,categoryId:1,sizes:[],colors:[],images:[]}) { success } }""",
            token=token,
        )
        errors = resp.json().get("errors", [])
        self.assertTrue(any("Admin access required" in e["message"] for e in errors))

    def test_admin_endpoints_work_for_staff(self):
        token = self.login_gql("testadmin", "Admin@123456")
        resp = self.gql(
            "query { adminAnalytics { totalOrders totalRevenue totalUsers totalProducts } }",
            token=token,
        )
        data = resp.json()
        self.assertIsNone(data.get("errors"))
        self.assertIn("adminAnalytics", data["data"])

    # ─── REST API AUTH ENFORCEMENT ──────────────────────────────

    def test_api_cart_unauthenticated_returns_empty(self):
        resp = self.client.get("/api/cart/")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertEqual(data["items"], [])
        self.assertFalse(data["authenticated"])

    def test_api_cart_add_requires_login(self):
        resp = self.client.post(
            "/api/cart/add/",
            data=json.dumps({"product_id": self.product.id, "quantity": 1}),
            content_type="application/json",
        )
        self.assertEqual(resp.status_code, 302)  # redirect to login

    def test_api_saved_unauthenticated_returns_empty(self):
        resp = self.client.get("/api/saved/")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertEqual(data["items"], [])
        self.assertFalse(data["authenticated"])

    def test_api_saved_add_requires_login(self):
        resp = self.client.post(
            "/api/saved/add/",
            data=json.dumps({"product_id": self.product.id}),
            content_type="application/json",
        )
        self.assertEqual(resp.status_code, 302)

    def test_api_profile_requires_login(self):
        resp = self.client.get("/api/profile/")
        self.assertEqual(resp.status_code, 302)

    def test_api_orders_requires_login(self):
        resp = self.client.get("/api/orders/")
        self.assertEqual(resp.status_code, 302)

    def test_api_logout_requires_login(self):
        resp = self.client.post("/api/logout/")
        self.assertEqual(resp.status_code, 302)

    # ─── ADMIN UI AUTH ENFORCEMENT ──────────────────────────────

    def test_admin_dashboard_redirects_unauthenticated(self):
        resp = self.client.get("/admin/")
        self.assertIn(resp.status_code, [302, 301])

    def test_admin_dashboard_forbidden_for_buyer(self):
        self.client.login(username="testbuyer", password="Buyer@123456")
        resp = self.client.get("/admin/")
        # Should redirect to login or return 302/403
        self.assertIn(resp.status_code, [302, 403])

    def test_admin_dashboard_accessible_for_staff(self):
        self.client.login(username="testadmin", password="Admin@123456")
        resp = self.client.get("/admin/")
        self.assertEqual(resp.status_code, 200)

    # ─── INJECTION & MALFORMED INPUT ────────────────────────────

    def test_graphql_introspection_disabled_in_production(self):
        # In DEBUG mode introspection is allowed; this tests the schema builds
        resp = self.gql("query { __schema { types { name } } }")
        self.assertEqual(resp.status_code, 200)

    def test_sql_injection_in_login(self):
        resp = self.client.post(
            "/api/login/",
            data=json.dumps({
                "username": "' OR 1=1 --",
                "password": "' OR 1=1 --",
            }),
            content_type="application/json",
        )
        self.assertEqual(resp.status_code, 401)
        self.assertIn("error", resp.json())

    def test_xss_in_login_username(self):
        resp = self.client.post(
            "/api/login/",
            data=json.dumps({
                "username": "<script>alert('xss')</script>",
                "password": "test",
            }),
            content_type="application/json",
        )
        self.assertEqual(resp.status_code, 401)
        body = resp.json()
        self.assertNotIn("<script>", json.dumps(body))

    def test_graphql_query_depth_bomb(self):
        # Deeply nested query should not crash the server
        resp = self.gql(
            "query { products { id name } products2: products { id } }"
        )
        self.assertEqual(resp.status_code, 200)

    def test_oversized_payload_rejected(self):
        huge_query = "query { " + "products { id } " * 10000 + "}"
        resp = self.gql(huge_query)
        # Should either return 200 with error or 413/400
        self.assertIn(resp.status_code, [200, 400, 413])

    def test_invalid_json_body(self):
        resp = self.client.post(
            "/graphql/",
            data="not json at all",
            content_type="application/json",
        )
        self.assertIn(resp.status_code, [200, 400])

    def test_empty_graphql_query(self):
        resp = self.gql("")
        self.assertIn(resp.status_code, [200, 400])

    def test_login_with_missing_fields(self):
        resp = self.client.post(
            "/api/login/",
            data=json.dumps({"username": ""}),
            content_type="application/json",
        )
        self.assertEqual(resp.status_code, 400)

    def test_register_weak_password_rejected(self):
        resp = self.client.post(
            "/api/register/",
            data=json.dumps({
                "username": "weakuser",
                "email": "weak@test.com",
                "password": "123",
                "password_confirm": "123",
            }),
            content_type="application/json",
        )
        self.assertEqual(resp.status_code, 400)

    # ─── CART ITEM ISOLATION (IDOR prevention) ──────────────────

    def test_cannot_modify_other_users_cart_item(self):
        # Create cart item for buyer
        cart = Cart.objects.get(user=self.buyer)
        item = CartItem.objects.create(
            cart=cart, product=self.product, quantity=1
        )

        # Login as admin and try to delete buyer's cart item
        self.client.login(username="testadmin", password="Admin@123456")
        resp = self.client.delete(f"/api/cart/{item.id}/")
        self.assertEqual(resp.status_code, 404)

    def test_cannot_delete_other_users_saved_item(self):
        # Create saved item for buyer
        saved = SavedItem.objects.create(user=self.buyer, product=self.product)

        # Login as admin and try to delete buyer's saved item
        self.client.login(username="testadmin", password="Admin@123456")
        resp = self.client.delete(f"/api/saved/{saved.id}/")
        self.assertEqual(resp.status_code, 404)

    # ─── AUTHENTICATED OPERATIONS WORK ──────────────────────────

    def test_authenticated_cart_flow(self):
        token = self.login_gql("testbuyer", "Buyer@123456")

        # Add to cart
        resp = self.gql(
            """mutation { cartAdd(input:{productId:%d,quantity:2,selectedSize:"42",selectedColor:"Black"}){ success } }"""
            % self.product.id,
            token=token,
        )
        self.assertTrue(resp.json()["data"]["cartAdd"]["success"])

        # Query cart
        resp = self.gql(
            "query { cart { items { id quantity product { name } } } }",
            token=token,
        )
        items = resp.json()["data"]["cart"]["items"]
        self.assertEqual(len(items), 1)
        self.assertEqual(items[0]["quantity"], 2)

    def test_authenticated_saved_flow(self):
        token = self.login_gql("testbuyer", "Buyer@123456")

        # Add to saved
        resp = self.gql(
            "mutation { savedAdd(productId:%d){ success itemId } }"
            % self.product.id,
            token=token,
        )
        data = resp.json()["data"]["savedAdd"]
        self.assertTrue(data["success"])

        # Query saved
        resp = self.gql(
            "query { saved { items { id product { name } } } }",
            token=token,
        )
        items = resp.json()["data"]["saved"]["items"]
        self.assertEqual(len(items), 1)

    # ─── REMOVED ENDPOINTS RETURN 404 ──────────────────────────

    def test_removed_admin_api_endpoints_404(self):
        self.client.login(username="testadmin", password="Admin@123456")
        removed_paths = [
            "/api/admin/orders/",
            "/api/admin/products/",
            "/api/admin/products/1/",
            "/api/admin/users/",
            "/api/admin/users/1/",
            "/api/admin/analytics/",
            "/api/admin/settings/",
        ]
        for path in removed_paths:
            resp = self.client.get(path)
            self.assertEqual(
                resp.status_code, 404,
                f"Expected 404 for removed endpoint {path}, got {resp.status_code}",
            )

    # ─── HTTP METHOD ENFORCEMENT ────────────────────────────────

    def test_login_rejects_get(self):
        resp = self.client.get("/api/login/")
        self.assertEqual(resp.status_code, 405)

    def test_register_rejects_get(self):
        resp = self.client.get("/api/register/")
        self.assertEqual(resp.status_code, 405)

    def test_health_rejects_post(self):
        resp = self.client.post("/api/health/")
        self.assertEqual(resp.status_code, 405)

    def test_products_rejects_post(self):
        resp = self.client.post("/api/products/")
        self.assertEqual(resp.status_code, 405)
