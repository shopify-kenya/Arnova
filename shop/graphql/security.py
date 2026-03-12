from __future__ import annotations

import logging

from django.core.cache import cache
from graphql import GraphQLError


logger = logging.getLogger("shop")


def rate_limit(key: str, limit: int, window_seconds: int) -> None:
    cache_key = f"graphql_rl:{key}"

    try:
        current = cache.get(cache_key, 0)
    except Exception as exc:
        logger.warning("GraphQL rate limit cache read failed for %s: %s", cache_key, exc)
        return

    if current >= limit:
        raise GraphQLError("Rate limit exceeded. Please try again later.")

    try:
        cache.set(cache_key, current + 1, timeout=window_seconds)
    except Exception as exc:
        logger.warning("GraphQL rate limit cache write failed for %s: %s", cache_key, exc)


def require_auth(user) -> None:
    if not user or not user.is_authenticated:
        raise GraphQLError("Authentication required")


def require_staff(user) -> None:
    require_auth(user)
    if not user.is_staff:
        raise GraphQLError("Admin access required")
