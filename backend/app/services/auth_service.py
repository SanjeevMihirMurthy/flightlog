from sqlalchemy.orm import Session
from app.models.users import User
from ulid import ULID
from jose import jwt
from datetime import datetime, timedelta
import os

SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days

class AuthService:

    @staticmethod
    def get_or_create_user(db: Session, google_id: str, email: str, name: str, picture: str) -> User:
        user = db.query(User).filter(User.google_id == google_id).first()
        if not user:
            user = User(
                id=str(ULID()),
                google_id=google_id,
                email=email,
                name=name,
                picture=picture
            )
            db.add(user)
            db.commit()
            db.refresh(user)
        return user

    @staticmethod
    def create_access_token(user_id: str) -> str:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        payload = {
            "sub": user_id,
            "exp": expire
        }
        return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

    @staticmethod
    def verify_token(token: str) -> str | None:
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            return payload.get("sub")
        except Exception:
            return None

    @staticmethod
    def get_current_user(db: Session, token: str) -> User | None:
        user_id = AuthService.verify_token(token)
        if not user_id:
            return None
        return db.query(User).filter(User.id == user_id).first()