# Unified Server Architecture

Arnova can run in a **unified mode** where Django serves both the API and the
prebuilt Next.js frontend from a single port. This is the default local workflow
when running `python unified_server.py`.

## Build & Startup Flow

`unified_server.py` performs these steps:

1. Build the Next.js frontend: `npm run build`
2. Copy build output into Django static dirs: `copy_nextjs_build.py`
3. Run migrations: `python manage.py migrate`
4. Generate PWA assets: `python generate_pwa_assets.py`
5. Start Django:
   - HTTP on `127.0.0.1:8000`
   - HTTPS on `127.0.0.1:8443` if `ssl/cert.pem` + `ssl/key.pem` exist

## URL Routing (Actual Priority)

Routes are defined in `urls.py`:

1. **Custom Admin (Django templates)**: `/admin/*`
2. **Django Admin Site**: `/django-admin/`
3. **API**: `/api/*`
4. **Next.js static assets**: `/_next/*`
5. **Service worker / manifest**: `/service-worker.js`, `/manifest.json`
6. **Public assets**: `/public/*` via direct file serving
7. **Catch-all**: all remaining routes serve the Next.js app (`views.index`)

## Request Flow

- **Admin users** access `/admin/*` (custom dashboard) or `/django-admin/`.
- **Buyers** use all other routes which are served by the Next.js build.
- **API calls** are handled by Django under `/api/*`.

## SSL Notes

If SSL certificates exist in `ssl/`, the unified server starts both HTTP and
HTTPS via `runserver_plus`. Run `python generate_ssl.py` to create local certs.
