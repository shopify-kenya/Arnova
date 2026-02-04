from __future__ import annotations

import json
from typing import List, Optional

import strawberry
from django.conf import settings
from django.contrib.auth.models import User
from django.db import transaction
from strawberry.extensions import DisableIntrospection
from strawberry.schema.config import StrawberryConfig
from strawberry.types import Info

from shop import payment_views
from shop.api_views import get_coordinates, get_exchange_rate
from shop.forms import ProfileForm, RegistrationForm
from shop.models import (
    Cart,
    CartItem,
    Category,
    Notification,
    Order,
    OrderItem,
    Product,
    Review,
    SavedItem,
    UserProfile,
)

from .auth import (
    authenticate_credentials,
    create_access_token,
    create_refresh_token,
    decode_token,
)
from .security import rate_limit, require_auth, require_staff
from .types import (
    AdminAnalytics,
    AdminCreateProductPayload,
    AdminOrderType,
    AdminProductType,
    AdminUserType,
    AuthPayload,
    CardValidationResult,
    CartItemType,
    CartProductType,
    CategoryType,
    ExchangeRates,
    JSON,
    MpesaStatus,
    NotificationType,
    NotificationsPayload,
    OrderItemType,
    OrderType,
    PaymentResult,
    ProductType,
    ProfileType,
    ReviewType,
    ReviewsPayload,
    SavedAddPayload,
    SavedItemType,
    SimplePayload,
    UserProfileType,
    UserType,
)


@strawberry.input
class CartAddInput:
    productId: int
    quantity: int
    selectedSize: str
    selectedColor: str


@strawberry.input
class ProfileUpdateInput:
    firstName: Optional[str] = None
    lastName: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    country: Optional[str] = None
    postalCode: Optional[str] = None


@strawberry.input
class PaymentInput:
    paymentMethod: str
    amount: float
    phoneNumber: Optional[str] = None
    orderData: Optional[JSON] = None
    cardData: Optional["CardDataInput"] = None


@strawberry.input
class CardDataInput:
    cardNumber: str
    cardExpiry: str
    cardCvc: str
    cardName: str


@strawberry.input
class AdminCreateProductInput:
    name: str
    description: str
    price: float
    categoryId: int
    sizes: List[str]
    colors: List[str]
    images: List[str]
    inStock: bool = True
    currency: Optional[str] = "KES"


def _product_to_type(p: Product, target_currency: str = "USD") -> ProductType:
    price = float(p.price)
    sale_price = float(p.sale_price) if p.sale_price else None
    if target_currency != p.currency:
        rate = get_exchange_rate(p.currency, target_currency)
        price = price * rate
        if sale_price is not None:
            sale_price = sale_price * rate

    images = p.images if p.images is not None else []
    if not images:
        images = ["/placeholder.svg"]

    return ProductType(
        id=p.id,
        name=p.name,
        description=p.description,
        price=round(price, 2),
        salePrice=round(sale_price, 2) if sale_price else None,
        currency=target_currency,
        baseCurrency=p.currency,
        category=p.category.name if p.category else None,
        sizes=p.sizes or [],
        colors=p.colors or [],
        images=images,
        inStock=p.in_stock,
        isNew=p.is_new,
        onSale=p.on_sale,
        rating=p.average_rating,
        reviews=p.review_count,
    )


@strawberry.type
class CartPayload:
    items: List[CartItemType]


@strawberry.type
class SavedPayload:
    items: List[SavedItemType]


@strawberry.type
class Query:
    @strawberry.field
    def health(self) -> str:
        return "healthy"

    @strawberry.field
    def me(self, info: Info) -> Optional[UserType]:
        user = info.context.user
        if not user or not user.is_authenticated:
            return None
        return UserType(
            id=user.id,
            username=user.username,
            email=user.email,
            firstName=user.first_name or "",
            lastName=user.last_name or "",
            isStaff=user.is_staff,
            role="admin" if user.is_staff else "buyer",
        )

    @strawberry.field
    def products(self, info: Info, currency: str = "USD") -> List[ProductType]:
        products = (
            Product.objects.select_related("category")
            .prefetch_related("product_reviews")
            .order_by("-created_at")
        )
        return [_product_to_type(p, currency) for p in products]

    @strawberry.field
    def product(self, info: Info, id: int, currency: str = "USD") -> ProductType:
        product = Product.objects.get(id=id)
        return _product_to_type(product, currency)

    @strawberry.field
    def categories(self, info: Info) -> List[CategoryType]:
        return [CategoryType(id=c.id, name=c.name, slug=c.slug) for c in Category.objects.all()]

    @strawberry.field
    def product_reviews(self, info: Info, id: int) -> ReviewsPayload:
        product = Product.objects.get(id=id)
        reviews = (
            Review.objects.filter(product=product)
            .select_related("user")
            .order_by("-created_at")
        )
        review_types = [
            ReviewType(
                id=r.id,
                user=r.user.username,
                rating=r.rating,
                comment=r.comment,
                createdAt=r.created_at.isoformat(),
            )
            for r in reviews
        ]
        return ReviewsPayload(
            reviews=review_types,
            averageRating=product.average_rating,
            reviewCount=product.review_count,
        )

    @strawberry.field
    def cart(self, info: Info) -> CartPayload:
        require_auth(info.context.user)
        cart, _ = Cart.objects.get_or_create(user=info.context.user)
        items = cart.items.all().select_related("product")
        data = [
            CartItemType(
                id=item.id,
                product=CartProductType(
                    id=item.product.id,
                    name=item.product.name,
                    price=float(item.product.price),
                    images=item.product.images or [],
                ),
                quantity=item.quantity,
                selectedSize=item.selected_size,
                selectedColor=item.selected_color,
            )
            for item in items
        ]
        return CartPayload(items=data)

    @strawberry.field
    def saved(self, info: Info) -> SavedPayload:
        require_auth(info.context.user)
        items = SavedItem.objects.filter(user=info.context.user).select_related("product")
        data = [SavedItemType(id=item.id, product=_product_to_type(item.product)) for item in items]
        return SavedPayload(items=data)

    @strawberry.field
    def profile(self, info: Info) -> UserProfileType:
        require_auth(info.context.user)
        profile, _ = UserProfile.objects.get_or_create(user=info.context.user)
        return UserProfileType(
            user=UserType(
                id=info.context.user.id,
                username=info.context.user.username,
                email=info.context.user.email,
                firstName=info.context.user.first_name or "",
                lastName=info.context.user.last_name or "",
                isStaff=info.context.user.is_staff,
                role="admin" if info.context.user.is_staff else "buyer",
            ),
            profile=ProfileType(
                avatar=str(profile.avatar) if profile.avatar else "",
                phone=profile.phone or "",
                address=profile.address or "",
                city=profile.city or "",
                country=profile.country or "",
                postalCode=profile.postal_code or "",
            ),
        )

    @strawberry.field
    def orders(self, info: Info) -> List[OrderType]:
        require_auth(info.context.user)
        orders = Order.objects.filter(user=info.context.user).order_by("-created_at")
        data: List[OrderType] = []
        for order in orders:
            items = [
                OrderItemType(
                    productName=item.product.name if item.product else "Unknown",
                    quantity=item.quantity,
                    price=float(item.price),
                )
                for item in order.items.all()
            ]
            data.append(
                OrderType(
                    id=order.id,
                    orderId=order.order_id,
                    totalAmount=float(order.total_amount),
                    status=order.status,
                    createdAt=order.created_at.isoformat(),
                    items=items,
                )
            )
        return data

    @strawberry.field
    def notifications(self, info: Info) -> NotificationsPayload:
        require_auth(info.context.user)
        notes = Notification.objects.filter(user=info.context.user).order_by("-created_at")[:50]
        items = [
            NotificationType(
                id=n.id,
                title=n.title,
                message=n.message,
                type=n.notification_type,
                isRead=n.is_read,
                link=n.link,
                createdAt=n.created_at.isoformat(),
            )
            for n in notes
        ]
        unread_count = Notification.objects.filter(user=info.context.user, is_read=False).count()
        return NotificationsPayload(items=items, unreadCount=unread_count)

    @strawberry.field
    def exchange_rates(self, info: Info, base: str = "USD") -> ExchangeRates:
        import requests

        try:
            url = f"https://api.exchangerate-api.com/v4/latest/{base}"
            response = requests.get(url, timeout=5)
            if response.status_code == 200:
                data = response.json()
                return ExchangeRates(base=data.get("base", base), rates=data.get("rates", {}))
        except Exception:
            pass

        fallback_data = {
            "USD": 1.0 if base == "USD" else 0.0067,
            "KES": 150.0 if base == "USD" else 1.0,
            "EUR": 0.85 if base == "USD" else 0.0057,
        }
        return ExchangeRates(base=base, rates=fallback_data)

    @strawberry.field
    def admin_analytics(self, info: Info) -> AdminAnalytics:
        require_staff(info.context.user)
        from django.contrib.auth.models import User as DjangoUser
        from django.db.models import Count, Sum

        total_orders = Order.objects.count()
        total_revenue = (
            Order.objects.aggregate(Sum("total_amount"))["total_amount__sum"] or 0
        )
        total_users = DjangoUser.objects.count()
        total_products = Product.objects.count()

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

        popular_products = list(
            Product.objects.annotate(order_count=Count("orderitem"))
            .order_by("-order_count")[:5]
            .values("name", "order_count")
        )

        sales_trends = [
            {"month": "Jan", "sales": 15000, "orders": 100},
            {"month": "Feb", "sales": 18000, "orders": 120},
            {"month": "Mar", "sales": 20000, "orders": 140},
            {"month": "Apr", "sales": 22000, "orders": 160},
            {"month": "May", "sales": 25000, "orders": 180},
            {"month": "Jun", "sales": 28000, "orders": 200},
        ]

        login_activity = []
        from datetime import datetime, timedelta
        import random

        for i in range(7):
            date = datetime.now() - timedelta(days=i)
            login_activity.append(
                {
                    "date": date.strftime("%Y-%m-%d"),
                    "logins": random.randint(20, 100),
                    "unique_users": random.randint(15, 80),
                }
            )

        return AdminAnalytics(
            totalOrders=total_orders,
            totalRevenue=float(total_revenue),
            totalUsers=total_users,
            totalProducts=total_products,
            recentOrders=Order.objects.count(),
            popularProducts=popular_products,
            userLocations=user_locations,
            categoryPreferences=category_stats,
            salesTrends=sales_trends,
            loginActivity=login_activity,
        )

    @strawberry.field
    def admin_products(self, info: Info) -> List[AdminProductType]:
        require_staff(info.context.user)
        products = Product.objects.all()
        return [
            AdminProductType(
                id=p.id,
                name=p.name,
                description=p.description,
                price=float(p.price),
                salePrice=float(p.sale_price) if p.sale_price else None,
                currency=p.currency,
                category=p.category.name,
                categoryId=p.category.id,
                inStock=p.in_stock,
                isNew=p.is_new,
                onSale=p.on_sale,
                rating=p.average_rating,
                reviews=p.review_count,
                sizes=p.sizes,
                colors=p.colors,
                images=p.images,
                createdAt=p.created_at.isoformat(),
            )
            for p in products
        ]

    @strawberry.field
    def admin_users(self, info: Info) -> List[AdminUserType]:
        require_staff(info.context.user)
        users = User.objects.all().order_by("-date_joined")
        data = []
        for user in users:
            profile, _ = UserProfile.objects.get_or_create(user=user)
            data.append(
                AdminUserType(
                    id=user.id,
                    username=user.username,
                    email=user.email,
                    firstName=user.first_name,
                    lastName=user.last_name,
                    isStaff=user.is_staff,
                    isActive=user.is_active,
                    dateJoined=user.date_joined.isoformat(),
                    profile=ProfileType(
                        avatar=str(profile.avatar) if profile.avatar else "",
                        phone=profile.phone or "",
                        address=profile.address or "",
                        city=profile.city or "",
                        country=profile.country or "",
                        postalCode=profile.postal_code or "",
                    ),
                )
            )
        return data

    @strawberry.field
    def admin_orders(self, info: Info) -> List[AdminOrderType]:
        require_staff(info.context.user)
        orders = Order.objects.all().order_by("-created_at")
        return [
            AdminOrderType(
                id=order.id,
                orderId=order.order_id,
                user=order.user.username,
                totalAmount=float(order.total_amount),
                status=order.status,
                createdAt=order.created_at.isoformat(),
            )
            for order in orders
        ]

    @strawberry.field
    def mpesa_status(self, info: Info, checkoutRequestId: str) -> MpesaStatus:
        require_auth(info.context.user)
        response = payment_views.check_mpesa_status(info.context.request, checkoutRequestId)
        data = json.loads(response.content.decode())
        return MpesaStatus(
            status=data.get("status"),
            resultCode=data.get("result_code"),
            resultDesc=data.get("result_desc"),
            transactionId=data.get("transaction_id"),
        )


@strawberry.type
class Mutation:
    @strawberry.mutation
    def login(self, info: Info, username: str, password: str) -> AuthPayload:
        rate_limit(f"login:{info.context.request.META.get('REMOTE_ADDR')}", 5, 60)
        user = authenticate_credentials(username, password)
        if not user:
            raise strawberry.exceptions.GraphQLError("Invalid credentials")
        return AuthPayload(
            accessToken=create_access_token(user),
            refreshToken=create_refresh_token(user),
            user=UserType(
                id=user.id,
                username=user.username,
                email=user.email,
                firstName=user.first_name or "",
                lastName=user.last_name or "",
                isStaff=user.is_staff,
                role="admin" if user.is_staff else "buyer",
            ),
        )

    @strawberry.mutation
    def refresh(self, info: Info, refresh_token: str) -> AuthPayload:
        rate_limit(f"refresh:{info.context.request.META.get('REMOTE_ADDR')}", 10, 60)
        payload = decode_token(refresh_token)
        if not payload or payload.get("type") != "refresh":
            raise strawberry.exceptions.GraphQLError("Invalid refresh token")
        user = User.objects.filter(id=payload.get("sub")).first()
        if not user:
            raise strawberry.exceptions.GraphQLError("User not found")
        return AuthPayload(
            accessToken=create_access_token(user),
            refreshToken=create_refresh_token(user),
            user=UserType(
                id=user.id,
                username=user.username,
                email=user.email,
                firstName=user.first_name or "",
                lastName=user.last_name or "",
                isStaff=user.is_staff,
                role="admin" if user.is_staff else "buyer",
            ),
        )

    @strawberry.mutation
    def register(self, info: Info, username: str, email: str, password: str) -> AuthPayload:
        rate_limit(f"register:{info.context.request.META.get('REMOTE_ADDR')}", 3, 60)
        form = RegistrationForm(
            {"username": username, "email": email, "password": password, "password_confirm": password}
        )
        if not form.is_valid():
            raise strawberry.exceptions.GraphQLError("Invalid registration data")
        with transaction.atomic():
            user = User.objects.create_user(username=username, email=email, password=password)
            UserProfile.objects.create(user=user)
            Cart.objects.create(user=user)
        return AuthPayload(
            accessToken=create_access_token(user),
            refreshToken=create_refresh_token(user),
            user=UserType(
                id=user.id,
                username=user.username,
                email=user.email,
                firstName=user.first_name or "",
                lastName=user.last_name or "",
                isStaff=user.is_staff,
                role="buyer",
            ),
        )

    @strawberry.mutation
    def logout(self, info: Info) -> SimplePayload:
        return SimplePayload(success=True)

    @strawberry.mutation
    def cart_add(self, info: Info, input: CartAddInput) -> SimplePayload:
        require_auth(info.context.user)
        product = Product.objects.get(id=input.productId)
        cart, _ = Cart.objects.get_or_create(user=info.context.user)
        item, created = CartItem.objects.get_or_create(
            cart=cart,
            product=product,
            selected_size=input.selectedSize,
            selected_color=input.selectedColor,
            defaults={"quantity": input.quantity},
        )
        if not created:
            item.quantity = input.quantity
            item.save()
        return SimplePayload(success=True)

    @strawberry.mutation
    def cart_update(self, info: Info, item_id: int, quantity: int) -> SimplePayload:
        require_auth(info.context.user)
        item = CartItem.objects.get(id=item_id, cart__user=info.context.user)
        if quantity > 0:
            item.quantity = quantity
            item.save()
        else:
            item.delete()
        return SimplePayload(success=True)

    @strawberry.mutation
    def cart_remove(self, info: Info, item_id: int) -> SimplePayload:
        require_auth(info.context.user)
        CartItem.objects.filter(id=item_id, cart__user=info.context.user).delete()
        return SimplePayload(success=True)

    @strawberry.mutation
    def saved_add(self, info: Info, product_id: int) -> SavedAddPayload:
        require_auth(info.context.user)
        product = Product.objects.get(id=product_id)
        item, _ = SavedItem.objects.get_or_create(user=info.context.user, product=product)
        return SavedAddPayload(success=True, itemId=item.id)

    @strawberry.mutation
    def saved_remove(self, info: Info, item_id: int) -> SimplePayload:
        require_auth(info.context.user)
        SavedItem.objects.filter(id=item_id, user=info.context.user).delete()
        return SimplePayload(success=True)

    @strawberry.mutation
    def update_profile(self, info: Info, input: ProfileUpdateInput) -> SimplePayload:
        require_auth(info.context.user)
        profile, _ = UserProfile.objects.get_or_create(user=info.context.user)
        form = ProfileForm(
            {
                "first_name": input.firstName,
                "last_name": input.lastName,
                "email": input.email,
                "phone": input.phone,
                "address": input.address,
                "city": input.city,
                "country": input.country,
                "postal_code": input.postalCode,
            },
            user=info.context.user,
        )
        if not form.is_valid():
            raise strawberry.exceptions.GraphQLError("Invalid profile data")
        info.context.user.first_name = input.firstName or info.context.user.first_name
        info.context.user.last_name = input.lastName or info.context.user.last_name
        info.context.user.email = input.email or info.context.user.email
        info.context.user.save()
        profile.phone = input.phone or profile.phone
        profile.address = input.address or profile.address
        profile.city = input.city or profile.city
        profile.country = input.country or profile.country
        profile.postal_code = input.postalCode or profile.postal_code
        profile.save()
        return SimplePayload(success=True)

    @strawberry.mutation
    def submit_review(self, info: Info, product_id: int, rating: int, comment: str) -> SimplePayload:
        require_auth(info.context.user)
        product = Product.objects.get(id=product_id)
        if rating < 1 or rating > 5:
            raise strawberry.exceptions.GraphQLError("Rating must be between 1 and 5")
        Review.objects.update_or_create(
            product=product,
            user=info.context.user,
            defaults={"rating": rating, "comment": comment},
        )
        return SimplePayload(success=True)

    @strawberry.mutation
    def mark_notification_read(self, info: Info, notification_id: int) -> SimplePayload:
        require_auth(info.context.user)
        Notification.objects.filter(
            id=notification_id, user=info.context.user
        ).update(is_read=True)
        return SimplePayload(success=True)

    @strawberry.mutation
    def mark_all_notifications_read(self, info: Info) -> SimplePayload:
        require_auth(info.context.user)
        Notification.objects.filter(user=info.context.user, is_read=False).update(
            is_read=True
        )
        return SimplePayload(success=True)

    @strawberry.mutation
    def process_payment(self, info: Info, input: PaymentInput) -> PaymentResult:
        require_auth(info.context.user)
        payload = {
            "payment_method": input.paymentMethod,
            "amount": input.amount,
            "phone_number": input.phoneNumber,
        }
        if input.orderData is not None:
            payload["order_data"] = input.orderData
        if input.cardData is not None:
            payload["card_data"] = {
                "cardNumber": input.cardData.cardNumber,
                "cardExpiry": input.cardData.cardExpiry,
                "cardCvc": input.cardData.cardCvc,
                "cardName": input.cardData.cardName,
            }
        request = info.context.request
        request._body = json.dumps(payload).encode()
        result = payment_views.process_payment(request)
        data = json.loads(result.content.decode())
        return PaymentResult(
            success=data.get("success", False),
            message=data.get("message"),
            error=data.get("error"),
            transactionId=data.get("transaction_id"),
            redirectUrl=data.get("redirect_url"),
            checkoutRequestId=data.get("checkout_request_id"),
            merchantRequestId=data.get("merchant_request_id"),
        )

    @strawberry.mutation
    def validate_card(self, info: Info, card_number: str) -> CardValidationResult:
        require_auth(info.context.user)
        request = info.context.request
        request._body = json.dumps({"card_number": card_number}).encode()
        result = payment_views.validate_card(request)
        data = json.loads(result.content.decode())
        return CardValidationResult(valid=data.get("valid", False), cardType=data.get("card_type"))

    @strawberry.mutation
    def admin_create_product(self, info: Info, input: AdminCreateProductInput) -> AdminCreateProductPayload:
        require_staff(info.context.user)
        category = Category.objects.get(id=input.categoryId)
        product = Product.objects.create(
            name=input.name,
            description=input.description,
            price=input.price,
            currency=input.currency or "KES",
            category=category,
            sizes=input.sizes,
            colors=input.colors,
            images=input.images,
            in_stock=input.inStock,
        )
        return AdminCreateProductPayload(success=True, productId=product.id)


schema_extensions: List[object] = []
if not settings.DEBUG:
    schema_extensions.append(DisableIntrospection())

schema = strawberry.Schema(
    query=Query,
    mutation=Mutation,
    config=StrawberryConfig(auto_camel_case=True),
    extensions=schema_extensions or None,
)
