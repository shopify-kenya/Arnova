"""Account lockout middleware for failed login attempts"""

import logging

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
        is_login_attempt = self.is_login_attempt(request)
        if is_login_attempt:
            identifier = self.get_identifier(request)
            lockout_key = f"lockout_{identifier}"

            # Check if account is locked
            if cache.get(lockout_key):
                logger.warning(f"Login attempt on locked account: {identifier}")
                message = (
                    "Account temporarily locked due to multiple failed login "
                    "attempts. Try again in 15 minutes."
                )
                if request.path == "/admin/login/":
                    from django.shortcuts import render

                    return render(
                        request,
                        "admin/login.html",
                        {"error": message, "next": request.POST.get("next", "/admin/")},
                        status=429,
                    )
                return JsonResponse({"error": message}, status=429)

        response = self.get_response(request)

        # Track failed login attempts
        if is_login_attempt:
            if self.is_login_failure(request, response):
                self.record_failed_attempt(request)
            else:
                self.clear_attempts(request)

        return response

    def is_login_attempt(self, request) -> bool:
        """Detect GraphQL, REST and admin login attempts."""
        if request.method != "POST":
            return False

        if request.path == "/graphql/":
            try:
                import json
                import re

                payload = json.loads(request.body or "{}")
                query = payload.get("query", "") or ""
                return bool(
                    re.search(r"\bmutation\b", query)
                    and re.search(r"\blogin\s*\(", query)
                )
            except Exception:
                return False

        return request.path in {"/api/login/", "/admin/login/"}

    def is_login_failure(self, request, response) -> bool:
        if request.path == "/admin/login/":
            # Successful form login redirects to admin pages.
            return response.status_code != 302

        try:
            import json

            payload = json.loads(response.content.decode() or "{}")
            if request.path == "/graphql/":
                return bool(payload.get("errors"))
            if request.path == "/api/login/":
                return response.status_code >= 400 or not payload.get("success", False)
        except Exception:
            return response.status_code >= 400

        return response.status_code >= 400

    def get_identifier(self, request):
        """Get identifier for tracking (IP + username if available)"""
        import json

        ip = request.META.get("REMOTE_ADDR", "unknown")
        try:
            data = json.loads(request.body)
            if request.path == "/graphql/":
                variables = data.get("variables") or {}
                username = variables.get("username") or variables.get("email", "")
            else:
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
            "Failed login attempt %s/%s for %s",
            attempts,
            self.max_attempts,
            identifier,
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
