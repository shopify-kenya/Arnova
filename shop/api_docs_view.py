from django.shortcuts import render


def api_docs(request):
    """API documentation and testing interface"""
    return render(request, "api_docs.html")
