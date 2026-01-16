from django.http import HttpResponseForbidden, JsonResponse


class AdminSecurityMiddleware:
    """Middleware to enforce admin endpoint security"""

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Allow access to Django admin login page
        if request.path.startswith("/django-admin/"):
            response = self.get_response(request)
            return response

        # Check if accessing admin endpoints (but allow login attempts)
        if request.path.startswith("/admin/") or request.path.startswith("/api/admin/"):
            # Allow POST to login endpoint
            if request.path == "/api/auth/login/" and request.method == "POST":
                response = self.get_response(request)
                return response

            # Require staff authentication for admin endpoints
            if not (request.user.is_authenticated and request.user.is_staff):
                # Return JSON for API requests
                if request.path.startswith("/api/"):
                    return JsonResponse(
                        {
                            "error": "Access denied. Staff privileges required.",
                            "redirect": "/login?redirect=/admin",
                        },
                        status=403,
                    )
                # For web requests, let Next.js handle the redirect
                # Return 403 and let frontend redirect to login
                return JsonResponse(
                    {
                        "error": "Authentication required",
                        "redirect": "/login?redirect=/admin",
                    },
                    status=403,
                )

        response = self.get_response(request)
        return response
