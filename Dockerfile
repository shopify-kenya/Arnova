# Optimized Dockerfile for Arnova E-commerce (Next.js + Django)
FROM node:20-alpine AS frontend

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV DJANGO_SETTINGS_MODULE=settings

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    postgresql-client build-essential libpq-dev curl \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .
COPY --from=frontend /app/.next ./.next
COPY --from=frontend /app/public ./public

RUN mkdir -p staticfiles ssl && \
    python manage.py collectstatic --noinput && \
    adduser --disabled-password --gecos '' appuser && \
    chown -R appuser:appuser /app

USER appuser
EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
    CMD curl -f http://localhost:8000/ || exit 1

CMD ["python", "unified_server.py"]