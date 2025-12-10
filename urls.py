import os

from django.conf import settings
from django.contrib import admin
from django.urls import path, re_path
from django.views.static import serve

import views
from shop import api_views

urlpatterns = [
    path("admin/", admin.site.urls),
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
    path(
        "api/admin/users/", api_views.api_admin_users, name="api_admin_users"
    ),
    path(
        "api/admin/analytics/",
        api_views.api_admin_analytics,
        name="api_admin_analytics",
    ),
    # Serve Next.js static assets
    re_path(
        r"^_next/static/(?P<path>.*)$",
        serve,
        {"document_root": os.path.join(settings.BASE_DIR, ".next", "static")},
    ),
    re_path(
        r"^_next/(?P<path>.*)$",
        serve,
        {"document_root": os.path.join(settings.BASE_DIR, ".next")},
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
    re_path(
        r"^(?P<path>.*\.(jpg|jpeg|png|gif|svg|webp|ico|woff|woff2|ttf|eot|css|js|json))$",  # noqa: E501
        serve,
        {"document_root": os.path.join(settings.BASE_DIR, "public")},
    ),
    # Specific Next.js routes for better handling
    path("", views.index, name="home"),
    path("login/", views.index, name="login"),
    path("register/", views.index, name="register"),
    path("profile/", views.index, name="profile"),
    path("cart/", views.index, name="cart"),
    path("checkout/", views.index, name="checkout"),
    path("saved/", views.index, name="saved"),
    path("about/", views.index, name="about"),
    path("contact/", views.index, name="contact"),
    path("faq/", views.index, name="faq"),
    path("careers/", views.index, name="careers"),
    path("shipping/", views.index, name="shipping"),
    path("returns/", views.index, name="returns"),
    path("privacy/", views.index, name="privacy"),
    path("terms/", views.index, name="terms"),
    path("size-guide/", views.index, name="size_guide"),
    path("offline/", views.index, name="offline"),
    # Category routes
    path("new-arrivals/", views.index, name="new_arrivals"),
    path("clothing/", views.index, name="clothing"),
    path("shoes/", views.index, name="shoes"),
    path("bags/", views.index, name="bags"),
    path("accessories/", views.index, name="accessories"),
    path("sale/", views.index, name="sale"),
    # Product routes
    path("product/<str:product_id>/", views.index, name="product_detail"),
    # Admin routes
    path("admin-panel/", views.index, name="admin_panel"),
    path("admin-panel/products/", views.index, name="admin_products"),
    path("admin-panel/orders/", views.index, name="admin_orders"),
    path("admin-panel/users/", views.index, name="admin_users"),
    path("admin-panel/analytics/", views.index, name="admin_analytics"),
    # Catch-all for any remaining routes (MUST BE LAST)
    re_path(r"^.*$", views.index, name="catch_all"),
]
