from django.http import HttpResponseForbidden, JsonResponse


class AdminSecurityMiddleware:
    """Middleware to enforce admin endpoint security"""

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Check if accessing admin endpoints
        if request.path.startswith("/admin/") or request.path.startswith("/api/admin/"):
            # Require staff authentication for admin endpoints
            if not (request.user.is_authenticated and request.user.is_staff):
                # Return JSON for API requests
                if request.path.startswith("/api/"):
                    return JsonResponse(
                        {"error": "Access denied. Staff privileges required."},
                        status=403,
                    )
                return HttpResponseForbidden(
                    "Access denied. Staff privileges required."
                )

        response = self.get_response(request)
        return response
