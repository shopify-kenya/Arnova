from django.contrib.auth import authenticate, login
from django.contrib.auth.decorators import login_required
from django.shortcuts import redirect, render


def admin_login(request):
    """Admin login view with Django template"""
    if request.user.is_authenticated and request.user.is_staff:
        return redirect("/admin/")

    if request.method == "POST":
        username = request.POST.get("username")
        password = request.POST.get("password")
        next_url = request.POST.get("next", "/admin/")

        # Try email login first
        if "@" in username:
            from django.contrib.auth.models import User

            try:
                user_obj = User.objects.get(email=username)
                user = authenticate(
                    request, username=user_obj.username, password=password
                )
            except User.DoesNotExist:
                user = None
        else:
            user = authenticate(request, username=username, password=password)

        if user and user.is_staff:
            login(request, user)
            return redirect(next_url)
        else:
            return render(
                request,
                "admin/login.html",
                {
                    "error": "Invalid credentials or insufficient permissions",
                    "next": next_url,
                },
            )

    next_url = request.GET.get("next", "/admin/")
    return render(request, "admin/login.html", {"next": next_url})


@login_required
def admin_logout(request):
    """Admin logout view"""
    from django.contrib.auth import logout

    if request.method == "POST" or request.method == "GET":
        logout(request)
        return redirect("/admin/login/")
    return redirect("/admin/")
