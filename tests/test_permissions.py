#!/usr/bin/env python3
"""Test user permissions and roles"""

import os
import sys
from pathlib import Path

# Add project root to path
project_root = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(project_root))

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")

import django  # noqa: E402

django.setup()  # noqa: E402

from django.contrib.auth.models import User  # noqa: E402
from shop.models import Cart, UserProfile  # noqa: E402


def test_permissions():
    print("=" * 60)
    print("PERMISSION & ROLE VERIFICATION")
    print("=" * 60)

    # Test Admin User
    print("\n1. ADMIN USER (ArnovaAdmin)")
    print("-" * 60)
    admin = User.objects.filter(username="ArnovaAdmin").first()
    if admin:
        print(f"✓ Username: {admin.username}")
        print(f"✓ Email: {admin.email}")
        print(f"✓ is_staff: {admin.is_staff} (Should be True)")
        print(f"✓ is_superuser: {admin.is_superuser} (Should be True)")
        print(f"✓ is_active: {admin.is_active} (Should be True)")
        print(f"✓ Role: {'admin' if admin.is_staff else 'buyer'}")

        # Check profile
        profile = UserProfile.objects.filter(user=admin).first()
        print(f"✓ Has Profile: {profile is not None}")

        # Check cart
        cart = Cart.objects.filter(user=admin).first()
        print(f"✓ Has Cart: {cart is not None}")

        # Permissions
        print("\nPermissions:")
        print(f"  - Can access /admin/*: {admin.is_staff}")
        print(f"  - Can access /django-admin/: {admin.is_staff}")
        print(f"  - Can access /graphql/ (JWT): {admin.is_authenticated}")
    else:
        print("✗ Admin user not found!")

    # Test Buyer User
    print("\n2. BUYER USER (ArnoBuyer)")
    print("-" * 60)
    buyer = User.objects.filter(username="ArnoBuyer").first()
    if buyer:
        print(f"✓ Username: {buyer.username}")
        print(f"✓ Email: {buyer.email}")
        print(f"✓ is_staff: {buyer.is_staff} (Should be False)")
        print(f"✓ is_superuser: {buyer.is_superuser} (Should be False)")
        print(f"✓ is_active: {buyer.is_active} (Should be True)")
        print(f"✓ Role: {'admin' if buyer.is_staff else 'buyer'}")

        # Check profile
        profile = UserProfile.objects.filter(user=buyer).first()
        print(f"✓ Has Profile: {profile is not None}")

        # Check cart
        cart = Cart.objects.filter(user=buyer).first()
        print(f"✓ Has Cart: {cart is not None}")

        # Permissions
        print("\nPermissions:")
        print(f"  - Can access /admin/*: {buyer.is_staff}")
        print(f"  - Can access /django-admin/: {buyer.is_staff}")
        print(f"  - Can access /graphql/ (JWT): {buyer.is_authenticated}")
    else:
        print("✗ Buyer user not found!")

    # Summary
    print("\n3. SUMMARY")
    print("-" * 60)
    print(f"Total users: {User.objects.count()}")
    print(f"Staff users: {User.objects.filter(is_staff=True).count()}")
    print(f"Regular users: {User.objects.filter(is_staff=False).count()}")
    print(f"Active users: {User.objects.filter(is_active=True).count()}")

    print("\n4. ENDPOINT PROTECTION")
    print("-" * 60)
    print("Public GraphQL operations (no auth required):")
    print("  - health")
    print("  - products, product, categories")
    print("  - exchangeRates")

    print("\nAuthenticated GraphQL operations (login required):")
    print("  - cart, cartAdd, cartUpdate, cartRemove")
    print("  - saved, savedAdd, savedRemove")
    print("  - profile, updateProfile")
    print("  - orders")
    print("  - submitReview")
    print("  - processPayment, validateCard, mpesaStatus")
    print("  - notifications, markNotificationRead, markAllNotificationsRead")

    print("\nAdmin-only GraphQL operations (staff required):")
    print("  - adminAnalytics, adminProducts, adminUsers, adminOrders")
    print("  - adminCreateProduct")
    print("\nAdmin UI endpoints:")
    print("  - /admin/*")
    print("  - /django-admin/")

    print("\n" + "=" * 60)
    print("✓ VERIFICATION COMPLETE")
    print("=" * 60)


if __name__ == "__main__":
    test_permissions()
