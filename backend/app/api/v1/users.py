from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.dependencies import get_db, get_current_active_user
from app.core.permissions import RoleChecker
from app.services.auth_service import AuthService
from app.schemas.auth import UserOut, UserCreate

router = APIRouter(prefix="/users", tags=["Users"])

from pydantic import BaseModel

class UserStatusUpdate(BaseModel):
    is_active: bool

@router.get("", response_model=List[UserOut])
def list_users(skip: int = 0, limit: int = 50, db: Session = Depends(get_db), current_user = Depends(RoleChecker(["Admin"]))):
    service = AuthService(db)
    return service.get_users(skip=skip, limit=limit)

@router.post("", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def create_user(user_in: UserCreate, db: Session = Depends(get_db), current_user = Depends(RoleChecker(["Admin"]))):
    service = AuthService(db)
    return service.create_user(user_in)

@router.patch("/{user_id}/status", response_model=UserOut)
def update_user_status(user_id: int, status_in: UserStatusUpdate, db: Session = Depends(get_db), current_user = Depends(RoleChecker(["Admin"]))):
    service = AuthService(db)
    return service.update_user_status(user_id, status_in.is_active)
