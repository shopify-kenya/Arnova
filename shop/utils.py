from django.core.serializers.json import DjangoJSONEncoder
from django.db import models
from django.http import JsonResponse
import json


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