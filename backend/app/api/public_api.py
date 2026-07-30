from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.db.session import get_db
from app.models.users import User
from app.services.flights_service import FlightService
from app.services.stats_service import compute_stats, get_airports_by_iata
from app.schemas.public import PublicProfile, PublicFlight
from app.schemas.stats import StatsResponse

router = APIRouter(prefix="/public", tags=["public"])


def _get_user_or_404(db: Session, user_id: str) -> User:
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.get("/{user_id}/profile", response_model=PublicProfile)
def get_public_profile(user_id: str, db: Session = Depends(get_db)):
    return _get_user_or_404(db, user_id)


@router.get("/{user_id}/flights", response_model=List[PublicFlight])
def get_public_flights(user_id: str, db: Session = Depends(get_db)):
    _get_user_or_404(db, user_id)
    return FlightService.get_flights(db, user_id)


@router.get("/{user_id}/stats", response_model=StatsResponse)
def get_public_stats(user_id: str, db: Session = Depends(get_db)):
    _get_user_or_404(db, user_id)
    flights = FlightService.get_flights(db, user_id)
    airports_by_iata = get_airports_by_iata(db, flights)
    return compute_stats(flights, airports_by_iata)
