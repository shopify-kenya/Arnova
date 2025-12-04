#!/usr/bin/env python3
"""
Quick start script for Arnova - skips dependency installation
"""
import json
import os
import subprocess
import sys
from pathlib import Path


def generate_ssl_certificates(base_dir):
    """Generate SSL certificates for HTTPS development"""
    print("\nGenerating SSL certificates...")
    ssl_dir = base_dir / "ssl"
    ssl_dir.mkdir(exist_ok=True)

    cert_file = ssl_dir / "cert.pem"
    key_file = ssl_dir / "key.pem"

    if cert_file.exists() and key_file.exists():
        print("SSL certificates already exist")
        return True

    cmd = [
        "openssl",
        "req",
        "-x509",
        "-newkey",
        "rsa:4096",
        "-keyout",
        str(key_file),
        "-out",
        str(cert_file),
        "-days",
        "365",
        "-nodes",
        "-subj",
        "/C=US/ST=State/L=City/O=Arnova/CN=localhost",
    ]

    try:
        subprocess.run(cmd, check=True, capture_output=True)
        print("SSL certificates generated successfully")
        return True
    except subprocess.CalledProcessError:
        print("SSL certificate generation failed (OpenSSL not found)")
        return False
    except FileNotFoundError:
        print("OpenSSL not found - SSL certificates skipped")
        return False


def generate_pwa_assets(base_dir):
    """Generate and validate PWA assets using dedicated script"""
    print("\nGenerating PWA assets...")
    try:
        result = subprocess.run(
            "python generate_pwa_assets.py",
            shell=True,
            cwd=base_dir,
            check=True,
            capture_output=True,
            text=True,
        )
        print(result.stdout)
        return True
    except subprocess.CalledProcessError as e:
        print(f"PWA assets generation failed: {e.stderr}")
        return False


def run_migrations(base_dir):
    """Run Django migrations"""
    print("\nRunning database migrations...")
    try:
        subprocess.run(
            "python manage.py makemigrations",
            shell=True,
            cwd=base_dir,
            check=True,
            capture_output=True,
        )
        subprocess.run(
            "python manage.py migrate",
            shell=True,
            cwd=base_dir,
            check=True,
            capture_output=True,
        )
        print("Database migrations completed")
        return True
    except subprocess.CalledProcessError:
        print("Database migrations failed")
        return False


def main():
    base_dir = Path(__file__).parent

    print("Quick Starting Arnova")
    print("=" * 30)

    # 1. Generate SSL certificates
    ssl_enabled = generate_ssl_certificates(base_dir)

    # 2. Generate PWA assets
    generate_pwa_assets(base_dir)

    # 3. Run database migrations
    run_migrations(base_dir)

    # 4. Clean and build Next.js app
    print("\nCleaning build cache...")
    subprocess.run("rm -rf build .next", shell=True, cwd=base_dir)

    print("\nBuilding Next.js frontend...")
    try:
        result = subprocess.run("npm run build", shell=True, cwd=base_dir, check=True)
        print("Frontend built successfully")
    except subprocess.CalledProcessError:
        print("Frontend build failed")
        sys.exit(1)

    # 5. Check if build files exist
    build_dir = base_dir / "build"
    index_file = build_dir / "index.html"

    if not index_file.exists():
        print("Build files not found")
        sys.exit(1)

    # 6. Start Django server
    print("\nStarting Django server...")
    print("=" * 30)
    print("Arnova is ready!")
    print("HTTP URL: http://127.0.0.1:8000")
    if ssl_enabled:
        print("HTTPS URL: https://127.0.0.1:8443")
    print("PWA features enabled")
    print("=" * 30)

    try:
        if ssl_enabled:
            subprocess.run("python run_https.py", shell=True, cwd=base_dir)
        else:
            subprocess.run("python manage.py runserver", shell=True, cwd=base_dir)
    except KeyboardInterrupt:
        print("\nShutting down Arnova...")


if __name__ == "__main__":
    main()
