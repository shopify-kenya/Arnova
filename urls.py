import os

from django.conf import settings
from django.contrib import admin
from django.urls import path, re_path
from django.views.static import serve

import views
from shop import admin_views, api_views, payment_views
from shop.admin import admin_site
from shop.admin_api_views import AdminOrdersView, AdminProductsView, AdminUsersView

urlpatterns = [
    # Django admin for staff login with custom redirect
    path("admin/", admin_site.urls),
    # Custom admin dashboard using Django templates
    path("dashboard/", admin_views.admin_dashboard, name="admin_dashboard"),
    path("dashboard/products/", admin_views.admin_products, name="admin_products"),
    path(
        "dashboard/products/create/",
        admin_views.admin_product_create,
        name="admin_product_create",
    ),
    path(
        "dashboard/products/<str:product_id>/edit/",
        admin_views.admin_product_edit,
        name="admin_product_edit",
    ),
    path(
        "dashboard/products/<str:product_id>/delete/",
        admin_views.admin_product_delete,
        name="admin_product_delete",
    ),
    path("dashboard/orders/", admin_views.admin_orders, name="admin_orders"),
    path(
        "dashboard/orders/<int:order_id>/",
        admin_views.admin_order_detail,
        name="admin_order_detail",
    ),
    path(
        "dashboard/orders/<int:order_id>/update/",
        admin_views.admin_order_update_status,
        name="admin_order_update_status",
    ),
    path("dashboard/users/", admin_views.admin_users, name="admin_users"),
    path(
        "dashboard/users/<int:user_id>/",
        admin_views.admin_user_detail,
        name="admin_user_detail",
    ),
    path("dashboard/analytics/", admin_views.admin_analytics, name="admin_analytics"),
    path("dashboard/settings/", admin_views.admin_settings, name="admin_settings"),
    # API routes
    path("api/health/", api_views.api_health_check, name="api_health_check"),
    path("api/auth/status/", api_views.api_auth_status, name="api_auth_status"),
    path("api/csrf-token/", api_views.api_csrf_token, name="api_csrf_token"),
    path("api/auth/login/", api_views.api_login, name="api_login"),
    path("api/auth/register/", api_views.api_register, name="api_register"),
    path("api/auth/logout/", api_views.api_logout, name="api_logout"),
    path("api/products/", api_views.api_products, name="api_products"),
    path(
        "api/products/<str:product_id>/",
        api_views.api_product_detail,
        name="api_product_detail",
    ),
    path("api/categories/", api_views.api_categories, name="api_categories"),
    path("api/cart/", api_views.api_cart, name="api_cart"),
    path("api/saved/", api_views.api_saved, name="api_saved"),
    path("api/profile/", api_views.api_profile, name="api_profile"),
    path("api/orders/", api_views.api_orders, name="api_orders"),
    path(
        "api/admin/orders/",
        AdminOrdersView.as_view(),
        name="api_admin_orders_drf",
    ),
    path(
        "api/admin/products/",
        AdminProductsView.as_view(),
        name="api_admin_products_drf",
    ),
    path(
        "api/admin/users/",
        AdminUsersView.as_view(),
        name="api_admin_users_drf",
    ),
    path(
        "api/admin/products/<str:product_id>/",
        api_views.api_admin_product_detail,
        name="api_admin_product_detail",
    ),
    path(
        "api/admin/users/<int:user_id>/",
        api_views.api_admin_user_detail,
        name="api_admin_user_detail",
    ),
    path(
        "api/admin/analytics/",
        api_views.api_admin_analytics,
        name="api_admin_analytics",
    ),
    path(
        "api/admin/settings/",
        api_views.api_admin_settings,
        name="api_admin_settings",
    ),
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
    path(
        "api/payment/mpesa/callback/",
        payment_views.mpesa_callback,
        name="api_mpesa_callback",
    ),
    path(
        "api/payment/mpesa/status/<str:checkout_request_id>/",
        payment_views.check_mpesa_status,
        name="api_mpesa_status",
    ),
    path(
        "api/placeholder/<int:width>/<int:height>",
        api_views.api_placeholder_image,
        name="api_placeholder_image",
    ),
    path(
        "api/exchange-rates/",
        api_views.api_exchange_rates,
        name="api_exchange_rates",
    ),
    # Serve Next.js static assets
    re_path(
        r"^_next/static/(?P<path>.*)$",
        serve,
        {"document_root": os.path.join(settings.BASE_DIR, "build", "_next", "static")},
    ),
    re_path(
        r"^_next/(?P<path>.*)$",
        serve,
        {"document_root": os.path.join(settings.BASE_DIR, "build", "_next")},
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
