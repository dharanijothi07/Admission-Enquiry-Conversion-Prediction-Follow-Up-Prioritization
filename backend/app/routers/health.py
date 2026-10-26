from fastapi import APIRouter
from sqlalchemy import text

from app.database import SessionLocal

router = APIRouter(tags=["health"])


@router.get("/health")
def health() -> dict:
    """Used by Render's health check and by the frontend's 'API status' badge."""
    db_status = "connected"
    try:
        with SessionLocal() as db:
            db.execute(text("SELECT 1"))
    except Exception:
        db_status = "unavailable"
    return {
        "status": "ok" if db_status == "connected" else "degraded",
        "service": "admission-conversion-api",
        "database": db_status,
    }
