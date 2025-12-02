#!/usr/bin/env python3
"""
Quick start script for Arnova - skips dependency installation
"""
import os
import sys
import subprocess
from pathlib import Path

def main():
    base_dir = Path(__file__).parent
    
    print("🚀 Quick Starting Arnova")
    print("=" * 30)
    
    # 1. Build Next.js app
    print("\n🏗️ Building Next.js frontend...")
    try:
        result = subprocess.run("npm run build", shell=True, cwd=base_dir, check=True)
        print("✅ Frontend built successfully")
    except subprocess.CalledProcessError:
        print("❌ Frontend build failed")
        sys.exit(1)
    
    # 2. Check if build files exist
    build_dir = base_dir / "build"
    index_file = build_dir / "index.html"
    
    if not index_file.exists():
        print("❌ Build files not found")
        sys.exit(1)
    
    # 3. Start Django server
    print("\n🌐 Starting Django server...")
    print("=" * 30)
    print("🎉 Arnova is ready!")
    print("🌍 URL: http://127.0.0.1:8000")
    print("=" * 30)
    
    try:
        subprocess.run("python manage.py runserver", shell=True, cwd=base_dir)
    except KeyboardInterrupt:
        print("\n👋 Shutting down Arnova...")

if __name__ == "__main__":
    main()