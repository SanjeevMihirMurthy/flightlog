from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.schemas.flight import FlightCreate, FlightResponse
from app.services.flights_service import FlightService
from app.api.deps import get_current_user
from app.models.users import User
from typing import List

router = APIRouter(prefix="/flights", tags=["flights"])

@router.post("/add-flight", response_model=FlightResponse)
def create_flight(flight: FlightCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return FlightService.create_flight(db, flight, current_user.id)

@router.get("/all-flights", response_model=List[FlightResponse])
def get_flights(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return FlightService.get_flights(db, current_user.id)

@router.get("/{flight_id}", response_model=FlightResponse)
def get_flight(flight_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    flight = FlightService.get_flight(db, flight_id, current_user.id)
    if not flight:
        raise HTTPException(status_code=404, detail="Flight not found")
    return flight

@router.delete("/{flight_id}")
def delete_flight(flight_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    deleted = FlightService.delete_flight(db, flight_id, current_user.id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Flight not found")
    return {"message": "Flight deleted successfully"}