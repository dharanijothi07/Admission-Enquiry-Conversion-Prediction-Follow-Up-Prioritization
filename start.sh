#!/usr/bin/env bash
# Render Start Script
set -e

if [ -d "backend" ]; then
  cd backend
fi

alembic upgrade head
exec uvicorn app.main:app --host 0.0.0.0 --port "${PORT:-8000}"
