from django.http import JsonResponse


class AuthMiddleware:
    """Middleware to secure API routes"""

    PROTECTED_PATHS = [
        "/api/cart/",
        "/api/orders/",
        "/api/saved/",
        "/api/profile/",
    ]

    DRF_ADMIN_PATHS = [
        "/api/admin/products/",
        "/api/admin/orders/",
        "/api/admin/users/",
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
        # Skip DRF admin paths - they handle their own authentication
        is_drf_admin = any(
            request.path.startswith(path) for path in self.DRF_ADMIN_PATHS
        )
        if is_drf_admin:
            response = self.get_response(request)
            return response
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
