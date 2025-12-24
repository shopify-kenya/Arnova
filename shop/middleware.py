from django.http import JsonResponse
from django.utils.deprecation import MiddlewareMixin


class AuthMiddleware:
    """Middleware to secure API routes"""

    PROTECTED_PATHS = [
        "/api/cart/",
        "/api/orders/",
        "/api/saved/",
        "/api/profile/",
        "/api/admin/",
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
        protected = any(request.path.startswith(path) for path in self.PROTECTED_PATHS)
        if protected:
            if not request.user.is_authenticated:
                return JsonResponse(
                    {"error": "Authentication required"},
                    status=401,
                )

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
        if not request.user.is_authenticated:
            return JsonResponse({"error": "Authentication required"}, status=401)
        if not request.user.is_staff:
            return JsonResponse({"error": "Admin access required"}, status=403)
        return view_func(request, *args, **kwargs)

    return wrapper


class CorsMiddleware(MiddlewareMixin):
    """CORS middleware for frontend-backend integration"""

    def process_request(self, request):
        if request.method == "OPTIONS":
            response = JsonResponse({"status": "ok"})
            return self.add_cors_headers(request, response)
        return None

    def process_response(self, request, response):
        return self.add_cors_headers(request, response)

    def add_cors_headers(self, request, response):
        # For same-origin requests, minimal CORS headers needed
        host = request.META.get("HTTP_HOST", "")
        origin = request.META.get("HTTP_ORIGIN")

        # Allow same-origin and local development
        if (
            not origin
            or host in origin
            or origin
            in [
                "http://127.0.0.1:8000",
                "https://127.0.0.1:8443",
                "http://localhost:8000",
                "https://localhost:8443",
            ]
        ):
            if origin:
                response["Access-Control-Allow-Origin"] = origin
            response["Access-Control-Allow-Credentials"] = "true"

        response["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
        response["Access-Control-Allow-Headers"] = (
            "Accept, Content-Type, X-CSRFToken, Authorization, " "X-Requested-With"
        )
        response["Access-Control-Max-Age"] = "3600"

        return response
