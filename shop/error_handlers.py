"""Custom error handlers for graceful error handling"""

import logging

from django.http import JsonResponse
from django.shortcuts import render

logger = logging.getLogger("shop")


def handler404(request, exception=None):
    """Handle 404 errors"""
    if request.path.startswith("/graphql/"):
        return JsonResponse({"error": "Resource not found"}, status=404)
    return render(request, "errors/404.html", status=404)


def handler500(request):
    """Handle 500 errors"""
    logger.error(f"Server error on {request.path}")
    if request.path.startswith("/graphql/"):
        return JsonResponse({"error": "Internal server error"}, status=500)
    return render(request, "errors/500.html", status=500)


def handler403(request, exception=None):
    """Handle 403 errors"""
    if request.path.startswith("/graphql/"):
        return JsonResponse({"error": "Access forbidden"}, status=403)
    return render(request, "errors/403.html", status=403)


def handler400(request, exception=None):
    """Handle 400 errors"""
    if request.path.startswith("/graphql/"):
        return JsonResponse({"error": "Bad request"}, status=400)
    return render(request, "errors/400.html", status=400)
