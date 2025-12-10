import json

from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods

from .middleware import admin_required, api_login_required
from .models import (
    Cart,
    CartItem,
    Category,
    Order,
    Product,
    SavedItem,
    UserProfile,
)


@csrf_exempt
@require_http_methods(["POST"])
def api_login(request):
    data = json.loads(request.body)
    username = data.get("username")
    password = data.get("password")

    user = authenticate(request, username=username, password=password)
    if user:
        login(request, user)
        return JsonResponse(
            {
                "success": True,
                "user": {
                    "id": user.id,
                    "username": user.username,
                    "email": user.email,
                    "is_staff": user.is_staff,
                },
            }
        )
    return JsonResponse({"error": "Invalid credentials"}, status=401)


@csrf_exempt
@require_http_methods(["POST"])
def api_register(request):
    data = json.loads(request.body)
    username = data.get("username")
    email = data.get("email")
    password = data.get("password")

    if User.objects.filter(username=username).exists():
        return JsonResponse({"error": "Username already exists"}, status=400)

    user = User.objects.create_user(
        username=username,
        email=email,
        password=password,
    )
    UserProfile.objects.create(user=user)
    Cart.objects.create(user=user)

    return JsonResponse({"success": True, "message": "User created successfully"})


@api_login_required
@require_http_methods(["POST"])
def api_logout(request):
    logout(request)
    return JsonResponse({"success": True})


@require_http_methods(["GET"])
def api_products(request):
    products = Product.objects.all()
    data = [
        {
            "id": p.id,
            "name": p.name,
            "description": p.description,
            "price": float(p.price),
            "sale_price": (
                float(p.sale_price) if p.sale_price else None
            ),
            "category": p.category.name,
            "sizes": p.sizes,
            "colors": p.colors,
            "images": p.images,
            "in_stock": p.in_stock,
            "is_new": p.is_new,
            "on_sale": p.on_sale,
            "rating": float(p.rating),
            "reviews": p.reviews,
        }
        for p in products
    ]
    return JsonResponse({"products": data})


@api_login_required
@csrf_exempt
def api_cart(request):
    cart, _ = Cart.objects.get_or_create(user=request.user)

    if request.method == "GET":
        items = [
            {
                "id": item.id,
                "product": {
                    "id": item.product.id,
                    "name": item.product.name,
                    "price": float(item.product.price),
                    "images": item.product.images,
                },
                "quantity": item.quantity,
                "selected_size": item.selected_size,
                "selected_color": item.selected_color,
            }
            for item in cart.items.all()
        ]
        return JsonResponse({"items": items})

    elif request.method == "POST":
        data = json.loads(request.body)
        product = Product.objects.get(id=data["product_id"])

        item, created = CartItem.objects.get_or_create(
            cart=cart,
            product=product,
            selected_size=data["selected_size"],
            selected_color=data["selected_color"],
            defaults={"quantity": data["quantity"]},
        )

        if not created:
            item.quantity += data["quantity"]
            item.save()

        return JsonResponse({"success": True})


@api_login_required
@csrf_exempt
def api_saved(request):
    if request.method == "GET":
        items = SavedItem.objects.filter(user=request.user)
        data = [
            {
                "id": item.id,
                "product": {
                    "id": item.product.id,
                    "name": item.product.name,
                    "price": float(item.product.price),
                    "images": item.product.images,
                },
            }
            for item in items
        ]
        return JsonResponse({"items": data})

    elif request.method == "POST":
        data = json.loads(request.body)
        product = Product.objects.get(id=data["product_id"])
        SavedItem.objects.get_or_create(user=request.user, product=product)
        return JsonResponse({"success": True})


@require_http_methods(["GET"])
def api_product_detail(request, product_id):
    try:
        product = Product.objects.get(id=product_id)
        data = {
            "id": product.id,
            "name": product.name,
            "description": product.description,
            "price": float(product.price),
            "sale_price": (
                float(product.sale_price) if product.sale_price else None
            ),
            "category": product.category.name,
            "sizes": product.sizes,
            "colors": product.colors,
            "images": product.images,
            "in_stock": product.in_stock,
            "is_new": product.is_new,
            "on_sale": product.on_sale,
            "rating": float(product.rating),
            "reviews": product.reviews,
        }
        return JsonResponse({"product": data})
    except Product.DoesNotExist:
        return JsonResponse({"error": "Product not found"}, status=404)


@require_http_methods(["GET"])
def api_categories(request):
    categories = Category.objects.all()
    data = [
        {"id": cat.id, "name": cat.name, "slug": cat.slug}
        for cat in categories
    ]
    return JsonResponse({"categories": data})


@api_login_required
@csrf_exempt
def api_profile(request):
    if request.method == "GET":
        profile, _ = UserProfile.objects.get_or_create(user=request.user)
        data = {
            "user": {
                "id": request.user.id,
                "username": request.user.username,
                "email": request.user.email,
                "first_name": request.user.first_name,
                "last_name": request.user.last_name,
            },
            "profile": {
                "phone": profile.phone,
                "address": profile.address,
                "city": profile.city,
                "country": profile.country,
                "postal_code": profile.postal_code,
            },
        }
        return JsonResponse(data)
    elif request.method == "PUT":
        data = json.loads(request.body)
        profile, _ = UserProfile.objects.get_or_create(user=request.user)

        # Update user fields
        if "first_name" in data:
            request.user.first_name = data["first_name"]
        if "last_name" in data:
            request.user.last_name = data["last_name"]
        request.user.save()

        # Update profile fields
        for field in ["phone", "address", "city", "country", "postal_code"]:
            if field in data:
                setattr(profile, field, data[field])
        profile.save()

        return JsonResponse({"success": True})


@api_login_required
@require_http_methods(["GET"])
def api_orders(request):
    orders = Order.objects.filter(user=request.user).order_by("-created_at")
    data = [
        {
            "id": order.id,
            "order_id": order.order_id,
            "total_amount": float(order.total_amount),
            "status": order.status,
            "created_at": order.created_at.isoformat(),
            "items": [
                {
                    "product_name": item.product.name,
                    "quantity": item.quantity,
                    "price": float(item.price),
                }
                for item in order.items.all()
            ],
        }
        for order in orders
    ]
    return JsonResponse({"orders": data})


@admin_required
@require_http_methods(["GET"])
def api_admin_orders(request):
    orders = Order.objects.all().order_by("-created_at")
    data = [
        {
            "id": order.id,
            "order_id": order.order_id,
            "user": order.user.username,
            "total_amount": float(order.total_amount),
            "status": order.status,
            "created_at": order.created_at.isoformat(),
        }
        for order in orders
    ]
    return JsonResponse({"orders": data})


@admin_required
@csrf_exempt
def api_admin_products(request):
    if request.method == "GET":
        products = Product.objects.all()
        data = [
            {
                "id": p.id,
                "name": p.name,
                "price": float(p.price),
                "category": p.category.name,
                "in_stock": p.in_stock,
                "created_at": p.created_at.isoformat(),
            }
            for p in products
        ]
        return JsonResponse({"products": data})

    elif request.method == "POST":
        data = json.loads(request.body)
        category = Category.objects.get(id=data["category_id"])
        product = Product.objects.create(
            id=data["id"],
            name=data["name"],
            description=data["description"],
            price=data["price"],
            category=category,
            sizes=data.get("sizes", []),
            colors=data.get("colors", []),
            images=data.get("images", []),
        )
        return JsonResponse({"success": True, "product_id": product.id})


@admin_required
@require_http_methods(["GET"])
def api_admin_users(request):
    from django.contrib.auth.models import User

    users = User.objects.all().order_by("-date_joined")
    data = [
        {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "is_staff": user.is_staff,
            "date_joined": user.date_joined.isoformat(),
        }
        for user in users
    ]
    return JsonResponse({"users": data})


@admin_required
@require_http_methods(["GET"])
def api_admin_analytics(request):
    from django.db.models import Count, Sum

    total_orders = Order.objects.count()
    total_revenue = (
        Order.objects.aggregate(Sum("total_amount"))["total_amount__sum"] or 0
    )
    total_users = User.objects.count()
    total_products = Product.objects.count()

    data = {
        "total_orders": total_orders,
        "total_revenue": float(total_revenue),
        "total_users": total_users,
        "total_products": total_products,
        "recent_orders": Order.objects.count(),
        "popular_products": (
            Product.objects.annotate(order_count=Count("orderitem"))
            .order_by("-order_count")[:5]
            .values("name", "order_count")
        ),
    }
    return JsonResponse(data)
