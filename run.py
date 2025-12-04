#!/usr/bin/env python3
"""
Complete workflow runner for Arnova Django + Next.js integration
"""
import os
import subprocess
import sys
from pathlib import Path


def run_command(cmd, cwd=None, use_venv=False):
    """Run a command and return success status"""
    try:
        if use_venv and os.path.exists("venv/bin/activate"):
            cmd = f"source venv/bin/activate && {cmd}"
        subprocess.run(
            cmd,
            shell=True,
            cwd=cwd,
            check=True,
            capture_output=True,
            text=True,
        )
        print(f"✅ {cmd}")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ {cmd}")
        if e.stderr:
            print(f"Error: {e.stderr}")
        return False


def main():
    base_dir = Path(__file__).parent

    print("🚀 Starting Arnova App Workflow")
    print("=" * 50)

    # 1. Check/create virtual environment
    venv_path = base_dir / "venv"
    if not venv_path.exists():
        print("\n🔧 Creating virtual environment...")
        if not run_command("python3 -m venv venv", base_dir):
            sys.exit(1)

    # 2. Install Python dependencies
    print("\n📦 Installing Python dependencies...")
    cmd = "pip install -r requirements.txt"
    if not run_command(cmd, base_dir, use_venv=True):
        print("⚠️  Skipping Python dependencies (may already be installed)")

    # 3. Install Node.js dependencies
    print("\n📦 Installing Node.js dependencies...")
    if not run_command("npm install", base_dir):
        print("⚠️  Skipping npm install (may already be installed)")

    # 4. Run Django migrations
    print("\n🗄️ Running Django migrations...")
    cmd = "python manage.py migrate"
    if not run_command(cmd, base_dir, use_venv=True):
        print("⚠️  Skipping migrations (may already be applied)")

    # 5. Clean and build Next.js app
    print("\n🧹 Cleaning build cache...")
    run_command("rm -rf build .next", base_dir)

    print("\n🏗️ Building Next.js frontend...")
    if not run_command("npm run build", base_dir):
        print("❌ Frontend build failed")
        sys.exit(1)

    # 6. Check if build files exist
    build_dir = base_dir / "build"
    index_file = build_dir / "index.html"

    if not index_file.exists():
        print("❌ Next.js build failed - index.html not found")
        sys.exit(1)

    print(f"✅ Frontend built successfully at {build_dir}")

    # 7. Start Django server
    print("\n🌐 Starting Django server...")
    print("=" * 50)
    print("🎉 Arnova is ready!")
    print("📱 Frontend: Served by Django")
    print("🔧 Backend: Django REST API")
    print("🌍 URL: http://127.0.0.1:8000")
    print("=" * 50)

    try:
        if os.path.exists("venv/bin/activate"):
            subprocess.run(
                "source venv/bin/activate && python manage.py runserver",
                shell=True,
                cwd=base_dir,
            )
        else:
            subprocess.run("python manage.py runserver", shell=True, cwd=base_dir)
    except KeyboardInterrupt:
        print("\n👋 Shutting down Arnova...")


if __name__ == "__main__":
    main()
