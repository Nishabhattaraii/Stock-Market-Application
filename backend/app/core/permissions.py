from typing import List, Callable
from fastapi import HTTPException, status, Depends
from app.dependencies import get_current_active_user
from app.models.user import User

def RoleChecker(allowed_roles: List[str]):
    def checker(current_user: User = Depends(get_current_active_user)):
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"User role '{current_user.role}' is not authorized to perform this operation. Required: {allowed_roles}"
            )
        return current_user
    return checker
