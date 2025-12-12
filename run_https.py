#!/usr/bin/env python3
"""
Run Django server with HTTPS for PWA development
"""
import os
import subprocess
import sys

from generate_ssl import generate_ssl_cert


def run_https_server():
    """Run Django development server with HTTPS"""

    # Generate SSL certificates if needed
    cert_file, key_file = generate_ssl_cert()

    # Check if certificates exist
    if not os.path.exists(cert_file) or not os.path.exists(key_file):
        print("SSL certificates not found!")
        sys.exit(1)

    # Install required packages if not already installed
    try:
        import django_extensions  # noqa: F401
    except ImportError:
        print("Installing django-extensions for HTTPS support...")
        subprocess.run(
            [sys.executable, "-m", "pip", "install", "django-extensions"],
            check=True,
        )

    try:
        import werkzeug  # noqa: F401
    except ImportError:
        print("Installing Werkzeug for HTTPS support...")
        subprocess.run(
            [sys.executable, "-m", "pip", "install", "Werkzeug"],
            check=True,
        )

    # Update settings to include django-extensions
    settings_file = "settings.py"
    with open(settings_file, "r") as f:
        content = f.read()

    if "'django_extensions'," not in content:
        content = content.replace(
            "'shop',", "'shop',\n    'django_extensions',"
        )
        with open(settings_file, "w") as f:
            f.write(content)
        print("Added django_extensions to INSTALLED_APPS")

    # Try HTTPS server with django-extensions, fallback to HTTP
    try:
        cmd = [
            sys.executable,
            "manage.py",
            "runserver_plus",
            "--cert-file",
            cert_file,
            "--key-file",
            key_file,
            "127.0.0.1:8000",
        ]
        print("Starting HTTPS server at https://127.0.0.1:8000")
        print("Note: You may need to accept the self-signed certificate in your browser")
        subprocess.run(cmd)
    except (subprocess.CalledProcessError, FileNotFoundError):
        print("HTTPS server failed, starting HTTP server instead...")
        cmd = [sys.executable, "manage.py", "runserver", "127.0.0.1:8000"]
        subprocess.run(cmd)
    except KeyboardInterrupt:
        print("\nServer stopped")


if __name__ == "__main__":
    run_https_server()
