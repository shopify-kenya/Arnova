import mimetypes
import os

from django.conf import settings
from django.http import HttpResponse, HttpResponseNotFound, JsonResponse
from django.views.decorators.cache import cache_control
from django.views.decorators.gzip import gzip_page


def serve_nextjs_static(request, path):
    """Serve Next.js static files with correct MIME types"""
    file_path = os.path.join(settings.BASE_DIR, ".next", path)

    if not os.path.exists(file_path) or not os.path.isfile(file_path):
        return HttpResponseNotFound("File not found")

    # Determine MIME type
    content_type, _ = mimetypes.guess_type(file_path)
    if not content_type:
        if file_path.endswith(".js"):
            content_type = "application/javascript"
        elif file_path.endswith(".css"):
            content_type = "text/css"
        else:
            content_type = "application/octet-stream"

    with open(file_path, "rb") as f:
        response = HttpResponse(f.read(), content_type=content_type)
        if settings.DEBUG:
            response["Cache-Control"] = "no-store"
        else:
            response["Cache-Control"] = "public, max-age=31536000, immutable"
        return response


@gzip_page
@cache_control(max_age=3600, public=True)
def index(request):
    # Get the request path and clean it
    path = request.path.strip("/")

    # Base directory for Next.js output
    next_dir = os.path.join(settings.BASE_DIR, ".next", "server", "app")

    # Try to serve the specific HTML file for this route
    if path:
        # Next.js app output uses "<route>.html" at the app root
        html_file = os.path.join(next_dir, f"{path}.html")
        if os.path.exists(html_file):
            with open(html_file, "r", encoding="utf-8") as f:
                response = HttpResponse(f.read(), content_type="text/html")
                response["Cache-Control"] = "public, max-age=3600"
                return response

        # Fallback for index-style outputs (if present)
        nested_index = os.path.join(next_dir, path, "index.html")
        if os.path.exists(nested_index):
            with open(nested_index, "r", encoding="utf-8") as f:
                response = HttpResponse(f.read(), content_type="text/html")
                response["Cache-Control"] = "public, max-age=3600"
                return response

    # Fallback to root index.html for unknown routes or root
    root_html = os.path.join(next_dir, "index.html")
    if os.path.exists(root_html):
        with open(root_html, "r", encoding="utf-8") as f:
            response = HttpResponse(f.read(), content_type="text/html")
            response["Cache-Control"] = "public, max-age=3600"
            return response

    # Final fallback - serve homepage
    from django.shortcuts import render

    return render(request, "home.html")


def health(request):
    """Simple health check for deploy probes."""
    return JsonResponse({"status": "ok"})
