from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from ...core.database import get_db
from ...core.security import get_password_hash
from ...models.user import User
from ...models.enquiry import Enquiry
from ...schemas.user import UserCreate, UserUpdate, UserResponse
from ..deps import get_current_admin

router = APIRouter(prefix="/users", tags=["User & Staff Management"])

@router.get("", response_model=List[UserResponse])
def list_all_users(
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    """Admin-only endpoint: Lists all staff and counsellors with performance metrics."""
    users = db.query(User).all()
    results = []
    for u in users:
        active_count = db.query(Enquiry).filter(
            Enquiry.counsellor_id == u.id,
            Enquiry.status != "Converted",
            Enquiry.status != "Lost"
        ).count()
        converted_count = db.query(Enquiry).filter(
            Enquiry.counsellor_id == u.id,
            Enquiry.status == "Converted"
        ).count()
        total_assigned = db.query(Enquiry).filter(
            Enquiry.counsellor_id == u.id
        ).count()
        rate = (converted_count / total_assigned * 100.0) if total_assigned > 0 else 0.0

        item = UserResponse.model_validate(u)
        item.active_enquiries_count = active_count
        item.conversion_rate = round(rate, 1)
        results.append(item)
    return results

@router.post("", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def create_new_user(
    user_in: UserCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    """Admin-only endpoint: Provisions a new staff or counsellor account with bcrypt password."""
    email_clean = user_in.email.strip().lower()
    existing = db.query(User).filter(User.email == email_clean).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"User with email '{email_clean}' already exists"
        )
    
    new_user = User(
        email=email_clean,
        full_name=user_in.full_name,
        role=user_in.role,
        department=user_in.department,
        phone=user_in.phone,
        avatar_url=user_in.avatar_url,
        hashed_password=get_password_hash(user_in.password),
        is_active=True
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    resp = UserResponse.model_validate(new_user)
    resp.active_enquiries_count = 0
    resp.conversion_rate = 0.0
    return resp

@router.get("/{user_id}", response_model=UserResponse)
def get_user_by_id(
    user_id: str,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    """Admin-only endpoint: Retrieves a specific user profile by UUID."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    
    resp = UserResponse.model_validate(user)
    resp.active_enquiries_count = db.query(Enquiry).filter(Enquiry.counsellor_id == user.id).count()
    return resp

@router.put("/{user_id}", response_model=UserResponse)
def update_user_details(
    user_id: str,
    updates: UserUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    """Admin-only endpoint: Updates user credentials or department assignment."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    
    if updates.full_name is not None:
        user.full_name = updates.full_name
    if updates.email is not None:
        user.email = updates.email.strip().lower()
    if updates.department is not None:
        user.department = updates.department
    if updates.phone is not None:
        user.phone = updates.phone
    if updates.role is not None:
        user.role = updates.role
    if updates.is_active is not None:
        user.is_active = updates.is_active
    if updates.password:
        user.hashed_password = get_password_hash(updates.password)
    
    db.commit()
    db.refresh(user)
    return UserResponse.model_validate(user)
