from fastapi import APIRouter, Depends, HTTPException, Query
from app.services.flight_status_service import FlightStatusService
from app.services.live_tracking_service import LiveTrackingService
from app.schemas.tracking import FlightStatusResponse, LiveFlightPosition
from app.api.deps import get_current_user
from app.models.users import User

router = APIRouter(prefix="/tracking", tags=["tracking"])


def _normalize_flight_number(flight_number: str) -> str:
    return "".join(flight_number.split()).upper()


@router.get("/status", response_model=FlightStatusResponse)
def get_status(
    flight_number: str = Query(..., min_length=3),
    flight_date: str | None = Query(None),
    current_user: User = Depends(get_current_user),
):
    try:
        status = FlightStatusService.get_flight_status(_normalize_flight_number(flight_number), flight_date)
    except RuntimeError as e:
        raise HTTPException(status_code=502, detail=str(e))

    if not status:
        raise HTTPException(status_code=404, detail="No status found for this flight")
    return status


@router.get("/live", response_model=LiveFlightPosition)
def get_live(
    flight_number: str = Query(..., min_length=3),
    current_user: User = Depends(get_current_user),
):
    try:
        return LiveTrackingService.get_live_position(_normalize_flight_number(flight_number))
    except RuntimeError as e:
        raise HTTPException(status_code=502, detail=str(e))
