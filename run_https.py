#!/usr/bin/env python3
"""
Run Django server with HTTPS for PWA development
"""
import os
import sys
import subprocess
from generate_ssl import generate_ssl_cert

def run_https_server():
    """Run Django development server with HTTPS"""
    
    # Generate SSL certificates if needed
    cert_file, key_file = generate_ssl_cert()
    
    # Check if certificates exist
    if not os.path.exists(cert_file) or not os.path.exists(key_file):
        print("SSL certificates not found!")
        sys.exit(1)
    
    # Install django-extensions if not already installed
    try:
        import django_extensions
    except ImportError:
        print("Installing django-extensions for HTTPS support...")
        subprocess.run([sys.executable, "-m", "pip", "install", "django-extensions"], check=True)
    
    # Update settings to include django-extensions
    settings_file = "settings.py"
    with open(settings_file, 'r') as f:
        content = f.read()
    
    if "'django_extensions'," not in content:
        content = content.replace(
            "'shop',",
            "'shop',\n    'django_extensions',"
        )
        with open(settings_file, 'w') as f:
            f.write(content)
        print("Added django_extensions to INSTALLED_APPS")
    
    # Run HTTPS server
    cmd = [
        sys.executable, "manage.py", "runserver_plus",
        "--cert-file", cert_file,
        "--key-file", key_file,
        "127.0.0.1:8000"
    ]
    
    print("Starting HTTPS server at https://127.0.0.1:8000")
    print("Note: You may need to accept the self-signed certificate in your browser")
    
    try:
        subprocess.run(cmd)
    except KeyboardInterrupt:
        print("\nServer stopped")
    except FileNotFoundError:
        print("Django not found. Make sure you're in the correct directory and Django is installed.")

if __name__ == "__main__":
    run_https_server()