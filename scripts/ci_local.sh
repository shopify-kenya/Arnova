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
  git ls-files "*.py" | rg -v "/migrations/" | xargs .venv/bin/black --check
  git ls-files "*.py" | rg -v "/migrations/" | xargs .venv/bin/isort --check-only
else
  .venv/bin/black --check . --exclude "/(migrations|venv|.venv|node_modules)/"
  .venv/bin/isort --check-only . --skip=migrations --skip=venv --skip=.venv --skip=node_modules
fi

echo "==> Django migrations"
DATABASE_URL="sqlite:///$ROOT_DIR/db.sqlite3" SECRET_KEY="test-secret-key" DEBUG=False \
  .venv/bin/python manage.py migrate

echo "==> Django tests"
.venv/bin/python manage.py test

echo "==> Next.js lint"
npm run lint

echo "==> Next.js build"
npm run build

echo "All checks passed."
