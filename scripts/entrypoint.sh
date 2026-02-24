#!/bin/sh
set -e

echo "Waiting for database..."
until python - <<'PY'
import sys
import django
from django.db import connections
from django.db.utils import OperationalError

django.setup()
try:
    connections["default"].cursor()
    sys.exit(0)
except OperationalError:
    sys.exit(1)
PY
do
  echo "Database unavailable - sleeping"
  sleep 2
done

echo "Running migrations..."
python manage.py makemigrations --noinput || true
python manage.py migrate --noinput

exec "$@"
