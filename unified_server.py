#!/usr/bin/env python3
"""
Unified Server for Arnova E-commerce
Builds Next.js frontend and serves both frontend and backend from Django
Supports both HTTP and HTTPS with SSL certificates
"""
import subprocess
import sys
from pathlib import Path


def check_ssl_certificates():
    """Check if SSL certificates exist"""
    cert_file = Path("ssl/cert.pem")
    key_file = Path("ssl/key.pem")
    return cert_file.exists() and key_file.exists()


def run_unified_server():
    """Build Next.js and run unified Django server"""
    base_dir = Path(__file__).parent

    print("🚀 Starting Arnova Unified Server...")

    # Build Next.js frontend
    print("📦 Building Next.js frontend...")
    try:
        subprocess.run(["npm", "run", "build"], check=True, cwd=base_dir)
        print("✅ Next.js build completed")
    except subprocess.CalledProcessError:
        print("❌ Next.js build failed")
        sys.exit(1)

    # Copy Next.js build files
    print("📁 Copying build files...")
    try:
        subprocess.run(
            [sys.executable, "copy_nextjs_build.py"], check=True, cwd=base_dir
        )
        print("✅ Build files copied")
    except subprocess.CalledProcessError:
        print("❌ Failed to copy build files")
        sys.exit(1)

    # Run Django migrations
    print("🗄️  Running database migrations...")
    try:
        subprocess.run(
            [sys.executable, "manage.py", "migrate"], check=True, cwd=base_dir
        )
        print("✅ Migrations completed")
    except subprocess.CalledProcessError:
        print("⚠️  Migrations failed, continuing...")

    # Check for SSL certificates and start appropriate server
    has_ssl = check_ssl_certificates()

    if has_ssl:
        print("🔒 SSL certificates found, starting HTTPS server...")
        print("📍 Server will be available at:")
        print("   • Main App: https://127.0.0.1:8443")
        print("   • Admin Panel: https://127.0.0.1:8443/admin/")
        print("   • API Endpoints: https://127.0.0.1:8443/api/")
        print("\n🔧 Press Ctrl+C to stop the server")

        try:
            # Install django-extensions if not available
            try:
                import django_extensions  # noqa: F401
            except ImportError:
                print("📦 Installing django-extensions for HTTPS support...")
                subprocess.run(
                    [
                        sys.executable,
                        "-m",
                        "pip",
                        "install",
                        "django-extensions",
                    ],
                    check=True,
                )

            # Start HTTPS server
            subprocess.run(
                [
                    sys.executable,
                    "manage.py",
                    "runserver_plus",
                    "--cert-file",
                    "ssl/cert.pem",
                    "--key-file",
                    "ssl/key.pem",
                    "127.0.0.1:8443",
                ],
                cwd=base_dir,
            )
        except (subprocess.CalledProcessError, FileNotFoundError):
            print("⚠️  HTTPS server failed, falling back to HTTP...")
            start_http_server(base_dir)
    else:
        print("🔓 No SSL certificates found, starting HTTP server...")
        print(
            "💡 Run 'python generate_ssl.py' to generate SSL certificates for HTTPS"
        )
        start_http_server(base_dir)


def start_http_server(base_dir):
    """Start HTTP server"""
    print("📍 Server will be available at:")
    print("   • Main App: http://127.0.0.1:8000")
    print("   • Admin Panel: http://127.0.0.1:8000/admin/")
    print("   • API Endpoints: http://127.0.0.1:8000/api/")
    print("\n🔧 Press Ctrl+C to stop the server")

    try:
        subprocess.run(
            [sys.executable, "manage.py", "runserver", "127.0.0.1:8000"],
            cwd=base_dir,
        )
    except KeyboardInterrupt:
        print("\n🛑 Server stopped")


if __name__ == "__main__":
    try:
        run_unified_server()
    except KeyboardInterrupt:
        print("\n🛑 Server stopped")
