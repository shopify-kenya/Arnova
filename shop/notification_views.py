import json

from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods

from .models import Notification


@login_required
def api_notifications(request):
    """Get user notifications"""
    notifications = Notification.objects.filter(user=request.user)[:20]
    unread_count = notifications.filter(is_read=False).count()

    return JsonResponse(
        {
            "notifications": [
                {
                    "id": n.id,
                    "title": n.title,
                    "message": n.message,
                    "type": n.notification_type,
                    "is_read": n.is_read,
                    "link": n.link,
                    "created_at": n.created_at.isoformat(),
                }
                for n in notifications
            ],
            "unread_count": unread_count,
        }
    )


@login_required
@require_http_methods(["POST"])
def api_notification_mark_read(request, notification_id):
    """Mark notification as read"""
    try:
        notification = Notification.objects.get(id=notification_id, user=request.user)
        notification.is_read = True
        notification.save()
        return JsonResponse({"success": True})
    except Notification.DoesNotExist:
        return JsonResponse(
            {"success": False, "error": "Notification not found"}, status=404
        )


@login_required
@require_http_methods(["POST"])
def api_notifications_mark_all_read(request):
    """Mark all notifications as read"""
    Notification.objects.filter(user=request.user, is_read=False).update(is_read=True)
    return JsonResponse({"success": True})


def create_notification(user, title, message, notification_type="system", link=None):
    """Helper function to create notifications"""
    return Notification.objects.create(
        user=user,
        title=title,
        message=message,
        notification_type=notification_type,
        link=link,
    )
