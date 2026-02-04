from django.contrib import admin
from django.contrib.admin import AdminSite
from django.shortcuts import redirect

from .models import (
    Cart,
    CartItem,
    Category,
    Notification,
    Order,
    OrderItem,
    Product,
    SavedItem,
    UserProfile,
)


class ArnovaAdminSite(AdminSite):
    site_header = "Arnova Admin"
    site_title = "Arnova Admin Portal"
    index_title = "Welcome to Arnova Administration"
    site_url = "/"
    login_template = None

    def index(self, request, extra_context=None):
        """Redirect admin index to custom dashboard"""
        if request.user.is_authenticated and request.user.is_staff:
            return redirect("admin_dashboard")
        return super().index(request, extra_context)


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ["name", "slug", "created_at"]
    list_filter = ["created_at"]
    search_fields = ["name", "slug"]
    prepopulated_fields = {"slug": ("name",)}
    readonly_fields = ["created_at"]

    fieldsets = (
        ("Basic Information", {"fields": ("name", "slug")}),
        ("Timestamps", {"fields": ("created_at",), "classes": ("collapse",)}),
    )


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = [
        "id",
        "name",
        "category",
        "price",
        "in_stock",
        "is_new",
        "on_sale",
        "created_at",
    ]
    list_filter = ["category", "in_stock", "is_new", "on_sale", "created_at"]
    search_fields = ["name", "description"]
    list_editable = ["price", "in_stock", "is_new", "on_sale"]
    readonly_fields = ["created_at", "updated_at"]

    fieldsets = (
        ("Basic Information", {"fields": ("name", "category", "description")}),
        (
            "Pricing & Stock",
            {"fields": ("price", "in_stock", "is_new", "on_sale")},
        ),
        ("Media", {"fields": ("image",)}),
        (
            "Timestamps",
            {"fields": ("created_at", "updated_at"), "classes": ("collapse",)},
        ),
    )


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ["user", "city", "country", "created_at"]
    list_filter = ["country", "created_at"]
    search_fields = ["user__username", "user__email", "city", "country"]
    readonly_fields = ["created_at"]


class CartItemInline(admin.TabularInline):
    model = CartItem
    extra = 0
    readonly_fields = ["product", "quantity"]


@admin.register(Cart)
class CartAdmin(admin.ModelAdmin):
    list_display = ["user", "created_at", "updated_at"]
    list_filter = ["created_at"]
    search_fields = ["user__username"]
    readonly_fields = ["created_at", "updated_at"]
    inlines = [CartItemInline]


@admin.register(SavedItem)
class SavedItemAdmin(admin.ModelAdmin):
    list_display = ["user", "product", "created_at"]
    list_filter = ["created_at"]
    search_fields = ["user__username", "product__name"]
    readonly_fields = ["created_at"]


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ["product", "quantity", "price"]
    can_delete = False


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ["order_id", "user", "status", "total_amount", "created_at"]
    list_filter = ["status", "created_at"]
    search_fields = ["order_id", "user__username"]
    readonly_fields = ["order_id", "created_at", "updated_at", "total_amount"]
    inlines = [OrderItemInline]

    fieldsets = (
        ("Order Information", {"fields": ("order_id", "user", "status")}),
        ("Financial", {"fields": ("total_amount",)}),
        (
            "Timestamps",
            {"fields": ("created_at", "updated_at"), "classes": ("collapse",)},
        ),
    )


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ["title", "user", "notification_type", "is_read", "created_at"]
    list_filter = ["notification_type", "is_read", "created_at"]
    search_fields = ["title", "message", "user__username"]
    readonly_fields = ["created_at"]
    list_editable = ["is_read"]

    fieldsets = (
        (
            "Notification Details",
            {"fields": ("user", "title", "message", "notification_type", "link")},
        ),
        ("Status", {"fields": ("is_read",)}),
        ("Timestamps", {"fields": ("created_at",), "classes": ("collapse",)}),
    )


# Custom admin site instance
admin_site = ArnovaAdminSite(name="admin")

# Register models with custom admin site
admin_site.register(Category, CategoryAdmin)
admin_site.register(Product, ProductAdmin)
admin_site.register(UserProfile, UserProfileAdmin)
admin_site.register(Cart, CartAdmin)
admin_site.register(SavedItem, SavedItemAdmin)
admin_site.register(Order, OrderAdmin)
admin_site.register(Notification, NotificationAdmin)
