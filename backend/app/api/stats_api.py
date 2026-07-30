from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.services.flights_service import FlightService
from app.services.stats_service import compute_stats, get_airports_by_iata
from app.schemas.stats import StatsResponse
from app.api.deps import get_current_user
from app.models.users import User

router = APIRouter(prefix="/stats", tags=["stats"])


@router.get("/me", response_model=StatsResponse)
def get_my_stats(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    flights = FlightService.get_flights(db, current_user.id)
    airports_by_iata = get_airports_by_iata(db, flights)
    return compute_stats(flights, airports_by_iata)
