# Arnova GraphQL API Documentation

**Endpoint:** `/graphql/` (same origin in unified mode)  
**Auth:** JWT (`Authorization: Bearer <token>`) for frontend clients. Admin templates can use session auth.

This document provides the canonical GraphQL entry point and common operations.

## Authentication

### Login

```graphql
mutation Login($username: String!, $password: String!) {
  login(username: $username, password: $password) {
    accessToken
    refreshToken
    user {
      id
      username
      email
      role
    }
  }
}
```

### Refresh Token

```graphql
mutation Refresh($refreshToken: String!) {
  refresh(refreshToken: $refreshToken) {
    accessToken
    refreshToken
  }
}
```

### Register

```graphql
mutation Register($username: String!, $email: String!, $password: String!) {
  register(username: $username, email: $email, password: $password) {
    accessToken
    refreshToken
    user {
      id
      username
      email
      role
    }
  }
}
```

### Logout

```graphql
mutation { logout { success } }
```

## Products & Categories

```graphql
query Products($currency: String!) {
  products(currency: $currency) {
    id
    name
    description
    price
    salePrice
    currency
    baseCurrency
    category
    sizes
    colors
    images
    inStock
    isNew
    onSale
    rating
    reviews
  }
}
```

```graphql
query Product($id: Int!, $currency: String!) {
  product(id: $id, currency: $currency) {
    id
    name
    description
    price
    salePrice
    currency
    baseCurrency
    category
    sizes
    colors
    images
    inStock
    isNew
    onSale
    rating
    reviews
  }
}
```

```graphql
query Categories { categories { id name slug } }
```

## Reviews

```graphql
query ProductReviews($id: Int!) {
  productReviews(id: $id) {
    reviews { id user rating comment createdAt }
    averageRating
    reviewCount
  }
}
```

```graphql
mutation SubmitReview($productId: Int!, $rating: Int!, $comment: String!) {
  submitReview(productId: $productId, rating: $rating, comment: $comment) {
    success
  }
}
```

## Cart

```graphql
query Cart {
  cart {
    items {
      id
      quantity
      selectedSize
      selectedColor
      product { id name price images }
    }
  }
}
```

```graphql
mutation CartAdd($input: CartAddInput!) {
  cartAdd(input: $input) { success }
}
```

```graphql
mutation CartUpdate($itemId: Int!, $quantity: Int!) {
  cartUpdate(itemId: $itemId, quantity: $quantity) { success }
}
```

```graphql
mutation CartRemove($itemId: Int!) {
  cartRemove(itemId: $itemId) { success }
}
```

## Saved Items

```graphql
query Saved { saved { items { id product { id name price } } } }
```

```graphql
mutation SavedAdd($productId: Int!) {
  savedAdd(productId: $productId) { success itemId }
}
```

```graphql
mutation SavedRemove($itemId: Int!) {
  savedRemove(itemId: $itemId) { success }
}
```

## Profile & Orders

```graphql
query Profile {
  profile {
    user { id username email firstName lastName }
    profile { avatar phone address city country postalCode }
  }
}
```

```graphql
mutation UpdateProfile($input: ProfileUpdateInput!) {
  updateProfile(input: $input) { success }
}
```

```graphql
query Orders {
  orders {
    id
    orderId
    totalAmount
    status
    createdAt
    items { productName quantity price }
  }
}
```

## Payments

```graphql
mutation ProcessPayment($input: PaymentInput!) {
  processPayment(input: $input) {
    success
    message
    error
    transactionId
    redirectUrl
    checkoutRequestId
    merchantRequestId
  }
}
```

```graphql
mutation ValidateCard($cardNumber: String!) {
  validateCard(cardNumber: $cardNumber) { valid cardType }
}
```

```graphql
query MpesaStatus($checkoutRequestId: String!) {
  mpesaStatus(checkoutRequestId: $checkoutRequestId) {
    status
    resultCode
    resultDesc
    transactionId
  }
}
```

## Notifications

```graphql
query Notifications {
  notifications {
    unreadCount
    items { id title message type isRead link createdAt }
  }
}
```

```graphql
mutation MarkNotificationRead($notificationId: Int!) {
  markNotificationRead(notificationId: $notificationId) { success }
}
```

```graphql
mutation MarkAllNotificationsRead {
  markAllNotificationsRead { success }
}
```

## Admin (Staff Only)

```graphql
query AdminAnalytics {
  adminAnalytics { totalOrders totalRevenue totalUsers totalProducts }
}
```

```graphql
query AdminProducts {
  adminProducts { id name price inStock isNew onSale }
}
```

```graphql
query AdminUsers {
  adminUsers { id username email isStaff isActive }
}
```

```graphql
query AdminOrders {
  adminOrders { id orderId totalAmount status createdAt }
}
```

```graphql
mutation AdminCreateProduct($input: AdminCreateProductInput!) {
  adminCreateProduct(input: $input) { success productId }
}
```
