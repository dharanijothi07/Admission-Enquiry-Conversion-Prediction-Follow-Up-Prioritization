from fastapi import APIRouter
from .auth import router as auth_router
from .users import router as users_router
from .enquiries import router as enquiries_router
from .interactions import router as interactions_router
from .followups import router as followups_router
from .predictions import router as predictions_router
from .analytics import router as analytics_router
from .ml import router as ml_router

api_router = APIRouter()

api_router.include_router(auth_router)
api_router.include_router(users_router)
api_router.include_router(enquiries_router)
api_router.include_router(interactions_router)
api_router.include_router(followups_router)
api_router.include_router(predictions_router)
api_router.include_router(analytics_router)
api_router.include_router(ml_router)
