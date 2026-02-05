# Dockerfile for Arnova E-commerce (Next.js + Django)
FROM python:3.13-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV DJANGO_SETTINGS_MODULE=settings
ENV NEXT_TELEMETRY_DISABLED=1

WORKDIR /app

# Install system dependencies including Node.js
RUN apt-get update && apt-get install -y --no-install-recommends \
    postgresql-client build-essential libpq-dev curl \
    ca-certificates gnupg \
    && mkdir -p /etc/apt/keyrings \
    && curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg \
    && echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_20.x nodistro main" | tee /etc/apt/sources.list.d/nodesource.list \
    && apt-get update && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

# Copy package files first for better caching
COPY ../package*.json ./

# Install Node.js dependencies (include dev deps for build tooling)
RUN npm ci --include=dev --legacy-peer-deps

# Copy application code
COPY .. .

# Build Next.js frontend
RUN npm run build

# Set runtime environment after build
ENV NODE_ENV=production

# Install Python dependencies
RUN python -m pip install --upgrade pip && \
    pip install -r requirements.txt

# Create directories and user
RUN mkdir -p staticfiles ssl && \
    adduser --disabled-password --gecos '' appuser && \
    chown -R appuser:appuser /app

USER appuser

# Migrations and collectstatic should run at deploy/runtime, not build time.

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
    CMD curl -f http://localhost:8000/ || exit 1

CMD ["gunicorn", "wsgi:application"]
