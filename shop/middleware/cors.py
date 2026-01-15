from django.conf import settings
from django.http import JsonResponse
from django.utils.deprecation import MiddlewareMixin


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
        origin = request.META.get("HTTP_ORIGIN")

        # Check if the origin is in the trusted list from settings
        if origin and origin in settings.CSRF_TRUSTED_ORIGINS:
            response["Access-Control-Allow-Origin"] = origin
            response["Access-Control-Allow-Credentials"] = "true"

        response["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
        response["Access-control-allow-headers"] = (
            "Accept, Content-Type, X-CSRFToken, Authorization, " "X-Requested-With"
        )
        response["Access-Control-Max-Age"] = "3600"

        return response
