"""IP-based access control middleware"""

import logging

from django.conf import settings
from django.http import JsonResponse

logger = logging.getLogger("shop")


class IPAccessControlMiddleware:
    """Restrict access to admin endpoints based on IP whitelist"""

    def __init__(self, get_response):
        self.get_response = get_response
        # Get allowed IPs from settings or use defaults
        self.allowed_ips = getattr(
            settings,
            "ADMIN_ALLOWED_IPS",
            ["127.0.0.1", "localhost", "::1"],
        )

    def __call__(self, request):
        # Check if accessing admin or admin API endpoints
        if (
            request.path.startswith("/admin/")
            or request.path.startswith("/django-admin/")
        ):
            client_ip = self.get_client_ip(request)

            # Allow if IP is whitelisted or in development mode
            if not settings.DEBUG and client_ip not in self.allowed_ips:
                logger.warning(
                    f"Unauthorized admin access attempt from IP: {client_ip}"
                )
                return JsonResponse(
                    {"error": "Access denied from your IP address"}, status=403
                )

        response = self.get_response(request)
        return response

    def get_client_ip(self, request):
        """Get the client's IP address"""
        x_forwarded_for = request.META.get("HTTP_X_FORWARDED_FOR")
        if x_forwarded_for:
            ip = x_forwarded_for.split(",")[0].strip()
        else:
            ip = request.META.get("REMOTE_ADDR")
        return ip
