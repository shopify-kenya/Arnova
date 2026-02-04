from django.shortcuts import redirect


class AdminSecurityMiddleware:
    """Middleware to enforce admin endpoint security"""

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Allow access to Django admin login page
        if request.path.startswith("/django-admin/"):
            response = self.get_response(request)
            return response

        # Allow access to admin login/logout pages
        if request.path in ["/admin/login/", "/admin/logout/"]:
            response = self.get_response(request)
            return response

        # Check if accessing admin endpoints
        if request.path.startswith("/admin/"):
            # Require staff authentication for admin endpoints
            if not (request.user.is_authenticated and request.user.is_staff):
                # Redirect to admin login for web requests
                return redirect(f"/admin/login/?next={request.path}")

        response = self.get_response(request)
        return response
