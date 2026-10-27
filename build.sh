#!/usr/bin/env bash
# Render Build Script
set -e

if [ -d "backend" ]; then
  cd backend
fi

pip install -r requirements.txt
python -m app.ml.train
