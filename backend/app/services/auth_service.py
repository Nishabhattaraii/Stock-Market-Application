from typing import List, Optional
from sqlalchemy.orm import Session
from app.core.security import verify_password, get_password_hash, create_access_token
from app.core.exceptions import UnauthorizedException, BadRequestException, NotFoundException
from app.models.user import User
from app.schemas.auth import UserLogin, UserCreate, UserUpdate, Token, UserOut

class AuthService:
    def __init__(self, db: Session):
        self.db = db

    def authenticate_user(self, login_data: UserLogin) -> Token:
        user = self.db.query(User).filter(User.email == login_data.email).first()
        if not user or not verify_password(login_data.password, user.password_hash):
            raise UnauthorizedException("Incorrect email or password")
        if not user.is_active:
            raise BadRequestException("User account is disabled")

        access_token = create_access_token(subject=user.id, role=user.role)
        return Token(
            access_token=access_token,
            token_type="bearer",
            user=UserOut.model_validate(user)
        )

    def create_user(self, user_in: UserCreate) -> UserOut:
        existing = self.db.query(User).filter(User.email == user_in.email).first()
        if existing:
            raise BadRequestException("Email already registered")

        hashed_pwd = get_password_hash(user_in.password)
        user = User(
            name=user_in.name,
            email=user_in.email,
            password_hash=hashed_pwd,
            role=user_in.role,
            is_active=True
        )
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        return UserOut.model_validate(user)

    def get_users(self, skip: int = 0, limit: int = 50) -> List[UserOut]:
        users = self.db.query(User).offset(skip).limit(limit).all()
        return [UserOut.model_validate(u) for u in users]

    def update_user_status(self, user_id: int, is_active: bool) -> UserOut:
        user = self.db.query(User).filter(User.id == user_id).first()
        if not user:
            raise NotFoundException("User not found")
        user.is_active = is_active
        self.db.commit()
        self.db.refresh(user)
        return UserOut.model_validate(user)
