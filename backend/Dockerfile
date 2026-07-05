FROM python:3.12-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq-dev gcc \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

ENV PORT=8001
EXPOSE 8001

# Run migrations then start API (use Postgres DATABASE_URL in production)
CMD alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port ${PORT}
