import os
from django.db import migrations
from django.contrib.auth.models import User


def create_admin_user(apps, schema_editor):
    """Create admin and buyer users from environment variables"""
    # Create admin user
    admin_username = os.getenv('ADMIN_USERNAME')
    admin_email = os.getenv('ADMIN_EMAIL')
    admin_password = os.getenv('ADMIN_PASSWORD')
    
    if not User.objects.filter(username=admin_username).exists():
        User.objects.create_superuser(
            username=admin_username,
            email=admin_email,
            password=admin_password
        )
    
    # Create buyer user
    buyer_username = os.getenv('BUYER_USERNAME')
    buyer_email = os.getenv('BUYER_EMAIL')
    buyer_password = os.getenv('BUYER_PASSWORD')
    
    if buyer_username and buyer_email and buyer_password and not User.objects.filter(username=buyer_username).exists():
        User.objects.create_user(
            username=buyer_username,
            email=buyer_email,
            password=buyer_password
        )


def reverse_admin_user(apps, schema_editor):
    """Remove admin and buyer users"""
    admin_username = os.getenv('ADMIN_USERNAME', 'admin')
    buyer_username = os.getenv('BUYER_USERNAME', 'buyer')
    User.objects.filter(username__in=[admin_username, buyer_username]).delete()


class Migration(migrations.Migration):

    dependencies = [
        ('shop', '0002_product_currency'),
    ]

    operations = [
        migrations.RunPython(create_admin_user, reverse_admin_user),
    ]