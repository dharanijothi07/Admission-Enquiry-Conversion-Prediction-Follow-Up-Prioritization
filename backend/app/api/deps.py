from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from typing import Generator
from ..core.database import get_db
from ..core.security import decode_access_token
from ..models.user import User
from ..models.enquiry import Enquiry

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/token")

def get_current_user(
    db: Session = Depends(get_db),
    token: str = Depends(oauth2_scheme)
) -> User:
    """
    Validates JWT token from Authorization header and loads the authentic user record.
    Rejects expired or tampered signatures with HTTP 401.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials or token expired",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    payload = decode_access_token(token)
    if payload is None:
        raise credentials_exception
        
    user_id: str = payload.get("sub")
    if user_id is None:
        raise credentials_exception

    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise credentials_exception
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is deactivated"
        )
    return user

def get_current_admin(
    current_user: User = Depends(get_current_user)
) -> User:
    """Enforces admin/director role privilege. Rejects regular counsellors with HTTP 403."""
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin privileges required to perform this action"
        )
    return current_user

def verify_enquiry_access(
    enquiry_id: str,
    current_user: User,
    db: Session
) -> Enquiry:
    """
    Server-side permission guard:
    - Admins can access all enquiries.
    - Counsellors can only access leads assigned to them or unassigned leads.
    """
    enquiry = db.query(Enquiry).filter(Enquiry.id == enquiry_id).first()
    if not enquiry:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Enquiry with ID '{enquiry_id}' not found"
        )

    if current_user.role != "admin":
        if enquiry.counsellor_id is not None and enquiry.counsellor_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied: Counsellors can only view and manage leads assigned to them."
            )
    return enquiry
