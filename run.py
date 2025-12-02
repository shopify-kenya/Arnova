#!/usr/bin/env python3
"""
Complete workflow runner for Arnova Django + Next.js integration
"""
import os
import sys
import subprocess
import time
from pathlib import Path

def run_command(cmd, cwd=None):
    """Run a command and return success status"""
    try:
        result = subprocess.run(cmd, shell=True, cwd=cwd, check=True, 
                              capture_output=True, text=True)
        print(f"✅ {cmd}")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ {cmd}")
        print(f"Error: {e.stderr}")
        return False

def main():
    base_dir = Path(__file__).parent
    
    print("🚀 Starting Arnova App Workflow")
    print("=" * 50)
    
    # 1. Install Python dependencies
    print("\n📦 Installing Python dependencies...")
    if not run_command("pip install -r requirements.txt", base_dir):
        sys.exit(1)
    
    # 2. Install Node.js dependencies
    print("\n📦 Installing Node.js dependencies...")
    if not run_command("npm install", base_dir):
        sys.exit(1)
    
    # 3. Run Django migrations
    print("\n🗄️ Running Django migrations...")
    if not run_command("python manage.py migrate", base_dir):
        sys.exit(1)
    
    # 4. Build Next.js app
    print("\n🏗️ Building Next.js frontend...")
    if not run_command("npm run build", base_dir):
        sys.exit(1)
    
    # 5. Check if static files exist
    static_dir = base_dir / "static"
    index_file = static_dir / "index.html"
    
    if not index_file.exists():
        print("❌ Next.js build failed - index.html not found")
        sys.exit(1)
    
    print(f"✅ Frontend built successfully at {static_dir}")
    
    # 6. Start Django server
    print("\n🌐 Starting Django server...")
    print("=" * 50)
    print("🎉 Arnova is ready!")
    print("📱 Frontend: Served by Django")
    print("🔧 Backend: Django REST API")
    print("🌍 URL: http://127.0.0.1:8000")
    print("=" * 50)
    
    try:
        subprocess.run("python manage.py runserver", shell=True, cwd=base_dir)
    except KeyboardInterrupt:
        print("\n👋 Shutting down Arnova...")

if __name__ == "__main__":
    main()