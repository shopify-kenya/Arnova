from django.contrib import admin
from django.urls import path, re_path
from django.conf import settings
from django.conf.urls.static import static
from django.views.static import serve
from shop import api_views
import views
import os

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # Authentication API
    path('api/auth/login/', api_views.api_login, name='api_login'),
    path('api/auth/register/', api_views.api_register, name='api_register'),
    path('api/auth/logout/', api_views.api_logout, name='api_logout'),
    
    # Product API
    path('api/products/', api_views.api_products, name='api_products'),
    path('api/products/<str:product_id>/', api_views.api_product_detail, name='api_product_detail'),
    path('api/categories/', api_views.api_categories, name='api_categories'),
    
    # User API
    path('api/cart/', api_views.api_cart, name='api_cart'),
    path('api/saved/', api_views.api_saved, name='api_saved'),
    path('api/profile/', api_views.api_profile, name='api_profile'),
    path('api/orders/', api_views.api_orders, name='api_orders'),
    
    # Admin API
    path('api/admin/orders/', api_views.api_admin_orders, name='api_admin_orders'),
    path('api/admin/products/', api_views.api_admin_products, name='api_admin_products'),
    path('api/admin/users/', api_views.api_admin_users, name='api_admin_users'),
    path('api/admin/analytics/', api_views.api_admin_analytics, name='api_admin_analytics'),
    
    # Serve Next.js static files directly
    re_path(r'^_next/(?P<path>.*)$', serve, {'document_root': os.path.join(settings.BASE_DIR, 'build', '_next')}),
    re_path(r'^manifest.json$', serve, {'document_root': os.path.join(settings.BASE_DIR, 'public')}),
    
    # Catch-all for Next.js routes
    re_path(r'^.*$', views.index, name='index'),
]
