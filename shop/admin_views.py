from django.conf import settings
from django.contrib import messages
from django.contrib.admin.views.decorators import staff_member_required
from django.contrib.auth.models import User
from django.core.paginator import Paginator
from django.db.models import Count, Sum
from django.http import JsonResponse
from django.shortcuts import get_object_or_404, redirect, render
from django.views.decorators.http import require_http_methods

from .models import Category, Order, Product, UserProfile


def is_admin(user):
    """Check if user is admin/staff"""
    return user.is_authenticated and user.is_staff


@staff_member_required
def admin_dashboard(request):
    """Admin dashboard with analytics"""
    # Get analytics data
    total_orders = Order.objects.count()
    total_revenue = (
        Order.objects.aggregate(Sum("total_amount"))["total_amount__sum"] or 0
    )
    total_users = User.objects.count()
    total_products = Product.objects.count()

    # Recent orders
    recent_orders = Order.objects.select_related("user").order_by("-created_at")[:5]

    # Popular products
    popular_products = Product.objects.annotate(
        order_count=Count("orderitem")
    ).order_by("-order_count")[:5]

    context = {
        "total_orders": total_orders,
        "total_revenue": float(total_revenue),
        "total_users": total_users,
        "total_products": total_products,
        "recent_orders": recent_orders,
        "popular_products": popular_products,
    }
    return render(request, "admin/dashboard.html", context)


@staff_member_required
def admin_products(request):
    """Admin products management"""
    products = Product.objects.select_related("category").order_by("-created_at")

    # Pagination
    paginator = Paginator(products, 20)
    page_number = request.GET.get("page")
    page_obj = paginator.get_page(page_number)

    categories = Category.objects.all()

    context = {
        "page_obj": page_obj,
        "categories": categories,
    }
    return render(request, "admin/products.html", context)


@staff_member_required
def admin_product_create(request):
    """Create new product"""
    if request.method == "GET":
        categories = Category.objects.all()
        context = {
            "title": "Create Product",
            "subtitle": "Add a new product to the store",
            "button_text": "Create Product",
            "categories": categories,
            "available_sizes": ["XS", "S", "M", "L", "XL", "XXL", "XXXL"],
            "available_colors": [
                "Black",
                "White",
                "Red",
                "Blue",
                "Green",
                "Yellow",
                "Pink",
                "Purple",
                "Gray",
                "Brown",
            ],
        }
        return render(request, "admin/product_form.html", context)

    # Handle POST with JSON
    import json

    try:
        data = json.loads(request.body)
        category = get_object_or_404(Category, id=data.get("category_id"))

        # Auto-fetch images if not provided
        images = data.get("images", [])
        if not images or len(images) == 0:
            try:
                import requests
                from decouple import config

                access_key = config("UNSPLASH_ACCESS_KEY", default="")
                if access_key:
                    search_url = "https://api.unsplash.com/search/photos"
                    params = {
                        "query": data.get("name"),
                        "per_page": 3,
                        "orientation": "portrait",
                        "client_id": access_key,
                    }
                    response = requests.get(search_url, params=params, timeout=10)
                    if response.status_code == 200:
                        results = response.json().get("results", [])
                        images = [img["urls"]["regular"] for img in results[:3]]
            except Exception as e:
                print(f"Failed to fetch images: {e}")

            if not images:
                images = ["/placeholder.svg"]

        product = Product.objects.create(
            name=data.get("name"),
            description=data.get("description"),
            price=data.get("price"),
            sale_price=data.get("sale_price"),
            currency=data.get("currency", "KES"),
            category=category,
            sizes=data.get("sizes", []),
            colors=data.get("colors", []),
            images=images,
            in_stock=data.get("in_stock", True),
            is_new=data.get("is_new", False),
            on_sale=data.get("on_sale", False),
            rating=data.get("rating", 4.5),
            reviews=data.get("reviews", 0),
        )
        return JsonResponse({"success": True, "product_id": product.id})
    except Exception as e:
        return JsonResponse({"success": False, "error": str(e)}, status=400)


@staff_member_required
def admin_product_edit(request, product_id):
    """Edit product"""
    product = get_object_or_404(Product, id=product_id)

    if request.method == "POST":
        try:
            category = get_object_or_404(Category, id=request.POST.get("category_id"))

            product.name = request.POST.get("name")
            product.description = request.POST.get("description")
            product.price = request.POST.get("price")
            product.sale_price = request.POST.get("sale_price") or None
            product.currency = request.POST.get("currency", "USD")
            product.category = category
            product.in_stock = request.POST.get("in_stock") == "on"
            product.is_new = request.POST.get("is_new") == "on"
            product.on_sale = request.POST.get("on_sale") == "on"
            product.save()
            messages.success(request, f'Product "{product.name}" updated successfully.')
            return redirect("admin_products")
        except Exception as e:
            messages.error(request, f"Error updating product: {str(e)}")

    categories = Category.objects.all()
    context = {
        "product": product,
        "categories": categories,
    }
    return render(request, "admin/product_edit.html", context)


@staff_member_required
@require_http_methods(["POST"])
def admin_product_delete(request, product_id):
    """Delete product"""
    try:
        product = get_object_or_404(Product, id=product_id)
        product_name = product.name
        product.delete()
        messages.success(request, f'Product "{product_name}" deleted successfully.')
    except Exception as e:
        messages.error(request, f"Error deleting product: {str(e)}")
    return redirect("admin_products")


@staff_member_required
def admin_orders(request):
    """Admin orders management"""
    orders = Order.objects.select_related("user").order_by("-created_at")

    # Pagination
    paginator = Paginator(orders, 20)
    page_number = request.GET.get("page")
    page_obj = paginator.get_page(page_number)

    context = {
        "page_obj": page_obj,
    }
    return render(request, "admin/orders.html", context)


@staff_member_required
def admin_users(request):
    """Admin users management"""
    users = User.objects.select_related("userprofile").order_by("-date_joined")

    # Pagination
    paginator = Paginator(users, 20)
    page_number = request.GET.get("page")
    page_obj = paginator.get_page(page_number)

    context = {
        "page_obj": page_obj,
    }
    return render(request, "admin/users.html", context)


@staff_member_required
def admin_analytics(request):
    """Admin analytics page"""
    from datetime import datetime, timedelta

    from django.db.models import Sum
    from django.db.models.functions import TruncMonth

    # Sales trends (last 6 months) - real data
    six_months_ago = datetime.now() - timedelta(days=180)
    sales_by_month = (
        Order.objects.filter(created_at__gte=six_months_ago)
        .annotate(month=TruncMonth("created_at"))
        .values("month")
        .annotate(sales=Sum("total_amount"), orders=Count("id"))
        .order_by("-month")
    )

    sales_trends = [
        {
            "month": item["month"].strftime("%b"),
            "sales": float(item["sales"] or 0),
            "orders": item["orders"],
        }
        for item in sales_by_month
    ]

    # Category stats - real data
    category_stats = []
    for category in Category.objects.all():
        product_count = category.product_set.count()
        order_count = sum(p.orderitem_set.count() for p in category.product_set.all())
        category_stats.append(
            {
                "name": category.name,
                "saved_items": product_count,
                "orders": order_count,
                "popularity_score": min(product_count + (order_count * 2), 100),
            }
        )

    context = {
        "sales_trends": sales_trends,
        "category_stats": category_stats,
    }
    return render(request, "admin/analytics.html", context)


@staff_member_required
def admin_order_detail(request, order_id):
    """Admin order detail view"""
    order = get_object_or_404(Order, id=order_id)
    context = {
        "order": order,
    }
    return render(request, "admin/order_detail.html", context)


@staff_member_required
@require_http_methods(["POST"])
def admin_order_update_status(request, order_id):
    """Update order status"""
    try:
        order = get_object_or_404(Order, id=order_id)
        new_status = request.POST.get("status")
        if new_status in ["pending", "processing", "shipped", "delivered", "cancelled"]:
            order.status = new_status
            order.save()
            messages.success(
                request, f"Order #{order.id} status updated to {new_status}."
            )
        else:
            messages.error(request, "Invalid status provided.")
    except Exception as e:
        messages.error(request, f"Error updating order status: {str(e)}")
    return redirect("admin_order_detail", order_id=order_id)


@staff_member_required
def admin_user_detail(request, user_id):
    """Admin user detail view"""
    user = get_object_or_404(User, id=user_id)
    profile, _ = UserProfile.objects.get_or_create(user=user)
    context = {
        "user": user,
        "profile": profile,
    }
    return render(request, "admin/user_detail.html", context)


@staff_member_required
def admin_settings(request):
    """Admin settings page"""
    if request.method == "POST":
        request.session["site_name"] = request.POST.get("site_name", "Arnova")
        request.session["site_description"] = request.POST.get(
            "site_description", "Premium Fashion E-commerce"
        )
        request.session["contact_email"] = request.POST.get(
            "contact_email", "admin@arnova.com"
        )
        request.session["default_currency"] = request.POST.get(
            "default_currency", "KES"
        )

        messages.success(request, "Settings updated successfully.")
        return redirect("admin_settings")

    context = {
        "site_name": request.session.get("site_name", "Arnova"),
        "site_description": request.session.get(
            "site_description", "Premium Fashion E-commerce"
        ),
        "contact_email": request.session.get("contact_email", "admin@arnova.com"),
        "default_currency": request.session.get("default_currency", "KES"),
        "debug": settings.DEBUG,
    }
    return render(request, "admin/settings.html", context)


@staff_member_required
def admin_notifications(request):
    """Admin notifications page"""
    return render(request, "admin/notifications.html")


@staff_member_required
def admin_profile(request):
    """Admin profile page"""
    return render(request, "admin/profile.html")
