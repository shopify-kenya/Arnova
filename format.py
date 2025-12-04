#!/usr/bin/env python3
"""
Format all Python files in the project
"""
import subprocess
import sys
from pathlib import Path


def format_python_files():
    """Format Python files using autopep8 (built-in alternative)"""
    base_dir = Path(__file__).parent
    python_files = [f for f in base_dir.rglob(
        "*.py") if not str(f).startswith(".")]

    if not python_files:
        print("No Python files found")
        return True

    print(f"Formatting {len(python_files)} Python files...")

    # Basic formatting using autopep8 if available
    try:
        subprocess.run(
            ["python3", "-m", "autopep8", "--in-place", "--recursive", "."],
            cwd=base_dir,
            check=True,
        )
        print("Python formatting completed")
        return True
    except (subprocess.CalledProcessError, FileNotFoundError):
        print("autopep8 not found, skipping Python formatting")
        return True


def format_js_files():
    """Format JavaScript/TypeScript files using prettier"""
    base_dir = Path(__file__).parent

    # Check if prettier is available
    try:
        subprocess.run(
            ["npx", "prettier", "--version"],
            cwd=base_dir,
            check=True,
            capture_output=True,
        )
    except (subprocess.CalledProcessError, FileNotFoundError):
        print("Prettier not found, skipping JS/TS formatting")
        return True

    # Format JS/TS files
    try:
        subprocess.run(
            ["npx", "prettier", "--write", "**/*.{js,jsx,ts,tsx,json,css,md}"],
            cwd=base_dir,
            check=True,
        )
        print("Prettier formatting completed")
        return True
    except subprocess.CalledProcessError:
        print("Prettier formatting failed")
        return False


def main():
    """Main formatting function"""
    print("Formatting all files...")
    print("=" * 30)

    success = True

    # Format Python files
    if not format_python_files():
        success = False

    # Format JS/TS files
    if not format_js_files():
        success = False

    print("=" * 30)
    if success:
        print("All files formatted successfully")
    else:
        print("Some formatting operations failed")
        sys.exit(1)


if __name__ == "__main__":
    main()
