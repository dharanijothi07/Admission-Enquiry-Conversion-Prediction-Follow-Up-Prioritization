from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from typing import Union
from ...core.database import get_db
from ...core.security import verify_password, create_access_token
from ...models.user import User
from ...schemas.auth import Token, LoginRequest
from ...schemas.user import UserResponse
from ..deps import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/login", response_model=Token)
def login_for_access_token(
    login_data: LoginRequest,
    db: Session = Depends(get_db)
):
    """Authenticates user using JSON payload. Returns standard signed JWT bearer token."""
    email = login_data.email.strip().lower()
    password = login_data.password

    user = db.query(User).filter(User.email == email).first()
    if not user or not verify_password(password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is inactive"
        )

    access_token = create_access_token(subject=user.id, role=user.role)
    return Token(
        access_token=access_token,
        token_type="bearer",
        user_id=user.id,
        email=user.email,
        role=user.role,
        full_name=user.full_name
    )

@router.post("/token", response_model=Token, include_in_schema=False)
def login_oauth2_form(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    """OAuth2 password flow form handler for Swagger UI Authorize dialog."""
    email = form_data.username.strip().lower()
    password = form_data.password

    user = db.query(User).filter(User.email == email).first()
    if not user or not verify_password(password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is inactive"
        )

    access_token = create_access_token(subject=user.id, role=user.role)
    return Token(
        access_token=access_token,
        token_type="bearer",
        user_id=user.id,
        email=user.email,
        role=user.role,
        full_name=user.full_name
    )

@router.get("/me", response_model=UserResponse)
def read_current_user_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Returns currently authenticated user profile with active lead statistics."""
    # Compute active enquiries count
    from ...models.enquiry import Enquiry
    active_count = db.query(Enquiry).filter(
        Enquiry.counsellor_id == current_user.id,
        Enquiry.status != "Converted",
        Enquiry.status != "Lost"
    ).count()

    converted_count = db.query(Enquiry).filter(
        Enquiry.counsellor_id == current_user.id,
        Enquiry.status == "Converted"
    ).count()

    total_assigned = db.query(Enquiry).filter(
        Enquiry.counsellor_id == current_user.id
    ).count()

    rate = (converted_count / total_assigned * 100.0) if total_assigned > 0 else 0.0

    resp = UserResponse.model_validate(current_user)
    resp.active_enquiries_count = active_count
    resp.conversion_rate = round(rate, 1)
    return resp
