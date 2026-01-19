from django.contrib.auth.models import User
from django.http import JsonResponse
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Category, Order, Product, UserProfile


class AdminProductsView(APIView):
    permission_classes = [IsAdminUser]

    def handle_exception(self, exc):
        if hasattr(exc, "status_code") and exc.status_code == 403:
            return JsonResponse({"error": "Admin access required"}, status=403)
        elif hasattr(exc, "status_code") and exc.status_code == 401:
            return JsonResponse({"error": "Authentication required"}, status=401)
        return super().handle_exception(exc)

    def get(self, request):
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
                "rating": p.average_rating,
                "reviews": p.review_count,
                "sizes": p.sizes,
                "colors": p.colors,
                "images": p.images,
                "created_at": p.created_at.isoformat(),
            }
            for p in products
        ]
        return Response({"products": data})

    def post(self, request):
        data = request.data
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
        return Response({"success": True, "product_id": product.id})


class AdminOrdersView(APIView):
    permission_classes = [IsAdminUser]

    def handle_exception(self, exc):
        if hasattr(exc, "status_code") and exc.status_code == 403:
            return JsonResponse({"error": "Admin access required"}, status=403)
        elif hasattr(exc, "status_code") and exc.status_code == 401:
            return JsonResponse({"error": "Authentication required"}, status=401)
        return super().handle_exception(exc)

    def get(self, request):
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
        return Response({"orders": data})


class AdminUsersView(APIView):
    permission_classes = [IsAdminUser]

    def handle_exception(self, exc):
        if hasattr(exc, "status_code") and exc.status_code == 403:
            return JsonResponse({"error": "Admin access required"}, status=403)
        elif hasattr(exc, "status_code") and exc.status_code == 401:
            return JsonResponse({"error": "Authentication required"}, status=401)
        return super().handle_exception(exc)

    def get(self, request):
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
        return Response({"users": data})
