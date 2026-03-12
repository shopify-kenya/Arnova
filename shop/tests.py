import json

from django.contrib.auth.models import User
from django.test import TestCase

from .models import Cart, CartItem, Category, Product, SavedItem


class SmokeTests(TestCase):
    def test_health_endpoint(self):
        response = self.client.get("/health/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {"status": "ok"})

    def test_graphql_health_query(self):
        payload = {"query": "query { health }"}
        response = self.client.post(
            "/graphql/",
            data=json.dumps(payload),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data.get("data"), {"health": "healthy"})
        self.assertFalse(data.get("errors"))


class CartAndSavedEndpointTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="buyer",
            email="buyer@example.com",
            password="secret123",
        )
        self.category = Category.objects.create(name="Shoes", slug="shoes")
        self.product = Product.objects.create(
            name="Runner",
            description="Daily running shoe",
            price="99.99",
            currency="KES",
            sale_price="79.99",
            category=self.category,
            sizes=["M", "L"],
            colors=["Black", "White"],
            images=["/img/runner.jpg"],
            in_stock=True,
            is_new=True,
            on_sale=True,
        )

    def test_cart_add_and_get_roundtrip(self):
        self.client.force_login(self.user)

        response = self.client.post(
            "/api/cart/add/",
            data=json.dumps(
                {
                    "product_id": self.product.id,
                    "quantity": 2,
                    "selected_size": "M",
                    "selected_color": "Black",
                }
            ),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 200)
        payload = response.json()
        self.assertTrue(payload["success"])

        cart = Cart.objects.get(user=self.user)
        item = CartItem.objects.get(cart=cart, product=self.product)
        self.assertEqual(item.quantity, 2)
        self.assertEqual(item.selected_size, "M")
        self.assertEqual(item.selected_color, "Black")

        get_response = self.client.get("/api/cart/")
        self.assertEqual(get_response.status_code, 200)
        get_payload = get_response.json()
        self.assertTrue(get_payload["authenticated"])
        self.assertEqual(len(get_payload["items"]), 1)
        self.assertEqual(get_payload["items"][0]["product"]["id"], self.product.id)

    def test_cart_add_rejects_invalid_variant_input(self):
        self.client.force_login(self.user)

        response = self.client.post(
            "/api/cart/add/",
            data=json.dumps(
                {
                    "product_id": self.product.id,
                    "quantity": 1,
                    "selected_size": "XL",
                    "selected_color": "Black",
                }
            ),
            content_type="application/json",
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn("Invalid size", response.json()["error"])
        self.assertEqual(CartItem.objects.count(), 0)

    def test_saved_add_and_get_roundtrip_is_idempotent(self):
        self.client.force_login(self.user)

        first = self.client.post(
            "/api/saved/add/",
            data=json.dumps({"product_id": self.product.id}),
            content_type="application/json",
        )
        second = self.client.post(
            "/api/saved/add/",
            data=json.dumps({"product_id": self.product.id}),
            content_type="application/json",
        )

        self.assertEqual(first.status_code, 200)
        self.assertEqual(second.status_code, 200)
        self.assertEqual(SavedItem.objects.count(), 1)

        get_response = self.client.get("/api/saved/")
        self.assertEqual(get_response.status_code, 200)
        items = get_response.json()["items"]
        self.assertEqual(len(items), 1)
        self.assertEqual(items[0]["product"]["id"], self.product.id)
        self.assertEqual(items[0]["product"]["on_sale"], True)


class ProductEndpointAlignmentTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="staff",
            email="staff@example.com",
            password="secret123",
            is_staff=True,
        )
        self.category = Category.objects.create(name="Clothing", slug="clothing")
        self.product = Product.objects.create(
            name="Tee",
            description="Cotton tee",
            price="19.99",
            currency="KES",
            category=self.category,
            sizes=["S", "M"],
            colors=["Blue"],
            images=[],
            in_stock=True,
            is_new=False,
            on_sale=False,
        )

    def test_products_endpoint_returns_slug_category(self):
        response = self.client.get("/api/products/")
        self.assertEqual(response.status_code, 200)
        products = response.json()["products"]
        self.assertGreaterEqual(len(products), 1)
        payload = products[0]
        self.assertEqual(payload["category"], "clothing")
        self.assertEqual(payload["category_name"], "Clothing")

    def test_admin_product_create_does_not_require_manual_id(self):
        self.client.force_login(self.user)
        response = self.client.post(
            "/api/admin/products/",
            data=json.dumps(
                {
                    "name": "Hoodie",
                    "description": "Warm hoodie",
                    "price": "49.99",
                    "currency": "KES",
                    "category_id": self.category.id,
                    "sizes": ["M"],
                    "colors": ["Black"],
                    "images": ["/img/hoodie.jpg"],
                }
            ),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 200)
        created_id = response.json()["product_id"]
        created = Product.objects.get(id=created_id)
        self.assertEqual(created.name, "Hoodie")
        self.assertIsInstance(created.id, int)
