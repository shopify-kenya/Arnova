import json

from django.core.cache import cache
from django.test import TestCase
from django.test.utils import override_settings

from shop.models import Category, Product


@override_settings(
    CACHES={
        "default": {
            "BACKEND": "django.core.cache.backends.locmem.LocMemCache",
            "LOCATION": "arnova-tests",
        }
    }
)
class SmokeTests(TestCase):
    def setUp(self):
        super().setUp()
        cache.clear()

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

    def test_graphql_products_query_returns_data_when_cache_is_enabled(self):
        category = Category.objects.create(name="Shoes", slug="shoes")
        Product.objects.create(
            name="Cache Test Runner",
            description="A product used to validate GraphQL caching.",
            price="120.00",
            currency="KES",
            sale_price="99.00",
            category=category,
            sizes=["42"],
            colors=["Black"],
            images=["/placeholder.svg"],
            in_stock=True,
            is_new=True,
            on_sale=True,
        )
        payload = {"query": """
                query {
                  products {
                    id
                    name
                    category
                  }
                }
            """}

        first_response = self.client.post(
            "/graphql/",
            data=json.dumps(payload),
            content_type="application/json",
        )
        second_response = self.client.post(
            "/graphql/",
            data=json.dumps(payload),
            content_type="application/json",
        )

        self.assertEqual(first_response.status_code, 200)
        self.assertEqual(second_response.status_code, 200)
        self.assertFalse(first_response.json().get("errors"))
        self.assertFalse(second_response.json().get("errors"))
        self.assertEqual(
            first_response.json()["data"]["products"][0]["name"],
            "Cache Test Runner",
        )
