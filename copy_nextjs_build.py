#!/usr/bin/env python3
"""
Copy Next.js build files to Django static directory
"""
import shutil
from pathlib import Path


def copy_nextjs_build():
    base_dir = Path(__file__).parent
    out_dir = base_dir / "out"  # Next.js export creates 'out' directory
    build_dir = base_dir / "build"
    next_static = base_dir / ".next" / "static"

    if not out_dir.exists():
        # In modern Next.js builds (app router), output lives in .next/ not out/
        if (base_dir / ".next").exists():
            print(
                "INFO: Next.js 'out' directory not found. "
                "Using .next output directly; skipping copy."
            )
            return
        print(
            "❌ Next.js build output not found. "
            "Run 'npm run build' before starting the server."
        )
        return

    # Create build directory and copy everything
    if build_dir.exists():
        shutil.rmtree(build_dir)
    shutil.copytree(out_dir, build_dir)

    # Also copy .next/static if it exists for better compatibility
    if next_static.exists():
        next_build_static = build_dir / "_next" / "static"
        if next_build_static.exists():
            shutil.rmtree(next_build_static)
        shutil.copytree(next_static, next_build_static)

    print("✅ Next.js build files copied to build directory")


if __name__ == "__main__":
    copy_nextjs_build()
