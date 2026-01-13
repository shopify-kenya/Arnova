from django.core.management.base import BaseCommand

from shop.models import Category, Product


class Command(BaseCommand):
    help = "Create test products for M-Pesa testing (10 KES and below)"

    def handle(self, *args, **options):
        # Create categories first
        categories_data = [
            {"name": "Clothing", "slug": "clothing"},
            {"name": "Accessories", "slug": "accessories"},
            {"name": "Bags", "slug": "bags"},
        ]

        for cat_data in categories_data:
            category, created = Category.objects.get_or_create(
                slug=cat_data["slug"], defaults=cat_data
            )
            if created:
                self.stdout.write(f"Created category: {category.name}")

        # Get category objects
        clothing_cat = Category.objects.get(slug="clothing")
        accessories_cat = Category.objects.get(slug="accessories")
        bags_cat = Category.objects.get(slug="bags")

        test_products = [
            {
                "id": "TEST-001",
                "name": "Basic Cotton Socks",
                "description": "Comfortable cotton socks for everyday wear",
                "price": 5.00,
                "currency": "KES",
                "category": clothing_cat,
                "images": ["/api/placeholder/300/400"],
                "in_stock": True,
                "is_new": True,
                "sizes": ["S", "M", "L"],
                "colors": ["Black", "White", "Gray"],
            },
            {
                "id": "TEST-002",
                "name": "Simple Hair Band",
                "description": "Elastic hair band in various colors",
                "price": 3.00,
                "currency": "KES",
                "category": accessories_cat,
                "images": ["/api/placeholder/300/400"],
                "in_stock": True,
                "is_new": True,
                "sizes": ["One Size"],
                "colors": ["Pink", "Blue", "Black"],
            },
            {
                "id": "TEST-003",
                "name": "Pocket Handkerchief",
                "description": "Soft cotton handkerchief",
                "price": 4.00,
                "currency": "KES",
                "category": accessories_cat,
                "images": ["/api/placeholder/300/400"],
                "in_stock": True,
                "is_new": False,
                "sizes": ["One Size"],
                "colors": ["White", "Blue"],
            },
            {
                "id": "TEST-004",
                "name": "Basic Shoelaces",
                "description": "Durable shoelaces for sneakers",
                "price": 2.50,
                "currency": "KES",
                "category": accessories_cat,
                "images": ["/api/placeholder/300/400"],
                "in_stock": True,
                "is_new": False,
                "sizes": ["120cm", "140cm"],
                "colors": ["Black", "White", "Brown"],
            },
            {
                "id": "TEST-005",
                "name": "Mini Keychain",
                "description": "Small decorative keychain",
                "price": 1.50,
                "currency": "KES",
                "category": accessories_cat,
                "images": ["/api/placeholder/300/400"],
                "in_stock": True,
                "is_new": True,
                "sizes": ["One Size"],
                "colors": ["Silver", "Gold"],
            },
            {
                "id": "TEST-006",
                "name": "Fabric Bookmark",
                "description": "Colorful fabric bookmark",
                "price": 2.00,
                "currency": "KES",
                "category": accessories_cat,
                "images": ["/api/placeholder/300/400"],
                "in_stock": True,
                "is_new": False,
                "sizes": ["One Size"],
                "colors": ["Red", "Blue", "Green"],
            },
            {
                "id": "TEST-007",
                "name": "Button Pack (5pcs)",
                "description": "Set of 5 decorative buttons",
                "price": 6.00,
                "currency": "KES",
                "category": accessories_cat,
                "images": ["/api/placeholder/300/400"],
                "in_stock": True,
                "is_new": False,
                "sizes": ["Small", "Medium"],
                "colors": ["Mixed"],
            },
            {
                "id": "TEST-008",
                "name": "Hair Clip Set",
                "description": "Set of 3 small hair clips",
                "price": 7.50,
                "currency": "KES",
                "category": accessories_cat,
                "images": ["/api/placeholder/300/400"],
                "in_stock": True,
                "is_new": True,
                "sizes": ["One Size"],
                "colors": ["Black", "Brown", "Clear"],
            },
            {
                "id": "TEST-009",
                "name": "Elastic Wristband",
                "description": "Simple elastic wristband",
                "price": 3.50,
                "currency": "KES",
                "category": accessories_cat,
                "images": ["/api/placeholder/300/400"],
                "in_stock": True,
                "is_new": False,
                "sizes": ["S", "M", "L"],
                "colors": ["Black", "Blue", "Red"],
            },
            {
                "id": "TEST-010",
                "name": "Small Coin Purse",
                "description": "Tiny coin purse for loose change",
                "price": 8.00,
                "currency": "KES",
                "category": bags_cat,
                "images": ["/api/placeholder/300/400"],
                "in_stock": True,
                "is_new": True,
                "sizes": ["One Size"],
                "colors": ["Black", "Brown", "Red"],
            },
            {
                "id": "TEST-011",
                "name": "Fabric Scrunchie",
                "description": "Soft fabric hair scrunchie",
                "price": 4.50,
                "currency": "KES",
                "category": accessories_cat,
                "images": ["/api/placeholder/300/400"],
                "in_stock": True,
                "is_new": True,
                "sizes": ["One Size"],
                "colors": ["Pink", "Purple", "Yellow"],
            },
            {
                "id": "TEST-012",
                "name": "Basic Pin Badge",
                "description": "Simple decorative pin badge",
                "price": 2.75,
                "currency": "KES",
                "category": accessories_cat,
                "images": ["/api/placeholder/300/400"],
                "in_stock": True,
                "is_new": False,
                "sizes": ["One Size"],
                "colors": ["Silver", "Gold"],
            },
            {
                "id": "TEST-013",
                "name": "Rubber Bracelet",
                "description": "Colorful rubber bracelet",
                "price": 1.00,
                "currency": "KES",
                "category": accessories_cat,
                "images": ["/api/placeholder/300/400"],
                "in_stock": True,
                "is_new": False,
                "sizes": ["S", "M", "L"],
                "colors": ["Red", "Blue", "Green", "Yellow"],
            },
            {
                "id": "TEST-014",
                "name": "Thread Spool",
                "description": "Basic sewing thread spool",
                "price": 3.25,
                "currency": "KES",
                "category": accessories_cat,
                "images": ["/api/placeholder/300/400"],
                "in_stock": True,
                "is_new": False,
                "sizes": ["One Size"],
                "colors": ["Black", "White", "Red", "Blue"],
            },
            {
                "id": "TEST-015",
                "name": "Small Sticker Pack",
                "description": "Pack of 10 decorative stickers",
                "price": 5.50,
                "currency": "KES",
                "category": accessories_cat,
                "images": ["/api/placeholder/300/400"],
                "in_stock": True,
                "is_new": True,
                "sizes": ["One Size"],
                "colors": ["Mixed"],
            },
            {
                "id": "TEST-016",
                "name": "Fabric Patch",
                "description": "Iron-on fabric patch",
                "price": 4.25,
                "currency": "KES",
                "category": accessories_cat,
                "images": ["/api/placeholder/300/400"],
                "in_stock": True,
                "is_new": False,
                "sizes": ["Small", "Medium"],
                "colors": ["Various"],
            },
            {
                "id": "TEST-017",
                "name": "Mini Notebook",
                "description": "Small pocket notebook",
                "price": 9.00,
                "currency": "KES",
                "category": accessories_cat,
                "images": ["/api/placeholder/300/400"],
                "in_stock": True,
                "is_new": True,
                "sizes": ["A6"],
                "colors": ["Blue", "Red", "Green"],
            },
            {
                "id": "TEST-018",
                "name": "Safety Pin Set",
                "description": "Set of 10 safety pins",
                "price": 2.25,
                "currency": "KES",
                "category": accessories_cat,
                "images": ["/api/placeholder/300/400"],
                "in_stock": True,
                "is_new": False,
                "sizes": ["Small", "Medium"],
                "colors": ["Silver"],
            },
            {
                "id": "TEST-019",
                "name": "Cord Organizer",
                "description": "Small cord organizer clip",
                "price": 6.50,
                "currency": "KES",
                "category": accessories_cat,
                "images": ["/api/placeholder/300/400"],
                "in_stock": True,
                "is_new": True,
                "sizes": ["One Size"],
                "colors": ["Black", "White"],
            },
            {
                "id": "TEST-020",
                "name": "Decorative Magnet",
                "description": "Small decorative fridge magnet",
                "price": 3.75,
                "currency": "KES",
                "category": accessories_cat,
                "images": ["/api/placeholder/300/400"],
                "in_stock": True,
                "is_new": False,
                "sizes": ["One Size"],
                "colors": ["Various"],
            },
        ]

        created_count = 0
        for product_data in test_products:
            product, created = Product.objects.get_or_create(
                id=product_data["id"], defaults=product_data
            )
            if created:
                created_count += 1
                self.stdout.write(f"Created: {product.name} - KES {product.price}")
            else:
                self.stdout.write(f"Already exists: {product.name}")

        self.stdout.write(
            self.style.SUCCESS(
                f"Successfully created {created_count} test products "
                f"for M-Pesa testing"
            )
        )
        self.stdout.write(
            self.style.WARNING(
                "Note: Transport cost is set to KES 1.00 in checkout " "for testing"
            )
        )
