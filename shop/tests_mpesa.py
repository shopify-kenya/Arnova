import json
from decimal import Decimal
from unittest.mock import MagicMock, patch

from django.contrib.auth.models import User
from django.core.cache import cache
from django.test import RequestFactory, TestCase
from django.test.utils import override_settings

from shop.models import (
    Cart,
    Category,
    MpesaPayment,
    Order,
    Payment,
    Product,
    UserProfile,
)
from shop.payment_views import (
    check_mpesa_status,
    generate_mpesa_password,
    get_mpesa_access_token,
    process_payment,
    validate_card,
)

MPESA_SETTINGS = {
    "MPESA_CONSUMER_KEY": "test_consumer_key",
    "MPESA_CONSUMER_SECRET": "test_consumer_secret",
    "MPESA_ENVIRONMENT": "sandbox",
    "MPESA_SHORTCODE": "174379",
    "MPESA_PASSKEY": "bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919",
    "MPESA_CALLBACK_URL": "https://example.com/webhooks/mpesa/",
}

LOCMEM_CACHE = {
    "CACHES": {
        "default": {
            "BACKEND": "django.core.cache.backends.locmem.LocMemCache",
            "LOCATION": "arnova-mpesa-tests",
        }
    }
}


def _make_post_request(user, body):
    """Build a fake POST request with JSON body and an authenticated user."""
    factory = RequestFactory()
    request = factory.post(
        "/api/payments/process/",
        data=json.dumps(body),
        content_type="application/json",
    )
    request.user = user
    request.limited = False
    return request


# ---------------------------------------------------------------------------
# 1. OAuth token
# ---------------------------------------------------------------------------
@override_settings(**MPESA_SETTINGS)
class MpesaAccessTokenTests(TestCase):
    @patch("shop.payment_views.requests.get")
    def test_returns_token_on_success(self, mock_get):
        mock_get.return_value = MagicMock(
            status_code=200,
            json=lambda: {"access_token": "sandbox_token_abc"},
        )
        mock_get.return_value.raise_for_status = MagicMock()

        token = get_mpesa_access_token()
        self.assertEqual(token, "sandbox_token_abc")
        self.assertIn("sandbox.safaricom.co.ke", mock_get.call_args[0][0])

    @patch("shop.payment_views.requests.get")
    def test_raises_on_http_error(self, mock_get):
        from requests.exceptions import HTTPError

        mock_get.return_value.raise_for_status.side_effect = HTTPError("401")
        with self.assertRaises(Exception) as ctx:
            get_mpesa_access_token()
        self.assertIn("Failed to get M-Pesa access token", str(ctx.exception))


# ---------------------------------------------------------------------------
# 2. Password / timestamp generation
# ---------------------------------------------------------------------------
@override_settings(**MPESA_SETTINGS)
class MpesaPasswordTests(TestCase):
    def test_password_is_base64_and_timestamp_format(self):
        import base64

        password, timestamp = generate_mpesa_password()
        self.assertEqual(len(timestamp), 14)  # YYYYMMDDHHmmss
        decoded = base64.b64decode(password).decode()
        self.assertTrue(decoded.startswith("174379"))
        self.assertIn(timestamp, decoded)


# ---------------------------------------------------------------------------
# 3. Phone number formatting
# ---------------------------------------------------------------------------
@override_settings(**MPESA_SETTINGS, **LOCMEM_CACHE)
class PhoneNumberFormattingTests(TestCase):
    def setUp(self):
        cache.clear()
        self.user = User.objects.create_user("buyer", "b@test.com", "pass1234")

    def _stk_payload(self, phone):
        return {
            "payment_method": "mpesa",
            "amount": 100,
            "phone_number": phone,
        }

    @patch("shop.payment_views.requests.post")
    @patch("shop.payment_views.get_mpesa_access_token", return_value="tok")
    def _fire(self, phone, mock_token, mock_post):
        mock_post.return_value = MagicMock(
            status_code=200,
            json=lambda: {
                "ResponseCode": "0",
                "CheckoutRequestID": "ws_CO_test",
                "MerchantRequestID": "mr_test",
            },
        )
        mock_post.return_value.raise_for_status = MagicMock()

        request = _make_post_request(self.user, self._stk_payload(phone))
        process_payment(request)
        sent_payload = mock_post.call_args[1].get("json", {})
        return sent_payload.get("PhoneNumber")

    def test_leading_zero_converted(self):
        self.assertEqual(self._fire("0712345678"), "254712345678")

    def test_plus_254_stripped(self):
        self.assertEqual(self._fire("+254712345678"), "254712345678")

    def test_already_254_unchanged(self):
        self.assertEqual(self._fire("254712345678"), "254712345678")

    def test_raw_digits_prefixed(self):
        self.assertEqual(self._fire("712345678"), "254712345678")


# ---------------------------------------------------------------------------
# 4. STK Push – success / error / missing phone
# ---------------------------------------------------------------------------
@override_settings(**MPESA_SETTINGS, **LOCMEM_CACHE)
class STKPushTests(TestCase):
    def setUp(self):
        cache.clear()
        self.user = User.objects.create_user("buyer", "b@test.com", "pass1234")
        self.category = Category.objects.create(name="Shoes", slug="shoes")
        self.product = Product.objects.create(
            name="Test Shoe",
            description="A shoe",
            price="350.00",
            currency="KES",
            category=self.category,
            sizes=["42"],
            colors=["Black"],
            images=["/placeholder.svg"],
            in_stock=True,
        )

    def _payload(self, **overrides):
        base = {
            "payment_method": "mpesa",
            "amount": 350,
            "phone_number": "0712345678",
            "order_data": {
                "shippingAddress": {
                    "address": "123 Moi Ave",
                    "city": "Nairobi",
                    "country": "KE",
                },
                "items": [{"productId": self.product.id, "quantity": 1, "price": 350}],
            },
        }
        base.update(overrides)
        return base

    @patch("shop.payment_views.requests.post")
    @patch("shop.payment_views.get_mpesa_access_token", return_value="tok")
    def test_stk_push_success_creates_records(self, _tok, mock_post):
        mock_post.return_value = MagicMock(
            status_code=200,
            json=lambda: {
                "ResponseCode": "0",
                "CheckoutRequestID": "ws_CO_123",
                "MerchantRequestID": "mr_123",
            },
        )
        mock_post.return_value.raise_for_status = MagicMock()

        request = _make_post_request(self.user, self._payload())
        response = process_payment(request)
        data = json.loads(response.content)

        self.assertTrue(data["success"])
        self.assertEqual(data["checkout_request_id"], "ws_CO_123")

        # Verify DB records
        self.assertEqual(Order.objects.count(), 1)
        self.assertEqual(Payment.objects.count(), 1)
        self.assertEqual(MpesaPayment.objects.count(), 1)

        payment = Payment.objects.first()
        self.assertEqual(payment.status, "processing")
        self.assertEqual(payment.payment_method, "mpesa")
        self.assertEqual(payment.currency, "KES")

        mpesa = MpesaPayment.objects.first()
        self.assertEqual(mpesa.checkout_request_id, "ws_CO_123")
        self.assertEqual(mpesa.phone_number, "254712345678")

    @patch("shop.payment_views.requests.post")
    @patch("shop.payment_views.get_mpesa_access_token", return_value="tok")
    def test_stk_push_api_error_returns_failure(self, _tok, mock_post):
        mock_post.return_value = MagicMock(
            status_code=200,
            json=lambda: {
                "ResponseCode": "1",
                "errorMessage": "Invalid shortcode",
            },
        )
        mock_post.return_value.raise_for_status = MagicMock()

        request = _make_post_request(self.user, self._payload())
        response = process_payment(request)
        data = json.loads(response.content)

        self.assertFalse(data["success"])
        self.assertIn("Invalid shortcode", data["error"])
        self.assertEqual(Order.objects.count(), 0)

    def test_stk_push_missing_phone_returns_400(self):
        payload = self._payload()
        payload.pop("phone_number")
        request = _make_post_request(self.user, payload)
        response = process_payment(request)
        data = json.loads(response.content)

        self.assertFalse(data["success"])
        self.assertEqual(response.status_code, 400)

    def test_invalid_payment_method_returns_400(self):
        request = _make_post_request(
            self.user, {"payment_method": "bitcoin", "amount": 100}
        )
        response = process_payment(request)
        data = json.loads(response.content)

        self.assertFalse(data["success"])
        self.assertEqual(response.status_code, 400)


# ---------------------------------------------------------------------------
# 5. M-Pesa callback – success / failure / missing record
# ---------------------------------------------------------------------------
@override_settings(**MPESA_SETTINGS, **LOCMEM_CACHE)
class MpesaCallbackTests(TestCase):
    def setUp(self):
        cache.clear()
        self.user = User.objects.create_user("buyer", "b@test.com", "pass1234")
        self.order = Order.objects.create(
            user=self.user,
            order_id="ARNOVA_TEST_001",
            total_amount=Decimal("500.00"),
            shipping_address="{}",
            status="pending",
        )
        self.payment = Payment.objects.create(
            order=self.order,
            payment_method="mpesa",
            amount=Decimal("500.00"),
            currency="KES",
            status="processing",
        )
        self.mpesa = MpesaPayment.objects.create(
            payment=self.payment,
            phone_number="254712345678",
            checkout_request_id="ws_CO_cb_test",
            merchant_request_id="mr_cb_test",
        )

    def _post_callback(self, body):
        return self.client.post(
            "/webhooks/mpesa/",
            data=json.dumps(body),
            content_type="application/json",
        )

    def test_successful_callback_completes_payment(self):
        body = {
            "Body": {
                "stkCallback": {
                    "MerchantRequestID": "mr_cb_test",
                    "CheckoutRequestID": "ws_CO_cb_test",
                    "ResultCode": 0,
                    "ResultDesc": "The service request is processed successfully.",
                    "CallbackMetadata": {
                        "Item": [
                            {"Name": "Amount", "Value": 500},
                            {"Name": "MpesaReceiptNumber", "Value": "QJK3ABCDEF"},
                            {"Name": "TransactionDate", "Value": 20260423143000},
                            {"Name": "PhoneNumber", "Value": 254712345678},
                        ]
                    },
                }
            }
        }
        response = self._post_callback(body)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["ResultCode"], 0)

        self.mpesa.refresh_from_db()
        self.payment.refresh_from_db()

        self.assertEqual(self.mpesa.mpesa_receipt_number, "QJK3ABCDEF")
        self.assertEqual(self.mpesa.result_code, "0")
        self.assertEqual(self.payment.status, "completed")
        self.assertEqual(self.payment.transaction_id, "QJK3ABCDEF")

    def test_failed_callback_marks_payment_failed(self):
        body = {
            "Body": {
                "stkCallback": {
                    "MerchantRequestID": "mr_cb_test",
                    "CheckoutRequestID": "ws_CO_cb_test",
                    "ResultCode": 1032,
                    "ResultDesc": "Request cancelled by user.",
                }
            }
        }
        response = self._post_callback(body)
        self.assertEqual(response.status_code, 200)

        self.mpesa.refresh_from_db()
        self.payment.refresh_from_db()

        self.assertEqual(self.mpesa.result_code, "1032")
        self.assertEqual(self.payment.status, "failed")

    def test_callback_with_unknown_checkout_id_still_returns_200(self):
        body = {
            "Body": {
                "stkCallback": {
                    "MerchantRequestID": "unknown",
                    "CheckoutRequestID": "ws_CO_nonexistent",
                    "ResultCode": 0,
                    "ResultDesc": "Success",
                    "CallbackMetadata": {"Item": []},
                }
            }
        }
        response = self._post_callback(body)
        self.assertEqual(response.status_code, 200)


# ---------------------------------------------------------------------------
# 6. STK Push Query (status check)
# ---------------------------------------------------------------------------
@override_settings(**MPESA_SETTINGS)
class MpesaStatusQueryTests(TestCase):
    def setUp(self):
        self.factory = RequestFactory()

    @patch("shop.payment_views.requests.post")
    @patch("shop.payment_views.get_mpesa_access_token", return_value="tok")
    def test_status_success(self, _tok, mock_post):
        mock_post.return_value = MagicMock(
            status_code=200,
            json=lambda: {
                "ResultCode": "0",
                "ResultDesc": "The service request is processed successfully.",
                "MpesaReceiptNumber": "QJK3ABCDEF",
            },
        )
        mock_post.return_value.raise_for_status = MagicMock()

        request = self.factory.get("/")
        response = check_mpesa_status(request, "ws_CO_123")
        data = json.loads(response.content)
        self.assertEqual(data["status"], "success")
        self.assertEqual(data["result_code"], "0")

    @patch("shop.payment_views.requests.post")
    @patch("shop.payment_views.get_mpesa_access_token", return_value="tok")
    def test_status_pending(self, _tok, mock_post):
        mock_post.return_value = MagicMock(
            status_code=200,
            json=lambda: {
                "ResultCode": "1032",
                "ResultDesc": "Request cancelled by user",
            },
        )
        mock_post.return_value.raise_for_status = MagicMock()

        request = self.factory.get("/")
        response = check_mpesa_status(request, "ws_CO_456")
        data = json.loads(response.content)
        self.assertEqual(data["status"], "pending")


# ---------------------------------------------------------------------------
# 7. Card validation (Luhn)
# ---------------------------------------------------------------------------
class CardValidationTests(TestCase):
    def setUp(self):
        self.factory = RequestFactory()

    def _validate(self, card_number):
        request = self.factory.post(
            "/",
            data=json.dumps({"card_number": card_number}),
            content_type="application/json",
        )
        response = validate_card(request)
        return json.loads(response.content)

    def test_valid_visa(self):
        data = self._validate("4111111111111111")
        self.assertTrue(data["valid"])
        self.assertEqual(data["card_type"], "visa")

    def test_valid_mastercard(self):
        data = self._validate("5500000000000004")
        self.assertTrue(data["valid"])
        self.assertEqual(data["card_type"], "mastercard")

    def test_invalid_number(self):
        data = self._validate("1234567890123456")
        self.assertFalse(data["valid"])

    def test_non_numeric_rejected(self):
        data = self._validate("abcd-efgh-ijkl")
        self.assertFalse(data["valid"])


# ---------------------------------------------------------------------------
# 8. Card payment processing
# ---------------------------------------------------------------------------
@override_settings(**LOCMEM_CACHE)
class CardPaymentTests(TestCase):
    def setUp(self):
        cache.clear()
        self.user = User.objects.create_user("buyer", "b@test.com", "pass1234")

    def test_card_payment_success(self):
        payload = {
            "payment_method": "card",
            "amount": 100,
            "card_data": {
                "cardNumber": "4111111111111111",
                "cardExpiry": "12/30",
                "cardCvc": "123",
                "cardName": "Test User",
            },
        }
        request = _make_post_request(self.user, payload)
        response = process_payment(request)
        data = json.loads(response.content)

        self.assertTrue(data["success"])
        self.assertIn("1111", data["transaction_id"])

    def test_card_payment_missing_field(self):
        payload = {
            "payment_method": "card",
            "amount": 100,
            "card_data": {"cardNumber": "4111111111111111"},
        }
        request = _make_post_request(self.user, payload)
        response = process_payment(request)
        data = json.loads(response.content)

        self.assertFalse(data["success"])
        self.assertEqual(response.status_code, 400)


# ---------------------------------------------------------------------------
# 9. GraphQL mutations – processPayment & validateCard
# ---------------------------------------------------------------------------
@override_settings(**MPESA_SETTINGS, **LOCMEM_CACHE)
class GraphQLPaymentMutationTests(TestCase):
    def setUp(self):
        cache.clear()
        self.user = User.objects.create_user("buyer", "b@test.com", "pass1234")
        UserProfile.objects.create(user=self.user)
        Cart.objects.create(user=self.user)

        # Get JWT token via login mutation
        login = self.client.post(
            "/graphql/",
            data=json.dumps({"query": """
                    mutation {
                      login(username: "buyer", password: "pass1234") {
                        accessToken
                      }
                    }
                    """}),
            content_type="application/json",
        )
        self.token = login.json()["data"]["login"]["accessToken"]

    def _gql(self, query, variables=None):
        payload = {"query": query}
        if variables:
            payload["variables"] = variables
        return self.client.post(
            "/graphql/",
            data=json.dumps(payload),
            content_type="application/json",
            HTTP_AUTHORIZATION=f"Bearer {self.token}",
        )

    def test_validate_card_via_graphql(self):
        response = self._gql(
            """
            mutation ValidateCard($cardNumber: String!) {
              validateCard(cardNumber: $cardNumber) {
                valid
                cardType
              }
            }
            """,
            {"cardNumber": "4111111111111111"},
        )
        data = response.json()["data"]["validateCard"]
        self.assertTrue(data["valid"])
        self.assertEqual(data["cardType"], "visa")

    @patch("shop.payment_views.requests.post")
    @patch("shop.payment_views.get_mpesa_access_token", return_value="tok")
    def test_process_mpesa_payment_via_graphql(self, _tok, mock_post):
        mock_post.return_value = MagicMock(
            status_code=200,
            json=lambda: {
                "ResponseCode": "0",
                "CheckoutRequestID": "ws_CO_gql",
                "MerchantRequestID": "mr_gql",
            },
        )
        mock_post.return_value.raise_for_status = MagicMock()

        response = self._gql(
            """
            mutation ProcessPayment($input: PaymentInput!) {
              processPayment(input: $input) {
                success
                message
                checkoutRequestId
              }
            }
            """,
            {
                "input": {
                    "paymentMethod": "mpesa",
                    "amount": 325.0,
                    "phoneNumber": "0712345678",
                }
            },
        )
        data = response.json()["data"]["processPayment"]
        self.assertTrue(data["success"])
        self.assertEqual(data["checkoutRequestId"], "ws_CO_gql")

    def test_process_card_payment_via_graphql(self):
        response = self._gql(
            """
            mutation ProcessPayment($input: PaymentInput!) {
              processPayment(input: $input) {
                success
                message
                transactionId
              }
            }
            """,
            {
                "input": {
                    "paymentMethod": "card",
                    "amount": 350.0,
                    "cardData": {
                        "cardNumber": "4111111111111111",
                        "cardExpiry": "12/30",
                        "cardCvc": "123",
                        "cardName": "Test Buyer",
                    },
                }
            },
        )
        data = response.json()["data"]["processPayment"]
        self.assertTrue(data["success"])
        self.assertIn("1111", data["transactionId"])
