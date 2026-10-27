import sys
from pathlib import Path

backend_dir = Path(__file__).resolve().parents[1] / "backend"
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

backend_app_dir = backend_dir / "app"
if str(backend_app_dir) not in __path__:
    __path__.append(str(backend_app_dir))
