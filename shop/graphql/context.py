from dataclasses import dataclass
from typing import Optional

from django.contrib.auth.models import AnonymousUser

from .auth import get_user_from_token


@dataclass
class GraphQLContext:
    request: object
    user: object


def get_context(request, response=None) -> GraphQLContext:
    auth_header = request.headers.get("Authorization", "")
    token = ""
    if auth_header.startswith("Bearer "):
        token = auth_header.split(" ", 1)[1].strip()
    if token:
        user = get_user_from_token(token)
    else:
        user = getattr(request, "user", None) or AnonymousUser()
        if not getattr(user, "is_authenticated", False):
            user = AnonymousUser()
    return GraphQLContext(request=request, user=user)
