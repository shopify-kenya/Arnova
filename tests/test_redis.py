#!/usr/bin/env python3
"""Test Redis connection and cache functionality"""

import os
import sys
from pathlib import Path

# Add project root to path
project_root = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(project_root))

# Setup Django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")  # noqa: E402

import django  # noqa: E402

django.setup()  # noqa: E402

from django.conf import settings  # noqa: E402
from django.core.cache import cache  # noqa: E402


def test_redis():
    print("🔍 Testing Redis Connection...")
    print(f"Redis URL: {settings.REDIS_URL}")

    try:
        # Test basic set/get
        cache.set("test_key", "test_value", 60)
        value = cache.get("test_key")

        if value == "test_value":
            print("✅ Redis connection successful!")
            print("✅ Cache set/get working")

            # Test delete
            cache.delete("test_key")
            if cache.get("test_key") is None:
                print("✅ Cache delete working")

            # Show cache stats
            from django_redis import get_redis_connection

            conn = get_redis_connection("default")
            info = conn.info()
            print("\n📊 Redis Stats:")
            print(f"   Connected clients: {info.get('connected_clients', 'N/A')}")
            print(f"   Used memory: {info.get('used_memory_human', 'N/A')}")
            print(f"   Total keys: {conn.dbsize()}")

            return True
        else:
            print("❌ Cache value mismatch")
            return False

    except Exception as e:
        print(f"❌ Redis connection failed: {e}")
        print("\n💡 Make sure Redis is running:")
        print("   - Local: sudo systemctl start redis")
        print("   - Docker: docker run -d -p 6379:6379 redis:alpine")
        return False


if __name__ == "__main__":
    success = test_redis()
    sys.exit(0 if success else 1)
