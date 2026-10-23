from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
from .core.config import settings
from .core.database import Base, engine
from .api.v1.router import api_router
from .models import *  # Ensure all models are loaded

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Auto-create tables on startup (especially helpful for dev/test SQLite or local setups)
    try:
        Base.metadata.create_all(bind=engine)
    except Exception as e:
        print(f"Database table sync note: {e}")
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    version="1.0.0",
    description="Backend API for Admission Enquiry Conversion Prediction & Prioritization System",
    lifespan=lifespan
)

# Safe CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Include API v1 Router
app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/", tags=["Health"])
def root_check():
    return {
        "status": "online",
        "service": settings.PROJECT_NAME,
        "environment": settings.ENVIRONMENT,
        "api_docs": "/docs"
    }

@app.get("/health", tags=["Health"])
def health_check():
    return {
        "status": "healthy",
        "timestamp": settings.PROJECT_NAME
    }
