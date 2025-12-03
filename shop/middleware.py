import json

from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt


class AuthMiddleware:
    """Middleware to secure API routes"""

    PROTECTED_PATHS = [
        "/api/cart/",
        "/api/orders/",
        "/api/saved/",
        "/api/profile/",
        "/admin/",
    ]

    PUBLIC_PATHS = [
        "/api/products/",
        "/api/categories/",
        "/api/auth/login/",
        "/api/auth/register/",
    ]

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Check if path requires authentication
        if any(request.path.startswith(path) for path in self.PROTECTED_PATHS):
            if not request.user.is_authenticated:
                return JsonResponse({"error": "Authentication required"}, status=401)

        response = self.get_response(request)
        return response


def api_login_required(view_func):
    """Decorator for API views that require authentication"""

    def wrapper(request, *args, **kwargs):
        if not request.user.is_authenticated:
            return JsonResponse({"error": "Authentication required"}, status=401)
        return view_func(request, *args, **kwargs)

    return wrapper


def admin_required(view_func):
    """Decorator for admin-only views"""

    def wrapper(request, *args, **kwargs):
        if not request.user.is_authenticated or not request.user.is_staff:
            return JsonResponse({"error": "Admin access required"}, status=403)
        return view_func(request, *args, **kwargs)

    return wrapper
