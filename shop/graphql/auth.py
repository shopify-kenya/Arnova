import datetime as dt
from typing import Optional

import jwt
from django.conf import settings
from django.contrib.auth import authenticate
from django.contrib.auth.models import AnonymousUser, User


JWT_ALGORITHM = getattr(settings, "JWT_ALGORITHM", "HS256")
ACCESS_TTL_MINUTES = getattr(settings, "JWT_ACCESS_TTL_MINUTES", 15)
REFRESH_TTL_DAYS = getattr(settings, "JWT_REFRESH_TTL_DAYS", 7)


def _jwt_secret() -> str:
    return getattr(settings, "JWT_SECRET", settings.SECRET_KEY)


def create_access_token(user: User) -> str:
    now = dt.datetime.utcnow()
    payload = {
        "sub": str(user.id),
        "type": "access",
        "role": "admin" if user.is_staff else "buyer",
        "iat": now,
        "exp": now + dt.timedelta(minutes=ACCESS_TTL_MINUTES),
    }
    return jwt.encode(payload, _jwt_secret(), algorithm=JWT_ALGORITHM)


def create_refresh_token(user: User) -> str:
    now = dt.datetime.utcnow()
    payload = {
        "sub": str(user.id),
        "type": "refresh",
        "iat": now,
        "exp": now + dt.timedelta(days=REFRESH_TTL_DAYS),
    }
    return jwt.encode(payload, _jwt_secret(), algorithm=JWT_ALGORITHM)


def decode_token(token: str) -> Optional[dict]:
    try:
        return jwt.decode(token, _jwt_secret(), algorithms=[JWT_ALGORITHM])
    except jwt.PyJWTError:
        return None


def get_user_from_token(token: str) -> User | AnonymousUser:
    payload = decode_token(token)
    if not payload or payload.get("type") != "access":
        return AnonymousUser()
    user_id = payload.get("sub")
    if not user_id:
        return AnonymousUser()
    return User.objects.filter(id=user_id).first() or AnonymousUser()


def authenticate_credentials(username_or_email: str, password: str) -> User | None:
    user = None
    if "@" in username_or_email:
        user_obj = User.objects.filter(email=username_or_email).first()
        if user_obj:
            user = authenticate(username=user_obj.username, password=password)
    if not user:
        user = authenticate(username=username_or_email, password=password)
    return user
