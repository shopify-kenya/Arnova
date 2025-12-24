from django.contrib import messages
from django.contrib.auth import authenticate, login
from django.contrib.auth.decorators import login_required, user_passes_test
from django.contrib.auth.models import User
from django.core.paginator import Paginator
from django.db.models import Count, Sum
from django.http import JsonResponse
from django.shortcuts import get_object_or_404, redirect, render
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods

from .models import Category, Order, Product, UserProfile


def is_admin(user):
    """Check if user is admin/staff"""
    return user.is_authenticated and user.is_staff


def admin_login(request):
    """Admin login view"""
    if request.user.is_authenticated and request.user.is_staff:
        return redirect("admin_dashboard")

    if request.method == "POST":
        import json

        try:
            data = json.loads(request.body)
            username = data.get("username")
            password = data.get("password")

            # Try to authenticate by email first, then username
            user = None
            if "@" in username:
                try:
                    user_obj = User.objects.get(email=username)
                    user = authenticate(
                        request, username=user_obj.username, password=password
                    )
                except User.DoesNotExist:
                    pass
            else:
                user = authenticate(request, username=username, password=password)

            if user and user.is_staff:
                login(request, user)
                return JsonResponse({"success": True})
            else:
                return JsonResponse(
                    {"error": "Invalid credentials or insufficient permissions"},
                    status=401,
                )
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)

    return render(request, "admin/login.html")


@login_required
@user_passes_test(is_admin)
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


@login_required
@user_passes_test(is_admin)
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


@login_required
@user_passes_test(is_admin)
@require_http_methods(["POST"])
def admin_product_create(request):
    """Create new product"""
    try:
        category = get_object_or_404(Category, id=request.POST.get("category_id"))

        product = Product.objects.create(
            name=request.POST.get("name"),
            description=request.POST.get("description"),
            price=request.POST.get("price"),
            sale_price=request.POST.get("sale_price") or None,
            currency=request.POST.get("currency", "USD"),
            category=category,
            in_stock=request.POST.get("in_stock") == "on",
            is_new=request.POST.get("is_new") == "on",
            on_sale=request.POST.get("on_sale") == "on",
        )
        messages.success(request, f'Product "{product.name}" created successfully.')
        return redirect("admin_products")
    except Exception as e:
        messages.error(request, f"Error creating product: {str(e)}")
        return redirect("admin_products")


@login_required
@user_passes_test(is_admin)
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


@login_required
@user_passes_test(is_admin)
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


@login_required
@user_passes_test(is_admin)
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


@login_required
@user_passes_test(is_admin)
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


@login_required
@user_passes_test(is_admin)
def admin_analytics(request):
    """Admin analytics page"""
    # Sales trends (last 6 months)
    import random
    from datetime import datetime, timedelta

    sales_trends = []
    for i in range(6):
        date = datetime.now() - timedelta(days=30 * i)
        sales_trends.append(
            {
                "month": date.strftime("%b"),
                "sales": random.randint(15000, 35000),
                "orders": random.randint(100, 300),
            }
        )

    # Category stats
    category_stats = []
    for category in Category.objects.all():
        saved_count = category.product_set.count()
        order_count = sum(p.orderitem_set.count() for p in category.product_set.all())
        category_stats.append(
            {
                "name": category.name,
                "saved_items": saved_count,
                "orders": order_count,
                "popularity_score": saved_count + (order_count * 2),
            }
        )

    context = {
        "sales_trends": sales_trends,
        "category_stats": category_stats,
    }
    return render(request, "admin/analytics.html", context)


@login_required
@user_passes_test(is_admin)
def admin_order_detail(request, order_id):
    """Admin order detail view"""
    order = get_object_or_404(Order, id=order_id)
    context = {
        "order": order,
    }
    return render(request, "admin/order_detail.html", context)


@login_required
@user_passes_test(is_admin)
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


@login_required
@user_passes_test(is_admin)
def admin_user_detail(request, user_id):
    """Admin user detail view"""
    user = get_object_or_404(User, id=user_id)
    profile, _ = UserProfile.objects.get_or_create(user=user)
    context = {
        "user": user,
        "profile": profile,
    }
    return render(request, "admin/user_detail.html", context)


@login_required
@user_passes_test(is_admin)
def admin_settings(request):
    """Admin settings page"""
    if request.method == "POST":
        # Handle settings update
        pass

    context = {
        "site_name": "Arnova",
        "site_description": "Premium Fashion E-commerce",
        "contact_email": "admin@arnova.com",
        "default_currency": "USD",
    }
    return render(request, "admin/settings.html", context)
