#!/usr/bin/env python3
"""
Copy Next.js build files to Django static directory
"""
import os
import shutil
from pathlib import Path

def copy_nextjs_build():
    base_dir = Path(__file__).parent
    next_dir = base_dir / ".next"
    build_dir = base_dir / "build"

    # Create build directory
    build_dir.mkdir(exist_ok=True)

    # Copy static files
    next_static = next_dir / "static"
    if next_static.exists():
        build_static = build_dir / "_next" / "static"
        build_static.parent.mkdir(parents=True, exist_ok=True)
        if build_static.exists():
            shutil.rmtree(build_static)
        shutil.copytree(next_static, build_static)

    # Copy server files for SSG pages
    next_server = next_dir / "server" / "app"
    if next_server.exists():
        # Find index.html in the server output
        for root, dirs, files in os.walk(next_server):
            for file in files:
                if file == "index.html":
                    src = os.path.join(root, file)
                    dst = build_dir / "index.html"
                    shutil.copy2(src, dst)
                    print(f"Copied {src} to {dst}")
                    break

    print("Next.js build files copied to build directory")

if __name__ == "__main__":
    copy_nextjs_build()