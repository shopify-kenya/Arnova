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
