#!/usr/bin/env python3
"""
Unified Server for Arnova E-commerce
Builds Next.js frontend and serves both frontend and backend from Django
Supports both HTTP and HTTPS with SSL certificates
"""
import os
import subprocess
import sys
from pathlib import Path

# Set Django settings module
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "settings")


def check_ssl_certificates():
    """Check if SSL certificates exist"""
    cert_file = Path("ssl/cert.pem")
    key_file = Path("ssl/key.pem")
    return cert_file.exists() and key_file.exists()


def run_unified_server():
    """Build Next.js and run unified Django server"""
    base_dir = Path(__file__).parent

    print("🚀 Starting Arnova Unified Server...")

    if os.environ.get("ARNOVA_FORCE_SQLITE") == "1":
        os.environ["POSTGRES_URL"] = f"sqlite:///{base_dir / 'db.sqlite3'}"
        os.environ.setdefault("DEBUG", "1")

    build_success = True

    # Build Next.js frontend
    if os.environ.get("ARNOVA_SKIP_BUILD") == "1":
        build_success = False
        print("⏭️  Skipping Next.js build (ARNOVA_SKIP_BUILD=1)")
    else:
        print("📦 Building Next.js frontend...")
        try:
            env = os.environ.copy()
            subprocess.run(["npm", "run", "build"], check=True, cwd=base_dir, env=env)
            print("✅ Next.js build completed")
        except subprocess.CalledProcessError:
            build_success = False
            print("⚠️  Next.js build failed; continuing with API-only mode")

    # Copy Next.js build files
    if build_success:
        print("📁 Copying build files...")
        try:
            subprocess.run(
                [sys.executable, "copy_nextjs_build.py"], check=True, cwd=base_dir
            )
            print("✅ Build files copied")
        except subprocess.CalledProcessError:
            print("⚠️  Failed to copy build files; continuing...")

    # Run Django migrations
    if os.environ.get("ARNOVA_SKIP_MIGRATIONS") != "1":
        print("🗄️  Running database migrations...")
        try:
            subprocess.run(
                [sys.executable, "manage.py", "migrate"], check=True, cwd=base_dir
            )
            print("✅ Migrations completed")
        except subprocess.CalledProcessError:
            print("⚠️  Migrations failed, continuing...")

    # Generate PWA assets
    if os.environ.get("ARNOVA_SKIP_PWA") != "1":
        print("🎨 Generating PWA assets...")
        try:
            subprocess.run(
                [sys.executable, "generate_pwa_assets.py"], check=True, cwd=base_dir
            )
        except subprocess.CalledProcessError:
            print("⚠️  PWA asset generation failed, continuing...")

    # Check for SSL certificates and start both HTTP and HTTPS servers
    has_ssl = check_ssl_certificates()
    force_http_only = os.environ.get("ARNOVA_HTTP_ONLY") == "1"

    if has_ssl and not force_http_only:
        print("🔒 SSL certificates found, starting both HTTP and HTTPS servers...")
        print("📍 Servers will be available at:")
        print("   • HTTP - Main App: http://127.0.0.1:8000")
        print("   • HTTPS - Main App: https://127.0.0.1:8443")
        print(
            "   • Admin Panel: http://127.0.0.1:8000/admin/ or "
            "https://127.0.0.1:8443/admin/"
        )
        print(
            "   • GraphQL API: http://127.0.0.1:8000/graphql/ or "
            "https://127.0.0.1:8443/graphql/"
        )
        print("\n🔧 Press Ctrl+C to stop the servers")

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

            # Start both servers concurrently
            start_dual_servers(base_dir)
        except (subprocess.CalledProcessError, FileNotFoundError):
            print("⚠️  HTTPS server failed, falling back to HTTP only...")
            start_http_server(base_dir)
    else:
        print("🔓 No SSL certificates found, starting HTTP server only...")
        print(
            "💡 Run 'python generate_ssl.py' to generate SSL certificates " "for HTTPS"
        )
        start_http_server(base_dir)


def start_http_server(base_dir):
    """Start HTTP server"""
    print("📍 Server will be available at:")
    print("   • Main App: http://127.0.0.1:8000")
    print("   • Admin Panel: http://127.0.0.1:8000/admin/")
    print("   • GraphQL API: http://127.0.0.1:8000/graphql/")
    print("\n🔧 Press Ctrl+C to stop the server")

    try:
        env = os.environ.copy()
        env["DJANGO_SETTINGS_MODULE"] = "settings"
        if os.environ.get("ARNOVA_FORCE_SQLITE") == "1":
            env["POSTGRES_URL"] = f"sqlite:///{base_dir / 'db.sqlite3'}"
        args = [sys.executable, "manage.py", "runserver", "127.0.0.1:8000"]
        if os.environ.get("ARNOVA_NO_RELOAD") == "1":
            args.append("--noreload")
        subprocess.run(args, cwd=base_dir, env=env)
    except KeyboardInterrupt:
        print("\n🛑 Server stopped")


def start_dual_servers(base_dir):
    """Start both HTTP and HTTPS servers concurrently"""
    import threading
    import time

    def run_http():
        try:
            env = os.environ.copy()
            env["DJANGO_SETTINGS_MODULE"] = "settings"
            if os.environ.get("ARNOVA_FORCE_SQLITE") == "1":
                env["POSTGRES_URL"] = f"sqlite:///{base_dir / 'db.sqlite3'}"
            args = [sys.executable, "manage.py", "runserver", "127.0.0.1:8000"]
            if os.environ.get("ARNOVA_NO_RELOAD") == "1":
                args.append("--noreload")
            subprocess.run(args, cwd=base_dir, env=env)
        except KeyboardInterrupt:
            pass

    def run_https():
        try:
            env = os.environ.copy()
            env["DJANGO_SETTINGS_MODULE"] = "settings"
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
                env=env,
            )
        except KeyboardInterrupt:
            pass

    # Start HTTP server in a separate thread
    http_thread = threading.Thread(target=run_http, daemon=True)
    http_thread.start()

    # Give HTTP server time to start
    time.sleep(2)

    # Start HTTPS server in main thread
    try:
        run_https()
    except KeyboardInterrupt:
        print("\n🛑 Servers stopped")


if __name__ == "__main__":
    try:
        run_unified_server()
    except KeyboardInterrupt:
        print("\n🛑 Server stopped")
