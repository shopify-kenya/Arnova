from django.core.serializers.json import DjangoJSONEncoder
from django.db import models
from django.http import JsonResponse


class SafeJSONEncoder(DjangoJSONEncoder):
    """Custom JSON encoder that handles Django objects safely"""

    def default(self, obj):
        if isinstance(obj, models.QuerySet):
            return list(obj.values())
        return super().default(obj)


def safe_json_response(data, **kwargs):
    """Safe JsonResponse that handles QuerySets and other Django objects"""
    return JsonResponse(data, encoder=SafeJSONEncoder, **kwargs)


def serialize_queryset(queryset, fields=None):
    """Convert QuerySet to serializable list"""
    if fields:
        return list(queryset.values(*fields))
    return list(queryset.values())


def error_response(message, status=400, errors=None, code=None):
    """Standardized error response format"""
    response_data = {
        "success": False,
        "error": {"message": message, "code": code or f"ERROR_{status}"},
    }

    if errors:
        response_data["error"]["details"] = errors

    return JsonResponse(response_data, status=status)


def success_response(data=None, message=None):
    """Standardized success response format"""
    response_data = {"success": True}

    if message:
        response_data["message"] = message

    if data:
        response_data["data"] = data

    return JsonResponse(response_data)
