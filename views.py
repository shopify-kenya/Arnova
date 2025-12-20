import os

from django.conf import settings
from django.http import HttpResponse
from django.views.decorators.cache import cache_control
from django.views.decorators.gzip import gzip_page


@gzip_page
@cache_control(max_age=3600, public=True)
def index(request):
    # Get the request path and clean it
    path = request.path.strip("/")

    # Base directory for Next.js output
    out_dir = os.path.join(settings.BASE_DIR, "out")

    # Try to serve the specific HTML file for this route
    if path:
        # Handle nested routes (e.g., admin/users, product/cl-001)
        html_file = os.path.join(out_dir, path, "index.html")
        if os.path.exists(html_file):
            with open(html_file, "r", encoding="utf-8") as f:
                response = HttpResponse(f.read(), content_type="text/html")
                response["Cache-Control"] = "public, max-age=3600"
                return response

    # Fallback to root index.html for unknown routes or root
    root_html = os.path.join(out_dir, "index.html")
    if os.path.exists(root_html):
        with open(root_html, "r", encoding="utf-8") as f:
            response = HttpResponse(f.read(), content_type="text/html")
            response["Cache-Control"] = "public, max-age=3600"
            return response

    # Final fallback if no Next.js build exists
    return HttpResponse(
        """
<!DOCTYPE html>
<html>
<head>
    <title>Arnova - Premium Fashion</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body>
    <div style="text-align:center; padding:50px; font-family:Arial;">
        <h1>🛍️ Arnova Shop</h1>
        <p>Django backend is running!</p>
        <p>Run <code>npm run build</code> to generate the "
        "frontend.</p>
        <p><a href="/admin/">Django Admin</a> | "
        "<a href="/api/products/">API</a></p>
    </div>
</body>
</html>
        """,
        content_type="text/html",
    )
