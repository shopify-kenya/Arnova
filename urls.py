import os

from django.conf import settings
from django.urls import include, path, re_path
from django.views.static import serve

import views
from shop import (
    admin_auth_views,
    admin_views,
    payment_views,
    static_views,
)
from shop.admin import admin_site
from shop.error_handlers import handler400, handler403, handler404, handler500
from shop.graphql.context import get_context
from shop.graphql.schema import schema
from shop.graphql.view import CSRFExemptGraphQLView

# Admin URLs - separate namespace for security
admin_patterns = [
    path("", admin_views.admin_dashboard, name="admin_dashboard"),
    path("profile/", admin_views.admin_profile, name="admin_profile"),
    path("products/", admin_views.admin_products, name="admin_products"),
    path(
        "products/create/",
        admin_views.admin_product_create,
        name="admin_product_create",
    ),
    path(
        "products/<str:product_id>/edit/",
        admin_views.admin_product_edit,
        name="admin_product_edit",
    ),
    path(
        "products/<str:product_id>/delete/",
        admin_views.admin_product_delete,
        name="admin_product_delete",
    ),
    path("orders/", admin_views.admin_orders, name="admin_orders"),
    path(
        "orders/<int:order_id>/",
        admin_views.admin_order_detail,
        name="admin_order_detail",
    ),
    path(
        "orders/<int:order_id>/update/",
        admin_views.admin_order_update_status,
        name="admin_order_update_status",
    ),
    path("notifications/", admin_views.admin_notifications, name="admin_notifications"),
    path("users/", admin_views.admin_users, name="admin_users"),
    path(
        "users/<int:user_id>/", admin_views.admin_user_detail, name="admin_user_detail"
    ),
    path("analytics/", admin_views.admin_analytics, name="admin_analytics"),
    path("settings/", admin_views.admin_settings, name="admin_settings"),
]

urlpatterns = [
    # Admin login/logout
    path("admin/login/", admin_auth_views.admin_login, name="admin_login"),
    path("admin/logout/", admin_auth_views.admin_logout, name="admin_logout"),
    # Admin dashboard - staff only (secured)
    path("admin/", include(admin_patterns)),
    # Django admin site
    path("django-admin/", admin_site.urls),
    # GraphQL API endpoint
    path(
        "graphql/",
        CSRFExemptGraphQLView.as_view(
            schema=schema, graphql_ide="graphiql" if settings.GRAPHQL_GRAPHIQL else None, get_context=get_context
        ),
        name="graphql",
    ),
    # Health check
    path("health/", views.health, name="health"),
    # Webhooks
    path("webhooks/mpesa/", payment_views.mpesa_callback, name="mpesa_callback"),
    # Serve Next.js static assets
    re_path(
        r"^_next/(?P<path>.*)$",
        views.serve_nextjs_static,
        name="nextjs_static",
    ),
    # Service Worker and Manifest with proper MIME types
    path("service-worker.js", static_views.serve_service_worker, name="service_worker"),
    path("manifest.json", static_views.serve_manifest, name="manifest"),
    # Serve public assets
    path(
        "robots.txt",
        serve,
        {
            "document_root": os.path.join(settings.BASE_DIR, "public"),
            "path": "robots.txt",
        },
    ),
    path(
        "sitemap.xml",
        serve,
        {
            "document_root": os.path.join(settings.BASE_DIR, "public"),
            "path": "sitemap.xml",
        },
    ),
    re_path(
        r"^(?P<path>.*\.(jpg|jpeg|png|gif|svg|webp|ico|woff|woff2|ttf|"
        r"eot|css|js|json))$",
        serve,
        {"document_root": os.path.join(settings.BASE_DIR, "public")},
    ),
    # Specific Next.js routes for better handling
    path("", views.index, name="home"),
    # Catch-all for any remaining routes (MUST BE LAST)
    re_path(r"^.*$", views.index, name="catch_all"),
]

# Error handlers
handler404 = handler404
handler500 = handler500
handler403 = handler403
handler400 = handler400
