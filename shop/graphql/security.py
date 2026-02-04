from __future__ import annotations

from django.core.cache import cache
from graphql import GraphQLError


def rate_limit(key: str, limit: int, window_seconds: int) -> None:
    cache_key = f"graphql_rl:{key}"
    current = cache.get(cache_key, 0)
    if current >= limit:
        raise GraphQLError("Rate limit exceeded. Please try again later.")
    cache.set(cache_key, current + 1, timeout=window_seconds)


def require_auth(user) -> None:
    if not user or not user.is_authenticated:
        raise GraphQLError("Authentication required")


def require_staff(user) -> None:
    require_auth(user)
    if not user.is_staff:
        raise GraphQLError("Admin access required")
