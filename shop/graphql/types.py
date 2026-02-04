from __future__ import annotations

import strawberry

JSON = strawberry.scalar(dict, name="JSON")


@strawberry.type
class UserType:
    id: strawberry.ID
    username: str
    email: str
    firstName: str
    lastName: str
    isStaff: bool
    role: str


@strawberry.type
class CategoryType:
    id: strawberry.ID
    name: str
    slug: str


@strawberry.type
class ProductType:
    id: strawberry.ID
    name: str
    description: str
    price: float
    salePrice: float | None
    currency: str
    baseCurrency: str
    category: str | None
    sizes: list[str]
    colors: list[str]
    images: list[str]
    inStock: bool
    isNew: bool
    onSale: bool
    rating: float
    reviews: int


@strawberry.type
class CartProductType:
    id: strawberry.ID
    name: str
    price: float
    images: list[str]


@strawberry.type
class CartItemType:
    id: strawberry.ID
    product: CartProductType
    quantity: int
    selectedSize: str
    selectedColor: str


@strawberry.type
class SavedItemType:
    id: strawberry.ID
    product: ProductType


@strawberry.type
class ProfileType:
    avatar: str
    phone: str
    address: str
    city: str
    country: str
    postalCode: str


@strawberry.type
class UserProfileType:
    user: UserType
    profile: ProfileType


@strawberry.type
class OrderItemType:
    productName: str
    quantity: int
    price: float


@strawberry.type
class OrderType:
    id: strawberry.ID
    orderId: str
    totalAmount: float
    status: str
    createdAt: str
    items: list[OrderItemType]


@strawberry.type
class ReviewType:
    id: strawberry.ID
    user: str
    rating: int
    comment: str
    createdAt: str


@strawberry.type
class NotificationType:
    id: strawberry.ID
    title: str
    message: str
    type: str
    isRead: bool
    link: str | None
    createdAt: str


@strawberry.type
class NotificationsPayload:
    items: list[NotificationType]
    unreadCount: int


@strawberry.type
class ReviewsPayload:
    reviews: list[ReviewType]
    averageRating: float
    reviewCount: int


@strawberry.type
class AuthPayload:
    accessToken: str
    refreshToken: str
    user: UserType


@strawberry.type
class SimplePayload:
    success: bool
    message: str | None = None


@strawberry.type
class AdminCreateProductPayload:
    success: bool
    productId: strawberry.ID | None = None


@strawberry.type
class SavedAddPayload:
    success: bool
    itemId: strawberry.ID | None


@strawberry.type
class PaymentResult:
    success: bool
    message: str | None = None
    error: str | None = None
    transactionId: str | None = None
    redirectUrl: str | None = None
    checkoutRequestId: str | None = None
    merchantRequestId: str | None = None


@strawberry.type
class CardValidationResult:
    valid: bool
    cardType: str | None = None


@strawberry.type
class MpesaStatus:
    status: str
    resultCode: str
    resultDesc: str
    transactionId: str | None = None


@strawberry.type
class ExchangeRates:
    base: str
    rates: JSON


@strawberry.type
class AdminAnalytics:
    totalOrders: int
    totalRevenue: float
    totalUsers: int
    totalProducts: int
    recentOrders: int
    popularProducts: list[JSON]
    userLocations: list[JSON]
    categoryPreferences: list[JSON]
    salesTrends: list[JSON]
    loginActivity: list[JSON]


@strawberry.type
class AdminProductType:
    id: strawberry.ID
    name: str
    description: str
    price: float
    salePrice: float | None
    currency: str
    category: str
    categoryId: int
    inStock: bool
    isNew: bool
    onSale: bool
    rating: float
    reviews: int
    sizes: list[str]
    colors: list[str]
    images: list[str]
    createdAt: str


@strawberry.type
class AdminUserType:
    id: strawberry.ID
    username: str
    email: str
    firstName: str
    lastName: str
    isStaff: bool
    isActive: bool
    dateJoined: str
    profile: ProfileType


@strawberry.type
class AdminOrderType:
    id: strawberry.ID
    orderId: str
    user: str
    totalAmount: float
    status: str
    createdAt: str
