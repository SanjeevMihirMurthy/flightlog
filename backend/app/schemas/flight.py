from pydantic import BaseModel
from typing import Optional

class FlightCreate(BaseModel):
    flight_number: Optional[str] = None
    airline: str
    origin_iata: str
    destination_iata: str
    departure_year: int
    departure_month: Optional[int] = None
    departure_day: Optional[int] = None
    departure_time: Optional[str] = None
    arrival_time: Optional[str] = None
    aircraft_type: Optional[str] = None
    cabin_class: Optional[str] = None
    duration_minutes: Optional[int] = None
    notes: Optional[str] = None

class FlightResponse(BaseModel):
    id: str
    flight_number: Optional[str]
    airline: str
    origin_iata: str
    destination_iata: str
    departure_year: int
    departure_month: Optional[int]
    departure_day: Optional[int]
    aircraft_type: Optional[str]
    cabin_class: Optional[str]
    duration_minutes: Optional[int]
    distance_km: Optional[float]
    notes: Optional[str]

    