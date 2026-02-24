"""Redis cache utilities for GraphQL queries"""

from django.core.cache import cache
from functools import wraps
import hashlib
import json


def cache_query(timeout=300):
    """Cache GraphQL query results"""

    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            # Generate cache key from function name and arguments
            key_data = (
                f"{func.__name__}:{json.dumps(args)}:"
                f"{json.dumps(kwargs, sort_keys=True)}"
            )
            cache_key = hashlib.md5(key_data.encode()).hexdigest()

            # Try to get from cache
            result = cache.get(cache_key)
            if result is not None:
                return result

            # Execute function and cache result
            result = func(*args, **kwargs)
            cache.set(cache_key, result, timeout)
            return result

        return wrapper

    return decorator


def invalidate_cache(pattern):
    """Invalidate cache keys matching pattern"""
    from django_redis import get_redis_connection

    conn = get_redis_connection("default")
    keys = conn.keys(f"arnova:*{pattern}*")
    if keys:
        conn.delete(*keys)
