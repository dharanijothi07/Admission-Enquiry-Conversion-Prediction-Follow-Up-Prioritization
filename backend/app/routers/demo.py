from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.config import get_settings
from app.database import get_db
from app.models import Enquiry
from app.services.seed import seed_demo_data

router = APIRouter(prefix="/demo", tags=["demo"])


@router.post("/seed")
def seed(reset: bool = Query(False), db: Session = Depends(get_db)):
    """Load ~90 fake enquiries. Disable in production with ENABLE_DEMO_ENDPOINTS=false."""
    if not get_settings().enable_demo_endpoints:
        raise HTTPException(status_code=403, detail="Demo endpoints are disabled")
    existing = db.scalar(select(func.count()).select_from(Enquiry)) or 0
    if existing and not reset:
        raise HTTPException(
            status_code=409,
            detail="Enquiries already exist. Use reset=true to replace them with demo data.",
        )
    return {"created": seed_demo_data(db, reset=reset)}
