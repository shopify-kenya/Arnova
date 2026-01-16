"""Account lockout middleware for failed login attempts"""

import logging
from datetime import datetime, timedelta

from django.core.cache import cache
from django.http import JsonResponse

logger = logging.getLogger("shop")


class AccountLockoutMiddleware:
    """Lock accounts after multiple failed login attempts"""

    def __init__(self, get_response):
        self.get_response = get_response
        self.max_attempts = 5  # Max failed attempts
        self.lockout_duration = 900  # 15 minutes in seconds

    def __call__(self, request):
        # Check if this is a login attempt
        if request.path == "/api/auth/login/" and request.method == "POST":
            identifier = self.get_identifier(request)
            lockout_key = f"lockout_{identifier}"
            attempts_key = f"attempts_{identifier}"

            # Check if account is locked
            if cache.get(lockout_key):
                logger.warning(f"Login attempt on locked account: {identifier}")
                return JsonResponse(
                    {
                        "error": "Account temporarily locked due to multiple failed login attempts. Try again in 15 minutes."
                    },
                    status=429,
                )

        response = self.get_response(request)

        # Track failed login attempts
        if (
            request.path == "/api/auth/login/"
            and request.method == "POST"
            and response.status_code == 401
        ):
            self.record_failed_attempt(request)

        # Clear attempts on successful login
        if (
            request.path == "/api/auth/login/"
            and request.method == "POST"
            and response.status_code == 200
        ):
            self.clear_attempts(request)

        return response

    def get_identifier(self, request):
        """Get identifier for tracking (IP + username if available)"""
        import json

        ip = request.META.get("REMOTE_ADDR", "unknown")
        try:
            data = json.loads(request.body)
            username = data.get("username") or data.get("email", "")
            return f"{ip}_{username}"
        except Exception:
            return ip

    def record_failed_attempt(self, request):
        """Record a failed login attempt"""
        identifier = self.get_identifier(request)
        attempts_key = f"attempts_{identifier}"
        lockout_key = f"lockout_{identifier}"

        # Get current attempts
        attempts = cache.get(attempts_key, 0) + 1
        cache.set(attempts_key, attempts, 3600)  # Store for 1 hour

        logger.warning(
            f"Failed login attempt {attempts}/{self.max_attempts} for {identifier}"
        )

        # Lock account if max attempts reached
        if attempts >= self.max_attempts:
            cache.set(lockout_key, True, self.lockout_duration)
            cache.delete(attempts_key)
            logger.error(
                f"Account locked for {identifier} after {attempts} failed attempts"
            )

    def clear_attempts(self, request):
        """Clear failed attempts on successful login"""
        identifier = self.get_identifier(request)
        attempts_key = f"attempts_{identifier}"
        cache.delete(attempts_key)
