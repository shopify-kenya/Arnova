"""
This file serves as a compatibility layer for deployment environments like Render
that default to running `gunicorn app:app`.

This project's main WSGI application is defined in `backend/wsgi.py`. This script
imports that application and exposes it as a module-level variable named `app`,
allowing gunicorn to find it.
"""

from backend.wsgi import application as app  # noqa: F401
