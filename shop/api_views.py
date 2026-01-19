from django.contrib.admin.views.decorators import staff_member_required
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
from django.db import transaction
from django.http import JsonResponse
from django.middleware.csrf import get_token
from django.views.decorators.csrf import ensure_csrf_cookie
from django.views.decorators.http import require_http_methods
from django_ratelimit.decorators import ratelimit

from .forms import ProfileForm, RegistrationForm
from .models import (
    Cart,
    CartItem,
    Category,
    Order,
    OrderItem,
    Product,
    SavedItem,
    UserProfile,
)
from .utils import safe_json_response, serialize_queryset


@require_http_methods(["GET"])
def api_health_check(request):
    """Health check endpoint with CSRF token validation"""
    from django.utils import timezone

    csrf_token = get_token(request)
    return JsonResponse(
        {
            "status": "healthy",
            "csrf_token": csrf_token,
            "authenticated": request.user.is_authenticated,
            "timestamp": timezone.now().isoformat(),
        }
    )


@require_http_methods(["GET"])
def api_auth_status(request):
    """Check authentication status and user info"""
    if request.user.is_authenticated:
        return JsonResponse(
            {
                "authenticated": True,
                "user": {
                    "id": request.user.id,
                    "username": request.user.username,
                    "email": request.user.email,
                    "is_staff": request.user.is_staff,
                    "role": "admin" if request.user.is_staff else "buyer",
                },
            }
        )
    return JsonResponse({"authenticated": False})


@ensure_csrf_cookie
@require_http_methods(["GET"])
def api_csrf_token(request):
    """Get CSRF token for frontend requests"""
    return JsonResponse({"csrfToken": get_token(request), "success": True})


@ratelimit(key="ip", rate="5/m", method="POST")
@require_http_methods(["POST"])
def api_login(request):
    import json
    import logging

    logger = logging.getLogger("shop")

    # Check if rate limited
    if getattr(request, "limited", False):
        logger.warning(f"Rate limit exceeded for IP: {request.META.get('REMOTE_ADDR')}")
        return JsonResponse(
            {"error": "Too many login attempts. Please try again later."},
            status=429,
        )

    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        logger.warning("Login attempt with invalid JSON")
        return JsonResponse({"error": "Invalid JSON"}, status=400)

    username = data.get("username") or data.get("email")
    password = data.get("password")

    # Try to authenticate by email first, then username
    user = None
    if "@" in username:
        try:
            user_obj = User.objects.get(email=username)
            user = authenticate(request, username=user_obj.username, password=password)
        except User.DoesNotExist:
            pass
    else:
        user = authenticate(request, username=username, password=password)

    if user:
        login(request, user)
        logger.info(f"User {user.username} logged in successfully")

        # Determine redirect URL based on user role
        redirect_url = "/admin/" if user.is_staff else "/"

        return JsonResponse(
            {
                "success": True,
                "redirect": redirect_url,
                "user": {
                    "id": user.id,
                    "username": user.username,
                    "email": user.email,
                    "is_staff": user.is_staff,
                    "role": "admin" if user.is_staff else "buyer",
                },
            }
        )
    logger.warning(f"Failed login attempt for username: {username}")
    return JsonResponse({"error": "Invalid credentials"}, status=401)


@ratelimit(key="ip", rate="3/m", method="POST")
@require_http_methods(["POST"])
def api_register(request):
    import json

    from django.contrib.auth.password_validation import validate_password
    from django.core.exceptions import ValidationError

    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON"}, status=400)

    # Validate password strength
    password = data.get("password", "")
    try:
        validate_password(password)
    except ValidationError as e:
        return JsonResponse({"errors": {"password": list(e.messages)}}, status=400)

    form = RegistrationForm(data)

    if form.is_valid():
        cleaned_data = form.cleaned_data
        try:
            with transaction.atomic():
                user = User.objects.create_user(
                    username=cleaned_data["username"],
                    email=cleaned_data["email"],
                    password=cleaned_data["password"],
                )
                UserProfile.objects.create(user=user)
                Cart.objects.create(user=user)
            return JsonResponse(
                {"success": True, "message": "User created successfully"}
            )
        except Exception as e:
            return JsonResponse(
                {"error": f"Failed to create user: {str(e)}"}, status=500
            )
    else:
        # The form.errors dictionary contains validation errors.
        # .as_json() provides a serializable format.
        return JsonResponse({"errors": json.loads(form.errors.as_json())}, status=400)


@login_required
@require_http_methods(["POST"])
def api_logout(request):
    logout(request)
    return JsonResponse({"success": True})


@ratelimit(key="user_or_ip", rate="100/h", method="GET")
@require_http_methods(["GET"])
def api_products(request):
    if getattr(request, "limited", False):
        return JsonResponse({"error": "Rate limit exceeded"}, status=429)

    target_currency = request.GET.get("currency", "USD")
    products = (
        Product.objects.select_related("category")
        .prefetch_related("product_reviews")
        .order_by("-created_at")
    )
    data = []

    for p in products:
        try:
            price = float(p.price)
            sale_price = float(p.sale_price) if p.sale_price else None

            if target_currency != p.currency:
                rate = get_exchange_rate(p.currency, target_currency)
                price = price * rate
                if sale_price:
                    sale_price = sale_price * rate

            images = p.images if p.images is not None else []
            if not images:
                images = ["/placeholder.svg"]

            data.append(
                {
                    "id": p.id,
                    "name": p.name,
                    "description": p.description,
                    "price": round(price, 2),
                    "sale_price": round(sale_price, 2) if sale_price else None,
                    "currency": target_currency,
                    "base_currency": p.currency,
                    "category": p.category.name if p.category else None,
                    "sizes": p.sizes if p.sizes is not None else [],
                    "colors": p.colors if p.colors is not None else [],
                    "images": images,
                    "in_stock": p.in_stock,
                    "is_new": p.is_new,
                    "on_sale": p.on_sale,
                    "rating": p.average_rating,
                    "reviews": p.review_count,
                }
            )
        except Exception as e:
            import logging

            logger = logging.getLogger("shop")
            logger.error(f"Error processing product {p.id}: {e}")
            continue
    return JsonResponse({"products": data})


@require_http_methods(["GET"])
def api_cart(request):
    """Get user's cart items"""
    if not request.user.is_authenticated:
        return JsonResponse({"items": [], "authenticated": False})

    cart, _ = Cart.objects.get_or_create(user=request.user)
    items = cart.items.all().select_related("product")
    data = [
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
        for item in items
    ]
    return JsonResponse({"items": data, "authenticated": True})


@login_required
@require_http_methods(["POST"])
def api_cart_add(request):
    """Add item to cart"""
    import json
    import logging

    logger = logging.getLogger("shop")

    try:
        data = json.loads(request.body)
        product = Product.objects.get(id=data["product_id"])
        quantity = int(data.get("quantity", 1))
        selected_size = data.get("selected_size", "")
        selected_color = data.get("selected_color", "")

        if quantity < 1:
            return JsonResponse({"error": "Quantity must be at least 1"}, status=400)

        # Validate size and color if provided
        if selected_size and selected_size not in product.sizes:
            return JsonResponse({"error": f"Invalid size: {selected_size}"}, status=400)
        if selected_color and selected_color not in product.colors:
            return JsonResponse(
                {"error": f"Invalid color: {selected_color}"}, status=400
            )

    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON"}, status=400)
    except Product.DoesNotExist:
        return JsonResponse({"error": "Product not found"}, status=404)
    except (KeyError, ValueError) as e:
        return JsonResponse({"error": f"Invalid request: {str(e)}"}, status=400)

    cart, _ = Cart.objects.get_or_create(user=request.user)

    item, created = CartItem.objects.get_or_create(
        cart=cart,
        product=product,
        selected_size=selected_size,
        selected_color=selected_color,
        defaults={"quantity": quantity},
    )

    if not created:
        item.quantity = quantity
        item.save()

    logger.info(f"User {request.user.username} added product {product.id} to cart")
    return JsonResponse({"success": True, "item_id": item.id})


@login_required
@require_http_methods(["PUT", "DELETE"])
def api_cart_item(request, item_id):
    """
    Update or delete a specific item in the user's cart.
    """
    try:
        # Security check: ensure the item belongs to the current user's cart.
        item = CartItem.objects.get(id=item_id, cart__user=request.user)
    except CartItem.DoesNotExist:
        return JsonResponse({"error": "Cart item not found"}, status=404)

    if request.method == "PUT":
        import json

        try:
            data = json.loads(request.body)
            quantity = int(data.get("quantity"))
            if quantity > 0:
                item.quantity = quantity
                item.save()
                return JsonResponse({"success": True})
            else:
                # If quantity is 0 or less, treat it as a deletion
                item.delete()
                return JsonResponse({"success": True, "deleted": True})
        except (json.JSONDecodeError, ValueError, KeyError):
            return JsonResponse({"error": "Invalid request"}, status=400)

    elif request.method == "DELETE":
        item.delete()
        return JsonResponse({"success": True})


@require_http_methods(["GET"])
def api_saved(request):
    """Get user's saved items"""
    if not request.user.is_authenticated:
        return JsonResponse({"items": [], "authenticated": False})

    items = SavedItem.objects.filter(user=request.user).select_related("product")
    data = [
        {
            "id": item.id,
            "product": {
                "id": item.product.id,
                "name": item.product.name,
                "price": float(item.product.price),
                "sale_price": (
                    float(item.product.sale_price) if item.product.sale_price else None
                ),
                "images": item.product.images,
                "on_sale": item.product.on_sale,
            },
        }
        for item in items
    ]
    return JsonResponse({"items": data, "authenticated": True})


@login_required
@require_http_methods(["POST"])
def api_saved_add(request):
    """Add item to saved items"""
    import json
    import logging

    logger = logging.getLogger("shop")

    try:
        data = json.loads(request.body)
        product = Product.objects.get(id=data["product_id"])
    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON"}, status=400)
    except Product.DoesNotExist:
        return JsonResponse({"error": "Product not found"}, status=404)
    except KeyError:
        return JsonResponse({"error": "Missing product_id"}, status=400)

    item, created = SavedItem.objects.get_or_create(user=request.user, product=product)

    if created:
        logger.info(f"User {request.user.username} saved product {product.id}")

    return JsonResponse({"success": True, "item_id": item.id, "created": created})


@login_required
@require_http_methods(["DELETE"])
def api_saved_item(request, item_id):
    """
    Delete a specific item from the user's saved items.
    """
    try:
        # Security check: ensure the item belongs to the current user.
        item = SavedItem.objects.get(id=item_id, user=request.user)
    except SavedItem.DoesNotExist:
        return JsonResponse({"error": "Saved item not found"}, status=404)

    item.delete()
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
            "salePrice": (float(product.sale_price) if product.sale_price else None),
            "category": product.category.name,
            "sizes": product.sizes,
            "colors": product.colors,
            "images": product.images,
            "inStock": product.in_stock,
            "isNew": product.is_new,
            "onSale": product.on_sale,
            "rating": product.average_rating,
            "reviews": product.review_count,
        }
        return JsonResponse(data)
    except Product.DoesNotExist:
        return JsonResponse({"error": "Product not found"}, status=404)


@require_http_methods(["GET"])
def api_categories(request):
    categories = Category.objects.all()
    data = [{"id": cat.id, "name": cat.name, "slug": cat.slug} for cat in categories]
    return JsonResponse({"categories": data})


@login_required
def api_profile(request):
    profile, _ = UserProfile.objects.get_or_create(user=request.user)

    if request.method == "GET":
        data = {
            "user": {
                "id": request.user.id,
                "username": request.user.username,
                "email": request.user.email,
                "first_name": request.user.first_name,
                "last_name": request.user.last_name,
            },
            "profile": {
                "avatar": str(profile.avatar) if profile.avatar else "",
                "phone": profile.phone,
                "address": profile.address,
                "city": profile.city,
                "country": profile.country,
                "postal_code": profile.postal_code,
            },
        }
        return JsonResponse(data)

    elif request.method == "PUT":
        import json

        import bleach
        from django.utils.html import escape

        try:
            data = json.loads(request.body)
        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON"}, status=400)

        form = ProfileForm(data, user=request.user)

        if form.is_valid():
            cleaned_data = form.cleaned_data
            user = request.user

            # Update user fields with sanitization
            user.first_name = escape(cleaned_data.get("first_name", user.first_name))
            user.last_name = escape(cleaned_data.get("last_name", user.last_name))
            user.email = cleaned_data.get("email", user.email)
            user.save()

            # Update profile fields with sanitization
            if "avatar" in cleaned_data:
                profile.avatar = cleaned_data.get("avatar")
            profile.phone = escape(cleaned_data.get("phone", profile.phone))
            profile.address = bleach.clean(
                cleaned_data.get("address", profile.address), tags=[], strip=True
            )
            profile.city = escape(cleaned_data.get("city", profile.city))
            profile.country = escape(cleaned_data.get("country", profile.country))
            profile.postal_code = escape(
                cleaned_data.get("postal_code", profile.postal_code)
            )
            profile.save()

            return JsonResponse({"success": True})
        else:
            return JsonResponse(
                {"errors": json.loads(form.errors.as_json())}, status=400
            )


@login_required
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


@staff_member_required
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


@staff_member_required
def api_admin_products(request):
    if request.method == "GET":
        products = Product.objects.all()
        data = [
            {
                "id": p.id,
                "name": p.name,
                "description": p.description,
                "price": float(p.price),
                "sale_price": float(p.sale_price) if p.sale_price else None,
                "currency": p.currency,
                "category": p.category.name,
                "category_id": p.category.id,
                "in_stock": p.in_stock,
                "is_new": p.is_new,
                "on_sale": p.on_sale,
                "rating": float(p.rating),
                "reviews": p.reviews,
                "sizes": p.sizes,
                "colors": p.colors,
                "images": p.images,
                "created_at": p.created_at.isoformat(),
            }
            for p in products
        ]
        return JsonResponse({"products": data})

    elif request.method == "POST":
        import json

        try:
            data = json.loads(request.body)
        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON"}, status=400)

        try:
            with transaction.atomic():
                category = Category.objects.get(id=data["category_id"])
                product = Product.objects.create(
                    id=data["id"],
                    name=data["name"],
                    description=data["description"],
                    price=data["price"],
                    sale_price=data.get("sale_price"),
                    currency=data.get("currency", "KES"),
                    category=category,
                    sizes=data.get("sizes", []),
                    colors=data.get("colors", []),
                    images=data.get("images", []),
                    in_stock=data.get("in_stock", True),
                    is_new=data.get("is_new", False),
                    on_sale=data.get("on_sale", False),
                )
            return JsonResponse({"success": True, "product_id": product.id})
        except Category.DoesNotExist:
            return JsonResponse({"error": "Category not found"}, status=404)
        except KeyError as e:
            return JsonResponse(
                {"error": f"Missing required field: {str(e)}"}, status=400
            )
        except Exception as e:
            return JsonResponse(
                {"error": f"Failed to create product: {str(e)}"}, status=500
            )


@staff_member_required
def api_admin_product_detail(request, product_id):
    try:
        product = Product.objects.get(id=product_id)

        if request.method == "GET":
            data = {
                "id": product.id,
                "name": product.name,
                "description": product.description,
                "price": float(product.price),
                "sale_price": (
                    float(product.sale_price) if product.sale_price else None
                ),
                "currency": product.currency,
                "category_id": product.category.id,
                "in_stock": product.in_stock,
                "is_new": product.is_new,
                "on_sale": product.on_sale,
                "rating": product.average_rating,
                "reviews": product.review_count,
                "sizes": product.sizes,
                "colors": product.colors,
                "images": product.images,
            }
            return JsonResponse({"product": data})

        elif request.method == "PUT":
            import json

            try:
                data = json.loads(request.body)
            except json.JSONDecodeError:
                return JsonResponse({"error": "Invalid JSON"}, status=400)

            try:
                product.name = data.get("name", product.name)
                product.description = data.get("description", product.description)
                product.price = data.get("price", product.price)
                product.sale_price = data.get("sale_price", product.sale_price)
                product.currency = data.get("currency", product.currency)
                product.in_stock = data.get("in_stock", product.in_stock)
                product.is_new = data.get("is_new", product.is_new)
                product.on_sale = data.get("on_sale", product.on_sale)
                if "category_id" in data:
                    product.category = Category.objects.get(id=data["category_id"])
                product.save()
                return JsonResponse({"success": True})
            except Category.DoesNotExist:
                return JsonResponse({"error": "Category not found"}, status=404)
            except Exception as e:
                return JsonResponse(
                    {"error": f"Failed to update product: {str(e)}"}, status=500
                )

        elif request.method == "DELETE":
            product.delete()
            return JsonResponse({"success": True})

    except Product.DoesNotExist:
        return JsonResponse({"error": "Product not found"}, status=404)


@staff_member_required
def api_admin_users(request):
    from django.contrib.auth.models import User

    if request.method == "GET":
        users = User.objects.all().order_by("-date_joined")
        data = []
        for user in users:
            profile, _ = UserProfile.objects.get_or_create(user=user)
            data.append(
                {
                    "id": user.id,
                    "username": user.username,
                    "email": user.email,
                    "first_name": user.first_name,
                    "last_name": user.last_name,
                    "is_staff": user.is_staff,
                    "is_active": user.is_active,
                    "date_joined": user.date_joined.isoformat(),
                    "profile": {
                        "avatar": profile.avatar,
                        "phone": profile.phone,
                        "address": profile.address,
                        "city": profile.city,
                        "country": profile.country,
                        "postal_code": profile.postal_code,
                    },
                }
            )
        return JsonResponse({"users": data})

    elif request.method == "POST":
        import json

        try:
            data = json.loads(request.body)
        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON"}, status=400)

        try:
            with transaction.atomic():
                user = User.objects.create_user(
                    username=data["username"],
                    email=data["email"],
                    password=data["password"],
                    first_name=data.get("first_name", ""),
                    last_name=data.get("last_name", ""),
                    is_staff=data.get("is_staff", False),
                )
                UserProfile.objects.create(
                    user=user,
                    avatar=data.get("avatar", ""),
                    phone=data.get("phone", ""),
                    address=data.get("address", ""),
                    city=data.get("city", ""),
                    country=data.get("country", ""),
                    postal_code=data.get("postal_code", ""),
                )
                Cart.objects.create(user=user)
            return JsonResponse({"success": True, "user_id": user.id})
        except KeyError as e:
            return JsonResponse(
                {"error": f"Missing required field: {str(e)}"}, status=400
            )
        except Exception as e:
            return JsonResponse(
                {"error": f"Failed to create user: {str(e)}"}, status=500
            )


@staff_member_required
def api_admin_user_detail(request, user_id):
    try:
        user = User.objects.get(id=user_id)
        profile, _ = UserProfile.objects.get_or_create(user=user)

        if request.method == "GET":
            data = {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "is_staff": user.is_staff,
                "is_active": user.is_active,
                "profile": {
                    "avatar": str(profile.avatar) if profile.avatar else "",
                    "phone": profile.phone,
                    "address": profile.address,
                    "city": profile.city,
                    "country": profile.country,
                    "postal_code": profile.postal_code,
                },
            }
            return JsonResponse({"user": data})

        elif request.method == "PUT":
            import json

            try:
                data = json.loads(request.body)
            except json.JSONDecodeError:
                return JsonResponse({"error": "Invalid JSON"}, status=400)

            try:
                user.username = data.get("username", user.username)
                user.email = data.get("email", user.email)
                user.first_name = data.get("first_name", user.first_name)
                user.last_name = data.get("last_name", user.last_name)
                user.is_staff = data.get("is_staff", user.is_staff)
                user.is_active = data.get("is_active", user.is_active)
                user.save()

                if "avatar" in data:
                    profile.avatar = data.get("avatar")
                profile.phone = data.get("phone", profile.phone)
                profile.address = data.get("address", profile.address)
                profile.city = data.get("city", profile.city)
                profile.country = data.get("country", profile.country)
                profile.postal_code = data.get("postal_code", profile.postal_code)
                profile.save()

                return JsonResponse({"success": True})
            except Exception as e:
                return JsonResponse(
                    {"error": f"Failed to update user: {str(e)}"}, status=500
                )

        elif request.method == "DELETE":
            user.delete()
            return JsonResponse({"success": True})

    except User.DoesNotExist:
        return JsonResponse({"error": "User not found"}, status=404)


@staff_member_required
@require_http_methods(["GET"])
def api_admin_analytics(request):
    import random

    from django.contrib.auth.models import User
    from django.db.models import Count, Sum

    total_orders = Order.objects.count()
    total_revenue = (
        Order.objects.aggregate(Sum("total_amount"))["total_amount__sum"] or 0
    )
    total_users = User.objects.count()
    total_products = Product.objects.count()

    # User location analytics with real geocoding
    user_locations = []
    profiles = UserProfile.objects.select_related("user").all()
    for profile in profiles:
        if profile.city and profile.country:
            lat, lng = get_coordinates(profile.city, profile.country)
            user_locations.append(
                {
                    "user": profile.user.username,
                    "city": profile.city,
                    "country": profile.country,
                    "lat": lat,
                    "lng": lng,
                    "orders": Order.objects.filter(user=profile.user).count(),
                    "last_login": (
                        profile.user.last_login.isoformat()
                        if profile.user.last_login
                        else None
                    ),
                }
            )

    # Category preferences analytics
    category_stats = []
    categories = Category.objects.all()
    for category in categories:
        saved_count = SavedItem.objects.filter(product__category=category).count()
        order_count = OrderItem.objects.filter(product__category=category).count()
        category_stats.append(
            {
                "name": category.name,
                "saved_items": saved_count,
                "orders": order_count,
                "popularity_score": saved_count + (order_count * 2),
            }
        )

    # Sales trends (mock data for demo)
    sales_trends = [
        {
            "month": "Jan",
            "sales": random.randint(15000, 25000),
            "orders": random.randint(100, 200),
        },
        {
            "month": "Feb",
            "sales": random.randint(18000, 28000),
            "orders": random.randint(120, 220),
        },
        {
            "month": "Mar",
            "sales": random.randint(20000, 30000),
            "orders": random.randint(140, 240),
        },
        {
            "month": "Apr",
            "sales": random.randint(22000, 32000),
            "orders": random.randint(160, 260),
        },
        {
            "month": "May",
            "sales": random.randint(25000, 35000),
            "orders": random.randint(180, 280),
        },
        {
            "month": "Jun",
            "sales": random.randint(28000, 38000),
            "orders": random.randint(200, 300),
        },
    ]

    # Login activity analytics
    login_activity = []
    for i in range(7):  # Last 7 days
        from datetime import datetime, timedelta

        date = datetime.now() - timedelta(days=i)
        # Mock login data (in production, track actual login times)
        login_activity.append(
            {
                "date": date.strftime("%Y-%m-%d"),
                "logins": random.randint(20, 100),
                "unique_users": random.randint(15, 80),
            }
        )

    data = {
        "total_orders": total_orders,
        "total_revenue": float(total_revenue),
        "total_users": total_users,
        "total_products": total_products,
        "recent_orders": Order.objects.count(),
        "popular_products": serialize_queryset(
            Product.objects.annotate(order_count=Count("orderitem")).order_by(
                "-order_count"
            )[:5],
            ["name", "order_count"],
        ),
        "user_locations": user_locations,
        "category_preferences": category_stats,
        "sales_trends": sales_trends,
        "login_activity": login_activity,
    }
    return safe_json_response(data)


def get_mock_coordinates(city, country):
    """Generate mock coordinates for demo purposes"""
    # Mock coordinates for common cities
    coordinates = {
        ("Nairobi", "Kenya"): (-1.2921, 36.8219),
        ("Lagos", "Nigeria"): (6.5244, 3.3792),
        ("Cairo", "Egypt"): (30.0444, 31.2357),
        ("New York", "USA"): (40.7128, -74.0060),
        ("London", "UK"): (51.5074, -0.1278),
        ("Paris", "France"): (48.8566, 2.3522),
        ("Tokyo", "Japan"): (35.6762, 139.6503),
        ("Sydney", "Australia"): (-33.8688, 151.2093),
    }

    key = (city, country)
    if key in coordinates:
        return coordinates[key]

    # Generate random coordinates if city not found
    import random

    lat = random.uniform(-60, 60)
    lng = random.uniform(-180, 180)
    return (lat, lng)


def get_coordinates(city, country):
    """Get real coordinates using geocoding API"""
    import requests

    try:
        # Use OpenStreetMap Nominatim API (free)
        import urllib.parse

        query = urllib.parse.quote(f"{city}, {country}")
        url = (
            f"https://nominatim.openstreetmap.org/search?"
            f"q={query}&format=json&limit=1"
        )

        response = requests.get(
            url, timeout=5, headers={"User-Agent": "Arnova-App/1.0"}
        )
        if response.status_code == 200:
            data = response.json()
            if data:
                return (float(data[0]["lat"]), float(data[0]["lon"]))
    except Exception:
        pass

    # Fallback to mock coordinates if API fails
    return get_mock_coordinates(city, country)


def get_exchange_rate(from_currency, to_currency):
    """Get exchange rate from free API"""
    import requests

    if from_currency == to_currency:
        return 1.0

    try:
        # Using exchangerate-api.com free tier
        url = f"https://api.exchangerate-api.com/v4/latest/{from_currency}"
        response = requests.get(url, timeout=5)
        if response.status_code == 200:
            data = response.json()
            return data["rates"].get(to_currency, 1.0)
    except Exception:
        pass

    # Fallback rates if API fails
    rates = {
        ("USD", "KES"): 150.0,
        ("KES", "USD"): 0.0067,
        ("USD", "EUR"): 0.85,
        ("EUR", "USD"): 1.18,
    }
    return rates.get((from_currency, to_currency), 1.0)


@require_http_methods(["GET"])
def api_exchange_rates(request):
    """Get current exchange rates"""
    import requests

    base_currency = request.GET.get("base", "USD")
    try:
        url = f"https://api.exchangerate-api.com/v4/latest/{base_currency}"
        response = requests.get(url, timeout=5)
        if response.status_code == 200:
            return JsonResponse(response.json())
    except Exception:
        pass

    # Fallback rates
    fallback_data = {
        "base": base_currency,
        "rates": {
            "USD": 1.0 if base_currency == "USD" else 0.0067,
            "KES": 150.0 if base_currency == "USD" else 1.0,
            "EUR": 0.85 if base_currency == "USD" else 0.0057,
        },
    }
    return JsonResponse(fallback_data)


@staff_member_required
@require_http_methods(["GET"])
def api_admin_settings(request):
    """Get admin settings"""
    settings_data = {
        "site_name": "Arnova",
        "site_description": "Premium Fashion E-commerce",
        "contact_email": "admin@arnova.com",
        "default_currency": "USD",
        "supported_languages": ["en", "sw"],
        "timezone": "UTC",
        "session_timeout": 2592000,  # 30 days
    }
    return JsonResponse(settings_data)


def api_placeholder_image(request, width, height):
    """Generate placeholder image"""
    from django.http import HttpResponse

    try:
        import io

        from PIL import Image, ImageDraw

        # Create a simple placeholder image
        img = Image.new("RGB", (width, height), color="#f0f0f0")
        draw = ImageDraw.Draw(img)

        # Add text
        text = f"{width}x{height}"
        try:
            bbox = draw.textbbox((0, 0), text)
            text_width = bbox[2] - bbox[0]
            text_height = bbox[3] - bbox[1]
        except Exception:
            # Fallback for older PIL versions
            text_width, text_height = draw.textsize(text)

        x = (width - text_width) // 2
        y = (height - text_height) // 2
        draw.text((x, y), text, fill="#999999")

        # Save to bytes
        img_io = io.BytesIO()
        img.save(img_io, "PNG")
        img_io.seek(0)

        return HttpResponse(img_io.getvalue(), content_type="image/png")
    except ImportError:
        # Fallback if PIL is not available
        return HttpResponse(b"", content_type="image/png", status=404)


@login_required
@require_http_methods(["POST"])
@ensure_csrf_cookie
def api_product_review(request, product_id):
    """Submit a product review"""
    import json

    from .models import Review

    try:
        data = json.loads(request.body)
        product = Product.objects.get(id=product_id)
        rating = int(data.get("rating"))
        comment = data.get("comment", "").strip()

        if not 1 <= rating <= 5:
            return JsonResponse({"error": "Rating must be between 1 and 5"}, status=400)

        review, created = Review.objects.update_or_create(
            product=product,
            user=request.user,
            defaults={"rating": rating, "comment": comment},
        )

        return JsonResponse(
            {
                "success": True,
                "review": {
                    "id": review.id,
                    "rating": review.rating,
                    "comment": review.comment,
                    "user": request.user.username,
                    "created_at": review.created_at.isoformat(),
                },
            }
        )
    except Product.DoesNotExist:
        return JsonResponse({"error": "Product not found"}, status=404)
    except (json.JSONDecodeError, ValueError, KeyError) as e:
        return JsonResponse({"error": f"Invalid request: {str(e)}"}, status=400)


@require_http_methods(["GET"])
def api_product_reviews(request, product_id):
    """Get all reviews for a product"""
    from .models import Review

    try:
        product = Product.objects.get(id=product_id)
        reviews = (
            Review.objects.filter(product=product)
            .select_related("user")
            .order_by("-created_at")
        )

        data = [
            {
                "id": review.id,
                "user": review.user.username,
                "rating": review.rating,
                "comment": review.comment,
                "created_at": review.created_at.isoformat(),
            }
            for review in reviews
        ]

        return JsonResponse(
            {
                "reviews": data,
                "average_rating": product.average_rating,
                "review_count": product.review_count,
            }
        )
    except Product.DoesNotExist:
        return JsonResponse({"error": "Product not found"}, status=404)
