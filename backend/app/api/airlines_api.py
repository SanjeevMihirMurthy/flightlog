from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.schemas.airlines import AirlinesListAll
from app.services.airlines_service import AirlineService
from typing import List

router = APIRouter(prefix="/airlines", tags=["airlines"])

@router.get("/all-airlines", response_model=List[AirlinesListAll])
def get_airport(db: Session = Depends(get_db)):
    airlines = AirlineService.get_airlines(db)
    
    # If the list is empty, you can return [] or 404. 
    # Usually, 'Select All' returns [] if nothing is found.
    if not airlines:
        raise HTTPException(status_code=404, detail="No airlines found")
        
    return airlines