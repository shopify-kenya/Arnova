_How the Unified Server Works_

The unified server architecture integrates Django Templates (admin) and Next.js frontend through a sophisticated routing and build system:

1. Build Process (unified_server.py)

# 1. Builds Next.js frontend

subprocess.run(["npm", "run", "build"])

# 2. Copies build files to Django static directories

subprocess.run([sys.executable, "copy_nextjs_build.py"])

# 3. Runs Django migrations

subprocess.run([sys.executable, "manage.py", "migrate"])

# 4. Starts Django server(s)

python 2. URL Routing Priority (urls.py)
urlpatterns = [ # 1. Django admin (highest priority)
path("admin/", admin.site.urls),

    # 2. Custom admin dashboard (Django templates)
    path("dashboard/", admin_views.admin_dashboard),
    path("dashboard/products/", admin_views.admin_products),
    # ... more admin routes

    # 3. API endpoints
    path("api/", ...),

    # 4. Next.js static assets
    re_path(r"^_next/static/(?P<path>.*)$", serve),

    # 5. Catch-all for Next.js frontend (lowest priority)
    re_path(r"^.*$", views.index),

]

python 3. Request Flow
For Admin Users (/admin/ or /dashboard/):

Django handles authentication via /admin/login/

Custom admin views render Django templates with glass morphism design

Templates use Django's template engine with context data

Static files served from /static/admin/

For Buyers (all other routes):

Next.js build files served from /build/ directory

Client-side routing handled by Next.js

API calls to /api/ endpoints for data

Authentication via API endpoints

1. Static File Serving

# Next.js assets

re_path(r"^\_next/static/(?P<path>.\*)$", serve,
{"document_root": "build/\_next/static"})

# Public assets (manifest, service worker, etc.)

path("manifest.json", serve,
{"document_root": "public", "path": "manifest.json"})

# Catch-all for Next.js pages

re_path(r"^.\*$", views.index) # Serves build/index.html

python 5. Frontend Integration (views.index)
def index(request): # Try specific route HTML file
html_file = os.path.join(build_dir, path, "index.html")

    # Fallback to root index.html
    root_html = os.path.join(build_dir, "index.html")

    # Serve Next.js built HTML with caching
    return HttpResponse(html_content, content_type="text/html")

python
Key Benefits:
Single Server: One Django process serves both admin templates and Next.js frontend

Shared Authentication: Django sessions work across both systems

Unified API: Same API endpoints serve both admin dashboard and customer frontend

Static Optimization: Next.js build optimization with Django caching

SSL Support: Both HTTP/HTTPS with certificate management

The system seamlessly switches between Django template rendering for admin functionality and Next.js static file serving for the customer-facing e-commerce experience.
