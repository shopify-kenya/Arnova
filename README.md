# Arnova - Premium Fashion E-commerce

A modern e-commerce platform built with Next.js and Django, featuring a glass morphism design and comprehensive shopping experience.

## Features

- Modern React/Next.js frontend with glass morphism design
- Django GraphQL backend (single endpoint)
- Multi-language support (English, Swahili)
- Progressive Web App (PWA) capabilities
- SSL/HTTPS support for development
- Responsive design for all devices
- Admin dashboard for product management
- Shopping cart and wishlist functionality
- User authentication and profiles

## Quick Start

```bash
# Clone the repository
git clone <repository-url>
cd Arnova

# Install dependencies
npm install
python -m venv .venv
. .venv/bin/activate
pip install -r requirements.txt

# Start unified server (builds frontend + runs backend)
python unified_server.py

# Optional: run local CI checks (lint, tests, build)
./scripts/ci_local.sh
```

**Unified Server Architecture:**

- Single server endpoint serves both frontend and backend
- Django handles GraphQL (`/graphql/`) and admin (`/admin/`)
- Next.js frontend integrated seamlessly
- JWT-based auth for GraphQL, plus session auth for admin

**Access Points:**

- Main App: <http://127.0.0.1:8000>
- HTTPS: <https://127.0.0.1:8443> (if SSL enabled)
- Admin Panel: <http://127.0.0.1:8000/admin/>
- GraphQL API: <http://127.0.0.1:8000/graphql/>

## Environment Variables

The app uses `.env` for local settings. See `.env.example` and
`.env.production.template` for full lists. Key variables:

- `SECRET_KEY` (required for Django)
- `DEBUG` (boolean)
- `JWT_SECRET` (defaults to `SECRET_KEY` if unset)
- `DATABASE_URL` (Postgres) or `NEON_DATABASE_URL` (optional)
- `GRAPHQL_GRAPHIQL` (set to `1` to enable GraphiQL in development)
- `NEXT_PUBLIC_API_URL` (optional; if unset, frontend uses same-origin `/graphql/`)

## Fonts

The UI uses Space Grotesk. Local font files are bundled under
`public/fonts/space-grotesk`, and the CSS loads them by default. A Google Fonts
fallback is also linked in `app/layout.tsx`.

## Local Postgres for CI Parity

To mirror CI locally:

```bash
docker compose -f docker-compose.ci.yml up -d
USE_POSTGRES=1 DATABASE_URL="postgres://postgres:postgres@localhost:5433/arnova_test" \
  ./scripts/ci_local.sh
```

## Documentation

- [Developer Guide](docs/DEVELOPER_GUIDE.md) - Technical documentation for developers
- [User Guide](docs/USER_GUIDE.md) - Comprehensive guide for end users
- [API Documentation](docs/API_DOCUMENTATION.md) - GraphQL API reference
- [Deployment Guide](docs/DEPLOYMENT.md) - Production deployment instructions

## Technology Stack

**Frontend:**

- Next.js 16 (webpack build for CI compatibility)
- React 19
- TypeScript
- Tailwind CSS
- Framer Motion

**Backend:**

- Django 5.2
- Strawberry GraphQL
- SQLite (development/tests)
- PostgreSQL (production)

**Features:**

- PWA support
- Multi-language (i18n)
- SSL/HTTPS
- Responsive design
- Admin dashboard

## License

This project is licensed under the MIT License.
