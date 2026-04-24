from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.schemas.airport import AirportResponse
from app.services.airports_service import AirportService
from typing import List

router = APIRouter(prefix="/airports", tags=["airports"])

@router.get("/search", response_model=List[AirportResponse])
def search_airports(
    q: str = Query(..., min_length=2, description="Search by IATA code, city or airport name"),
    db: Session = Depends(get_db)
):
    results = AirportService.search_airports(db, q)
    if not results:
        raise HTTPException(status_code=404, detail="No airports found")
    return results

@router.get("/{iata_code}", response_model=AirportResponse)
def get_airport(iata_code: str, db: Session = Depends(get_db)):
    airport = AirportService.get_airport(db, iata_code)
    if not airport:
        raise HTTPException(status_code=404, detail="Airport not found")
    return airport