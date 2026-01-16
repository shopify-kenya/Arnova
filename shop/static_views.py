"""Custom views for static file serving"""

import os

from django.conf import settings
from django.http import FileResponse, Http404, HttpResponse


def serve_service_worker(request):
    """Serve service worker with correct MIME type"""
    file_path = os.path.join(settings.BASE_DIR, "public", "service-worker.js")

    if not os.path.exists(file_path):
        raise Http404("Service worker not found")

    with open(file_path, "r") as f:
        content = f.read()

    response = HttpResponse(content, content_type="application/javascript")
    response["Service-Worker-Allowed"] = "/"
    response["Cache-Control"] = "no-cache, no-store, must-revalidate"
    return response


def serve_manifest(request):
    """Serve manifest with correct MIME type"""
    file_path = os.path.join(settings.BASE_DIR, "public", "manifest.json")

    if not os.path.exists(file_path):
        raise Http404("Manifest not found")

    return FileResponse(open(file_path, "rb"), content_type="application/manifest+json")
