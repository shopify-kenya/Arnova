#!/usr/bin/env python3
"""
Copy Next.js build files to Django static directory
"""
import os
import shutil
from pathlib import Path


def copy_nextjs_build():
    base_dir = Path(__file__).parent
    out_dir = base_dir / "out"  # Next.js export creates 'out' directory
    build_dir = base_dir / "build"

    if not out_dir.exists():
        print(
            "❌ Next.js 'out' directory not found. "
            "Make sure 'npm run build' completed successfully."
        )
        return

    # Create build directory and copy everything
    if build_dir.exists():
        shutil.rmtree(build_dir)
    shutil.copytree(out_dir, build_dir)

    print("✅ Next.js build files copied to build directory")


if __name__ == "__main__":
    copy_nextjs_build()
