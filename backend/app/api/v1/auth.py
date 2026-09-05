from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.dependencies import get_db, get_current_active_user
from app.services.auth_service import AuthService
from app.schemas.auth import Token, UserLogin, UserOut, UserCreate
from app.models.user import User

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/login", response_model=Token)
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    auth_service = AuthService(db)
    return auth_service.authenticate_user(UserLogin(email=form_data.username, password=form_data.password))

@router.get("/me", response_model=UserOut)
def get_current_user_info(current_user: User = Depends(get_current_active_user)):
    return UserOut.model_validate(current_user)
