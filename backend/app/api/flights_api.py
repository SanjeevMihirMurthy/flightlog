import logging
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.schemas.flight import FlightCreate, FlightResponse, FlightExtractionResponse, CSVImportResult
from app.services.flights_service import FlightService
from app.services.extraction_service import ExtractionService
from app.api.deps import get_current_user
from app.models.users import User
from typing import List

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/flights", tags=["flights"])

MAX_EXTRACTION_BYTES = 10 * 1024 * 1024

@router.post("/add-flight", response_model=FlightResponse)
def create_flight(flight: FlightCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    try:
        return FlightService.create_flight(db, flight, current_user.id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/extract", response_model=FlightExtractionResponse)
async def extract_flight(file: UploadFile = File(...), db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    is_image = file.content_type and file.content_type.startswith("image/")
    is_pdf = file.content_type == "application/pdf"
    if not (is_image or is_pdf):
        raise HTTPException(status_code=400, detail="Please upload an image or PDF file")

    file_bytes = await file.read()
    if len(file_bytes) > MAX_EXTRACTION_BYTES:
        raise HTTPException(status_code=400, detail="File is too large (max 10MB)")

    try:
        return ExtractionService.extract_from_file(db, file_bytes, file.content_type)
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception:
        logger.exception("Flight extraction failed")
        raise HTTPException(status_code=422, detail="Couldn't read that file — try manual entry")

@router.post("/import-csv", response_model=CSVImportResult)
async def import_csv(file: UploadFile = File(...), db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if not file.filename or not file.filename.lower().endswith(".csv"):
        raise HTTPException(status_code=400, detail="Please upload a .csv file")

    raw = await file.read()
    try:
        csv_text = raw.decode("utf-8-sig")
    except UnicodeDecodeError:
        raise HTTPException(status_code=400, detail="Could not read file as UTF-8 text")

    return FlightService.import_csv(db, current_user.id, csv_text)

@router.get("/all-flights", response_model=List[FlightResponse])
def get_flights(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return FlightService.get_flights(db, current_user.id)

@router.get("/{flight_id}", response_model=FlightResponse)
def get_flight(flight_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    flight = FlightService.get_flight(db, flight_id, current_user.id)
    if not flight:
        raise HTTPException(status_code=404, detail="Flight not found")
    return flight

@router.put("/{flight_id}", response_model=FlightResponse)
def update_flight(flight_id: str, flight: FlightCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    try:
        updated = FlightService.update_flight(db, flight_id, flight, current_user.id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    if not updated:
        raise HTTPException(status_code=404, detail="Flight not found")
    return updated

@router.delete("/{flight_id}")
def delete_flight(flight_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    deleted = FlightService.delete_flight(db, flight_id, current_user.id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Flight not found")
    return {"message": "Flight deleted successfully"}