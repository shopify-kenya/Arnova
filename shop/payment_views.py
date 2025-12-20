import json
from decimal import Decimal

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods


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
        else:
            return JsonResponse(
                {"success": False, "error": "Invalid payment method"},
                status=400,
            )

    except Exception as e:
        return JsonResponse({"success": False, "error": str(e)}, status=500)


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
@require_http_methods(["POST"])
def validate_card(request):
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
