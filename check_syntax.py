#!/usr/bin/env python3
"""
Quick syntax check for Python files
"""
import ast
import sys
from pathlib import Path


def check_syntax(file_path):
    """Check Python syntax for a file"""
    try:
        with open(file_path, "r") as f:
            content = f.read()
        ast.parse(content)
        return True, None
    except SyntaxError as e:
        return False, str(e)
    except Exception as e:
        return False, str(e)


def main():
    """Check all Python files for syntax errors"""
    base_dir = Path(".")
    python_files = list(base_dir.rglob("*.py"))

    errors = []
    for file_path in python_files:
        if "migrations" in str(file_path) or "venv" in str(file_path):
            continue

        valid, error = check_syntax(file_path)
        if not valid:
            errors.append(f"{file_path}: {error}")

    if errors:
        print("Syntax errors found:")
        for error in errors:
            print(f"  {error}")
        sys.exit(1)
    else:
        print("All Python files have valid syntax!")


if __name__ == "__main__":
    main()
