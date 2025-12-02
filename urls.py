from django.contrib import admin
from django.urls import path, re_path
from django.conf import settings
from django.conf.urls.static import static
from shop import api_views
import views

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # API routes
    path('api/auth/login/', api_views.api_login, name='api_login'),
    path('api/auth/register/', api_views.api_register, name='api_register'),
    path('api/auth/logout/', api_views.api_logout, name='api_logout'),
    path('api/products/', api_views.api_products, name='api_products'),
    path('api/cart/', api_views.api_cart, name='api_cart'),
    path('api/saved/', api_views.api_saved, name='api_saved'),
    path('api/admin/orders/', api_views.api_admin_orders, name='api_admin_orders'),
    
    # Catch-all for Next.js routes
    re_path(r'^.*$', views.index, name='index'),
]

# Serve static files
if settings.STATICFILES_DIRS and len(settings.STATICFILES_DIRS) > 0:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATICFILES_DIRS[0])
