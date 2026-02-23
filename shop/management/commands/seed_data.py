from django.core.management.base import BaseCommand

from shop.models import Cart, Category, UserProfile


class Command(BaseCommand):
    help = "Seed initial categories and data"

    def handle(self, *args, **options):
        categories = [
            {"name": "Men", "slug": "men"},
            {"name": "Women", "slug": "women"},
            {"name": "Kids", "slug": "kids"},
            {"name": "Accessories", "slug": "accessories"},
            {"name": "Shoes", "slug": "shoes"},
        ]

        for cat_data in categories:
            Category.objects.get_or_create(
                slug=cat_data["slug"], defaults={"name": cat_data["name"]}
            )
            self.stdout.write(
                self.style.SUCCESS(f"✅ Created/verified category: {cat_data['name']}")
            )

        self.stdout.write(
            self.style.SUCCESS(f"\n📊 Total categories: {Category.objects.count()}")
        )

        # Create profiles and carts for all users
        from django.contrib.auth.models import User

        for user in User.objects.all():
            UserProfile.objects.get_or_create(user=user)
            Cart.objects.get_or_create(user=user)

        self.stdout.write(
            self.style.SUCCESS(f"📊 Total user profiles: {UserProfile.objects.count()}")
        )
        self.stdout.write(self.style.SUCCESS(f"📊 Total carts: {Cart.objects.count()}"))
