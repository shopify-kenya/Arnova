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
        response = self.add_cors_headers(request, response)
        # Ensure CSRF cookie is set for all responses
        if not request.COOKIES.get(settings.CSRF_COOKIE_NAME):
            from django.middleware.csrf import get_token

            get_token(request)
        return response

    def add_cors_headers(self, request, response):
        origin = request.META.get("HTTP_ORIGIN")

        # Allow localhost, Render, and Vercel origins
        allowed_origins = [
            "http://localhost:3000",
            "http://localhost:8000",
            "http://127.0.0.1:3000",
            "http://127.0.0.1:8000",
            "https://localhost:8443",
            "https://127.0.0.1:8443",
            "https://arnova-207y.onrender.com",
        ]

        # Allow all Vercel preview and production domains
        if origin and (origin in allowed_origins or origin.endswith(".vercel.app")):
            response["Access-Control-Allow-Origin"] = origin
            response["Access-Control-Allow-Credentials"] = "true"

        response["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
        response["Access-Control-Allow-Headers"] = (
            "Accept, Content-Type, X-CSRFToken, Authorization, X-Requested-With"
        )
        response["Access-Control-Max-Age"] = "3600"

        return response
