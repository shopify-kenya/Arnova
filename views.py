from django.http import HttpResponse
from django.conf import settings
import os

def index(request):
    # Serve the Next.js index.html file
    nextjs_index = os.path.join(settings.BASE_DIR, 'static', 'dist', 'server', 'app', 'index.html')
    if os.path.exists(nextjs_index):
        with open(nextjs_index, 'r') as f:
            return HttpResponse(f.read(), content_type='text/html')
    else:
        return HttpResponse('''
        <!DOCTYPE html>
        <html><head><title>Arnova Shop</title></head>
        <body>
            <h1>Arnova Shop - Django + NextJS Integration</h1>
            <p>✅ Backend is running!</p>
            <p>Frontend build found but serving fallback. Next.js app should be running separately.</p>
        </body></html>
        ''', content_type='text/html')