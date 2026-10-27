import sys
from pathlib import Path

backend_dir = Path(__file__).resolve().parents[1] / "backend"
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

# Import the real FastAPI app from backend.app.main
from backend.app.main import app  # noqa: F401
