"""
Root FastAPI Application Proxy
==============================
Enables 'uvicorn app.main:app' to work cleanly when executed directly
from the root directory of the repository on hosting platforms like Render.
"""

import os
import sys

# Ensure backend directory is in python search path
root_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.abspath(os.path.join(root_dir, "..", "backend"))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

# Import the actual FastAPI application from backend/app/main.py
from app.main import app
