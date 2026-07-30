from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.services.auth_service import AuthService
from app.schemas.auth import TokenResponse, UserResponse
from app.api.deps import get_current_user
from app.models.users import User
from authlib.integrations.starlette_client import OAuth
from starlette.config import Config
import os

router = APIRouter(prefix="/auth", tags=["auth"])

config = Config()
oauth = OAuth(config)

oauth.register(
    name='google',
    client_id=os.getenv("GOOGLE_CLIENT_ID"),
    client_secret=os.getenv("GOOGLE_CLIENT_SECRET"),
    server_metadata_url='https://accounts.google.com/.well-known/openid-configuration',
    client_kwargs={'scope': 'openid email profile'}
)

FRONTEND_PORT = os.getenv("FRONTEND_PORT", "5173")

@router.get("/login")
async def login(request: Request):
    redirect_uri = str(request.base_url) + "auth/callback"
    return await oauth.google.authorize_redirect(request, redirect_uri)

@router.get("/callback")
async def callback(request: Request, db: Session = Depends(get_db)):
    try:
        token = await oauth.google.authorize_access_token(request)
        userinfo = token.get("userinfo")
        if not userinfo:
            raise HTTPException(status_code=400, detail="Failed to get user info")

        user = AuthService.get_or_create_user(
            db=db,
            google_id=userinfo["sub"],
            email=userinfo["email"],
            name=userinfo.get("name", ""),
            picture=userinfo.get("picture", "")
        )

        access_token = AuthService.create_access_token(user.id)
        frontend_url = os.getenv("FRONTEND_URL") or f"http://{request.url.hostname}:{FRONTEND_PORT}"
        return RedirectResponse(url=f"{frontend_url}/auth/callback?token={access_token}")

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user