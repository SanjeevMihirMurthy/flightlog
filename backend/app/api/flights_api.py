from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.schemas.flight import FlightCreate, FlightResponse
from app.services.flights_service import FlightService
from typing import List

router = APIRouter(prefix="/flights", tags=["flights"])

@router.post("/add-flight", response_model=FlightResponse)
def create_flight(flight: FlightCreate, db: Session = Depends(get_db)):
    return FlightService.create_flight(db, flight)

@router.get("/all-flights", response_model=List[FlightResponse])
def get_flights(db: Session = Depends(get_db)):
    return FlightService.get_flights(db)

@router.get("/{flight_id}", response_model=FlightResponse)
def get_flight(flight_id: str, db: Session = Depends(get_db)):
    flight = FlightService.get_flight(db, flight_id)
    if not flight:
        raise HTTPException(status_code=404, detail="Flight not found")
    return flight

@router.delete("/{flight_id}")
def delete_flight(flight_id: str, db: Session = Depends(get_db)):
    deleted = FlightService.delete_flight(db, flight_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Flight not found")
    return {"message": "Flight deleted successfully"}