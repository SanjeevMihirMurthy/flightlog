from pydantic import BaseModel
from typing import Optional


class FlightStatusResponse(BaseModel):
    flight_number: str
    airline: Optional[str] = None
    flight_status: Optional[str] = None

    departure_airport: Optional[str] = None
    departure_iata: Optional[str] = None
    departure_scheduled: Optional[str] = None
    departure_estimated: Optional[str] = None
    departure_actual: Optional[str] = None
    departure_terminal: Optional[str] = None
    departure_gate: Optional[str] = None

    arrival_airport: Optional[str] = None
    arrival_iata: Optional[str] = None
    arrival_scheduled: Optional[str] = None
    arrival_estimated: Optional[str] = None
    arrival_actual: Optional[str] = None
    arrival_terminal: Optional[str] = None
    arrival_gate: Optional[str] = None

    aircraft_type: Optional[str] = None


class LiveFlightPosition(BaseModel):
    found: bool
    callsign: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    altitude: Optional[float] = None
    velocity: Optional[float] = None
    heading: Optional[float] = None
    on_ground: Optional[bool] = None
    last_contact: Optional[int] = None
