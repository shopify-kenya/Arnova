import os

from django.conf import settings
from django.contrib import admin
from django.urls import path, re_path
from django.views.static import serve

import views
from shop import api_views, payment_views

urlpatterns = [
    path("admin/", admin.site.urls),
    # CSRF Token API
    path("api/csrf-token/", api_views.api_csrf_token, name="api_csrf_token"),
    # Authentication API
    path("api/auth/login/", api_views.api_login, name="api_login"),
    path(
        "api/auth/register/",
        api_views.api_register,
        name="api_register",
    ),
    path(
        "api/auth/logout/",
        api_views.api_logout,
        name="api_logout",
    ),
    # Product API
    path("api/products/", api_views.api_products, name="api_products"),
    path(
        "api/products/<str:product_id>/",
        api_views.api_product_detail,
        name="api_product_detail",
    ),
    path("api/categories/", api_views.api_categories, name="api_categories"),
    # User API
    path("api/cart/", api_views.api_cart, name="api_cart"),
    path("api/saved/", api_views.api_saved, name="api_saved"),
    path("api/profile/", api_views.api_profile, name="api_profile"),
    path("api/orders/", api_views.api_orders, name="api_orders"),
    # Admin API
    path(
        "api/admin/orders/",
        api_views.api_admin_orders,
        name="api_admin_orders",
    ),
    path(
        "api/admin/products/",
        api_views.api_admin_products,
        name="api_admin_products",
    ),
    path("api/admin/users/", api_views.api_admin_users, name="api_admin_users"),
    path(
        "api/admin/analytics/",
        api_views.api_admin_analytics,
        name="api_admin_analytics",
    ),
    # Payment API
    path(
        "api/payment/process/",
        payment_views.process_payment,
        name="api_process_payment",
    ),
    path(
        "api/payment/validate-card/",
        payment_views.validate_card,
        name="api_validate_card",
    ),
    # Serve Next.js static assets
    re_path(
        r"^_next/static/(?P<path>.*)$",
        serve,
        {"document_root": os.path.join(settings.BASE_DIR, "out", "_next", "static")},
    ),
    re_path(
        r"^_next/(?P<path>.*)$",
        serve,
        {"document_root": os.path.join(settings.BASE_DIR, "out", "_next")},
    ),
    # Serve public assets
    path(
        "manifest.json",
        serve,
        {
            "document_root": os.path.join(settings.BASE_DIR, "public"),
            "path": "manifest.json",
        },
    ),
    path(
        "service-worker.js",
        serve,
        {
            "document_root": os.path.join(settings.BASE_DIR, "public"),
            "path": "service-worker.js",
        },
    ),
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
    path(
        "csrf-example/",
        serve,
        {
            "document_root": os.path.join(settings.BASE_DIR, "public"),
            "path": "csrf-example.html",
        },
    ),
    re_path(
        r"^(?P<path>.*\.(jpg|jpeg|png|gif|svg|webp|ico|woff|woff2|ttf|eot|css|js|json))$",  # noqa: E501
        serve,
        {"document_root": os.path.join(settings.BASE_DIR, "public")},
    ),
    # Specific Next.js routes for better handling
    path("", views.index, name="home"),
    # Catch-all for any remaining routes (MUST BE LAST)
    re_path(r"^.*$", views.index, name="catch_all"),
]
