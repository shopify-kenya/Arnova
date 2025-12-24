import json
import base64
import requests
from datetime import datetime
from decimal import Decimal

from django.conf import settings
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.utils import timezone
from .models import Payment, MpesaPayment


def get_mpesa_access_token():
    """Get M-Pesa access token using OAuth"""
    consumer_key = settings.MPESA_CONSUMER_KEY
    consumer_secret = settings.MPESA_CONSUMER_SECRET

    # Encode credentials
    credentials = base64.b64encode(
        f"{consumer_key}:{consumer_secret}".encode()
    ).decode()

    # Determine environment
    if settings.MPESA_ENVIRONMENT == "sandbox":
        url = (
            "https://sandbox.safaricom.co.ke/oauth/v1/generate?"
            "grant_type=client_credentials"
        )
    else:
        url = (
            "https://api.safaricom.co.ke/oauth/v1/generate?"
            "grant_type=client_credentials"
        )

    headers = {"Authorization": f"Basic {credentials}"}

    try:
        response = requests.get(url, headers=headers, timeout=30)
        response.raise_for_status()
        return response.json().get("access_token")
    except requests.RequestException as e:
        raise Exception(f"Failed to get M-Pesa access token: {str(e)}")


def generate_mpesa_password():
    """Generate M-Pesa password for STK Push"""
    shortcode = settings.MPESA_SHORTCODE
    passkey = settings.MPESA_PASSKEY
    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")

    password_string = f"{shortcode}{passkey}{timestamp}"
    password = base64.b64encode(password_string.encode()).decode()

    return password, timestamp


@csrf_exempt
@require_http_methods(["POST"])
def process_payment(request):
    """Process payment for orders"""
    try:
        data = json.loads(request.body)
        payment_method = data.get("payment_method")
        amount = Decimal(str(data.get("amount", 0)))

        if payment_method == "card":
            return process_card_payment(data, amount)
        elif payment_method == "paypal":
            return process_paypal_payment(data, amount)
        elif payment_method == "mpesa":
            return process_mpesa_payment(data, amount)
        else:
            return JsonResponse(
                {"success": False, "error": "Invalid payment method"},
                status=400,
            )

    except Exception as e:
        return JsonResponse({"success": False, "error": str(e)}, status=500)


def process_mpesa_payment(data, amount):
    """Process M-Pesa STK Push payment"""
    try:
        phone_number = data.get("phone_number")
        if not phone_number:
            return JsonResponse(
                {"success": False, "error": "Phone number is required"},
                status=400,
            )

        # Format phone number (ensure it starts with 254)
        if phone_number.startswith("0"):
            phone_number = "254" + phone_number[1:]
        elif phone_number.startswith("+254"):
            phone_number = phone_number[1:]
        elif not phone_number.startswith("254"):
            phone_number = "254" + phone_number

        # Get access token
        access_token = get_mpesa_access_token()

        # Generate password and timestamp
        password, timestamp = generate_mpesa_password()

        # Determine environment URL
        if settings.MPESA_ENVIRONMENT == "sandbox":
            url = "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/" "processrequest"
        else:
            url = "https://api.safaricom.co.ke/mpesa/stkpush/v1/" "processrequest"

        headers = {
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json",
        }

        payload = {
            "BusinessShortCode": settings.MPESA_SHORTCODE,
            "Password": password,
            "Timestamp": timestamp,
            "TransactionType": "CustomerPayBillOnline",
            "Amount": int(amount),
            "PartyA": phone_number,
            "PartyB": settings.MPESA_SHORTCODE,
            "PhoneNumber": phone_number,
            "CallBackURL": settings.MPESA_CALLBACK_URL,
            "AccountReference": (f"ARNOVA{timezone.now().strftime('%Y%m%d%H%M%S')}"),
            "TransactionDesc": "Arnova Purchase",
        }

        response = requests.post(url, json=payload, headers=headers, timeout=30)
        response.raise_for_status()

        result = response.json()

        if result.get("ResponseCode") == "0":
            # Create payment record
            try:
                # Create a temporary order for tracking
                order_id = f"ARNOVA{timezone.now().strftime('%Y%m%d%H%M%S')}"

                # Create payment record
                payment = Payment.objects.create(
                    order_id=order_id,  # This should be actual order ID
                    payment_method="mpesa",
                    amount=amount,
                    currency="KES",
                    status="processing",
                )

                # Create M-Pesa payment record
                MpesaPayment.objects.create(
                    payment=payment,
                    phone_number=phone_number,
                    checkout_request_id=result.get("CheckoutRequestID"),
                    merchant_request_id=result.get("MerchantRequestID"),
                )
            except Exception as e:
                print(f"Error creating payment record: {str(e)}")

            return JsonResponse(
                {
                    "success": True,
                    "checkout_request_id": result.get("CheckoutRequestID"),
                    "merchant_request_id": result.get("MerchantRequestID"),
                    "message": ("STK Push sent successfully. Please check your phone."),
                }
            )
        else:
            return JsonResponse(
                {
                    "success": False,
                    "error": result.get("errorMessage", "M-Pesa payment failed"),
                },
                status=400,
            )

    except Exception as e:
        return JsonResponse(
            {"success": False, "error": f"M-Pesa payment failed: {str(e)}"},
            status=500,
        )


@csrf_exempt
@require_http_methods(["POST"])
def mpesa_callback(request):
    """Handle M-Pesa payment callback"""
    try:
        data = json.loads(request.body)

        # Extract callback data
        stk_callback = data.get("Body", {}).get("stkCallback", {})
        result_code = stk_callback.get("ResultCode")
        result_desc = stk_callback.get("ResultDesc")
        checkout_request_id = stk_callback.get("CheckoutRequestID")

        if result_code == 0:
            # Payment successful
            callback_metadata = stk_callback.get("CallbackMetadata", {}).get("Item", [])

            # Extract payment details
            payment_data = {}
            for item in callback_metadata:
                name = item.get("Name")
                value = item.get("Value")
                if name == "Amount":
                    payment_data["amount"] = value
                elif name == "MpesaReceiptNumber":
                    payment_data["receipt_number"] = value
                elif name == "TransactionDate":
                    payment_data["transaction_date"] = value
                elif name == "PhoneNumber":
                    payment_data["phone_number"] = value

            # Update M-Pesa payment record
            try:
                mpesa_payment = MpesaPayment.objects.get(
                    checkout_request_id=checkout_request_id
                )
                mpesa_payment.mpesa_receipt_number = payment_data.get(
                    "receipt_number", ""
                )
                mpesa_payment.result_code = "0"
                mpesa_payment.result_desc = result_desc
                mpesa_payment.transaction_date = timezone.now()
                mpesa_payment.save()

                # Update payment status
                mpesa_payment.payment.status = "completed"
                mpesa_payment.payment.transaction_id = payment_data.get(
                    "receipt_number", ""
                )
                mpesa_payment.payment.save()

            except MpesaPayment.DoesNotExist:
                print(
                    f"M-Pesa payment record not found for checkout_request_id: {checkout_request_id}"
                )

            print(f"M-Pesa payment successful: {payment_data}")
        else:
            # Payment failed
            try:
                mpesa_payment = MpesaPayment.objects.get(
                    checkout_request_id=checkout_request_id
                )
                mpesa_payment.result_code = str(result_code)
                mpesa_payment.result_desc = result_desc
                mpesa_payment.save()

                # Update payment status
                mpesa_payment.payment.status = "failed"
                mpesa_payment.payment.save()

            except MpesaPayment.DoesNotExist:
                print(
                    f"M-Pesa payment record not found for checkout_request_id: {checkout_request_id}"
                )

            print(f"M-Pesa payment failed: {result_desc}")

        return JsonResponse({"ResultCode": 0, "ResultDesc": "Success"})

    except Exception as e:
        print(f"M-Pesa callback error: {str(e)}")
        return JsonResponse({"ResultCode": 1, "ResultDesc": "Error"})


def process_card_payment(data, amount):
    """Process credit card payment"""
    card_data = data.get("card_data", {})

    # Validate card data
    required_fields = ["cardNumber", "cardExpiry", "cardCvc", "cardName"]
    for field in required_fields:
        if not card_data.get(field):
            return JsonResponse(
                {"success": False, "error": f"Missing {field}"}, status=400
            )

    # Basic card validation
    card_number = card_data["cardNumber"].replace(" ", "")
    if len(card_number) < 13 or len(card_number) > 19:
        return JsonResponse(
            {"success": False, "error": "Invalid card number"}, status=400
        )

    # Simulate payment processing
    # In production, integrate with Stripe or similar
    return JsonResponse(
        {
            "success": True,
            "transaction_id": f"card_{card_number[-4:]}_{amount}",
            "message": "Payment processed successfully",
        }
    )


def process_paypal_payment(data, amount):
    """Process PayPal payment"""
    # Simulate PayPal processing
    # In production, integrate with PayPal API
    return JsonResponse(
        {
            "success": True,
            "transaction_id": f"paypal_{amount}",
            "message": "PayPal payment processed successfully",
            "redirect_url": "https://www.paypal.com/checkoutnow",
        }
    )


@csrf_exempt
@require_http_methods(["GET"])
def check_mpesa_status(request, checkout_request_id):
    """Check M-Pesa payment status"""
    try:
        # Get access token
        access_token = get_mpesa_access_token()

        # Generate password and timestamp
        password, timestamp = generate_mpesa_password()

        # Determine environment URL
        if settings.MPESA_ENVIRONMENT == "sandbox":
            url = "https://sandbox.safaricom.co.ke/mpesa/stkpushquery/v1/" "query"
        else:
            url = "https://api.safaricom.co.ke/mpesa/stkpushquery/v1/" "query"

        headers = {
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json",
        }

        payload = {
            "BusinessShortCode": settings.MPESA_SHORTCODE,
            "Password": password,
            "Timestamp": timestamp,
            "CheckoutRequestID": checkout_request_id,
        }

        response = requests.post(url, json=payload, headers=headers, timeout=30)
        response.raise_for_status()

        result = response.json()

        return JsonResponse(
            {
                "status": (
                    "success"
                    if result.get("ResultCode") == "0"
                    else ("pending" if result.get("ResultCode") == "1032" else "failed")
                ),
                "result_code": result.get("ResultCode", "1"),
                "result_desc": result.get("ResultDesc", "Unknown status"),
                "transaction_id": result.get("MpesaReceiptNumber"),
            }
        )

    except Exception as e:
        return JsonResponse(
            {
                "status": "failed",
                "result_code": "1",
                "result_desc": f"Status check failed: {str(e)}",
            },
            status=500,
        )
    """Validate credit card details"""
    try:
        data = json.loads(request.body)
        card_number = data.get("card_number", "").replace(" ", "")

        # Basic Luhn algorithm check
        def luhn_check(card_num):
            def digits_of(n):
                return [int(d) for d in str(n)]

            digits = digits_of(card_num)
            odd_digits = digits[-1::-2]
            even_digits = digits[-2::-2]
            checksum = sum(odd_digits)
            for d in even_digits:
                checksum += sum(digits_of(d * 2))
            return checksum % 10 == 0

        is_valid = luhn_check(card_number) if card_number.isdigit() else False

        # Determine card type
        card_type = "unknown"
        if card_number.startswith("4"):
            card_type = "visa"
        elif card_number.startswith(("5", "2")):
            card_type = "mastercard"
        elif card_number.startswith("3"):
            card_type = "amex"

        return JsonResponse({"valid": is_valid, "card_type": card_type})
    except Exception as e:
        return JsonResponse({"valid": False, "error": str(e)}, status=500)
