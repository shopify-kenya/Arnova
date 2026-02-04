# Unified Server Guide

Arnova runs in unified mode by default (`python unified_server.py`). Django serves the GraphQL API and the prebuilt Next.js frontend from the same origin.

## Key Routes

- `/` Next.js frontend
- `/graphql/` GraphQL API endpoint
- `/admin/` Custom admin dashboard (Django templates)
- `/django-admin/` Django admin site

## Example GraphQL Call

```js
const response = await fetch('/graphql/', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${accessToken}`,
  },
  body: JSON.stringify({
    query: `query { products { id name price } }`
  })
})
```

## Notes

- REST endpoints under `/api/*` have been removed.
- Admin templates can authenticate via Django session; frontend uses JWT.
