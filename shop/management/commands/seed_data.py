from django.core.management.base import BaseCommand

from shop.models import Category


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
