"""FastAPI application entry point.  Run with:  uvicorn app.main:app --reload"""
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.ml.model import get_model
from app.routers import dashboard, demo, enquiries, health, predictions

logger = logging.getLogger("admissions")
settings = get_settings()


@asynccontextmanager
async def lifespan(_: FastAPI):
    try:
        get_model()  # loads the saved model, or trains a starter model if none exists
        logger.info("ML model ready")
    except Exception:  # keep the API up even if the model fails; /api/health still works
        logger.exception("Could not prepare the ML model")
    yield


app = FastAPI(
    title="Admission Enquiry Conversion API",
    description="Predicts which admission enquiries will convert and who to follow up first.",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

for r in (health.router, enquiries.router, predictions.router, dashboard.router, demo.router):
    app.include_router(r, prefix="/api")


@app.get("/", include_in_schema=False)
def root() -> dict:
    return {"message": "Admission Enquiry Conversion API", "docs": "/docs", "health": "/api/health"}
