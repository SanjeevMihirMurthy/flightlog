from fastapi import Depends, HTTPException, Request
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.services.auth_service import AuthService
from app.models.users import User


def get_current_user(request: Request, db: Session = Depends(get_db)) -> User:
    token = request.headers.get("Authorization", "").replace("Bearer ", "")
    user = AuthService.get_current_user(db, token)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return user
