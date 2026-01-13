# Dockerfile for Arnova E-commerce (Next.js + Django)
FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV DJANGO_SETTINGS_MODULE=settings
ENV NODE_ENV=production

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

# Install Python dependencies
COPY ../requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY .. .

# Install Node.js dependencies and build frontend
RUN npm ci && npm run build

# Create directories and user
RUN mkdir -p staticfiles ssl && \
    adduser --disabled-password --gecos '' appuser && \
    chown -R appuser:appuser /app

USER appuser

# Collect static files
RUN python manage.py collectstatic --noinput || true

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
    CMD curl -f http://localhost:8000/ || exit 1

CMD ["python", "unified_server.py"]