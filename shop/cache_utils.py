"""Redis cache utilities for GraphQL queries"""

import hashlib
import inspect
import json
from functools import wraps

from django.core.cache import cache

IGNORED_CACHE_ARGS = {"self", "cls", "info"}


def _normalize_cache_value(value):
    if value is None or isinstance(value, (str, int, float, bool)):
        return value

    if isinstance(value, dict):
        return {
            str(key): _normalize_cache_value(item)
            for key, item in sorted(value.items(), key=lambda entry: str(entry[0]))
        }

    if isinstance(value, (list, tuple)):
        return [_normalize_cache_value(item) for item in value]

    if isinstance(value, set):
        return sorted(_normalize_cache_value(item) for item in value)

    for attr in ("pk", "id"):
        attr_value = getattr(value, attr, None)
        if isinstance(attr_value, (str, int, float, bool)):
            return {attr: attr_value}

    return repr(value)


def _build_cache_key(func, args, kwargs):
    signature = inspect.signature(func)
    bound_args = signature.bind_partial(*args, **kwargs)
    normalized_args = {
        name: _normalize_cache_value(value)
        for name, value in bound_args.arguments.items()
        if name not in IGNORED_CACHE_ARGS
    }
    key_data = json.dumps(
        {
            "function": f"{func.__module__}.{func.__qualname__}",
            "arguments": normalized_args,
        },
        sort_keys=True,
        separators=(",", ":"),
    )
    return hashlib.md5(key_data.encode()).hexdigest()


def cache_query(timeout=300):
    """Cache GraphQL query results"""

    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            cache_key = _build_cache_key(func, args, kwargs)

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
