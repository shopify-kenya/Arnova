#!/usr/bin/env bash
set -euo pipefail

# Local CI helper to mirror workflow checks.
# Assumes a local venv at .venv and npm deps installed.

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

if [[ ! -x .venv/bin/python ]]; then
  echo "ERROR: .venv not found. Create it first: python -m venv .venv" >&2
  exit 1
fi

if [[ ! -x .venv/bin/flake8 ]]; then
  echo "ERROR: flake8 not found in .venv. Install requirements.txt" >&2
  exit 1
fi

if [[ ! -x .venv/bin/black ]]; then
  echo "ERROR: black not found in .venv. Install requirements.txt" >&2
  exit 1
fi

if [[ ! -x .venv/bin/isort ]]; then
  echo "ERROR: isort not found in .venv. Install requirements.txt" >&2
  exit 1
fi

if ! command -v npm >/dev/null 2>&1; then
  echo "ERROR: npm not found." >&2
  exit 1
fi

echo "==> Python lint"
.venv/bin/flake8 . --exclude=migrations,venv,.venv,node_modules --max-line-length=88 --extend-ignore=E203 --jobs 1

echo "==> Python format check"
# Avoid long runtimes by checking tracked python files, excluding migrations
if command -v rg >/dev/null 2>&1; then
  PY_FILES="$(git ls-files "*.py" | rg -v "/migrations/")"
  if [[ -n "$PY_FILES" ]]; then
    echo "$PY_FILES" | xargs -n 10 .venv/bin/black --check
    echo "$PY_FILES" | xargs -n 10 .venv/bin/isort --check-only
  else
    echo "No tracked Python files to format-check."
  fi
else
  .venv/bin/black --check . --exclude "/(migrations|venv|.venv|node_modules)/"
  .venv/bin/isort --check-only . --skip=migrations --skip=venv --skip=.venv --skip=node_modules
fi

USE_POSTGRES=${USE_POSTGRES:-0}

if [[ "$USE_POSTGRES" == "1" ]]; then
  if [[ -z "${DATABASE_URL:-}" ]]; then
    echo "ERROR: DATABASE_URL must be set when USE_POSTGRES=1" >&2
    exit 1
  fi
  DB_ENV=(DATABASE_URL="$DATABASE_URL")
else
  DB_ENV=(DATABASE_URL="sqlite:///$ROOT_DIR/db.sqlite3")
fi

echo "==> Django migrations"
env "${DB_ENV[@]}" SECRET_KEY="test-secret-key" DEBUG=False \
  .venv/bin/python manage.py migrate

echo "==> Django tests"
env "${DB_ENV[@]}" SECRET_KEY="test-secret-key" DEBUG=False \
  .venv/bin/python manage.py test

echo "==> Next.js lint"
npm run lint

echo "==> Next.js build"
npm run build

echo "All checks passed."
