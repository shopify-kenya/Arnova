import json

from django.test import TestCase


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
