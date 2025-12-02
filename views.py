from django.http import HttpResponse
from django.conf import settings
from django.views.decorators.cache import cache_control
from django.views.decorators.gzip import gzip_page
import os

@gzip_page
@cache_control(max_age=3600, public=True)
def index(request):
    # Serve the Next.js exported index.html for all routes
    nextjs_index = os.path.join(settings.BASE_DIR, 'build', 'index.html')
    if os.path.exists(nextjs_index):
        with open(nextjs_index, 'r', encoding='utf-8') as f:
            response = HttpResponse(f.read(), content_type='text/html')
            response['Cache-Control'] = 'public, max-age=3600'
            return response
    
    # Fallback if no Next.js build exists
    return HttpResponse('''
    <!DOCTYPE html>
    <html>
    <head>
        <title>Arnova - Premium Fashion</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
    </head>
    <body>
        <div style="text-align:center; padding:50px; font-family:Arial;">
            <h1>🛍️ Arnova Shop</h1>
            <p>Django backend is running!</p>
            <p>Run <code>npm run build</code> to generate the frontend.</p>
        </div>
    </body>
    </html>
    ''', content_type='text/html')