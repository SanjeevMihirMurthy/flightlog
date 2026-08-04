import re
from datetime import datetime
from pydantic import BaseModel, field_validator, model_validator
from typing import Optional
from app.schemas.airport import AirportResponse

MIN_FLIGHT_YEAR = 1919
FLIGHT_NUMBER_PATTERN = re.compile(r"^[A-Za-z0-9]{2,8}$")

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

    @field_validator("origin_iata", "destination_iata")
    @classmethod
    def normalize_iata(cls, v: str) -> str:
        return v.upper()

    @field_validator("departure_year")
    @classmethod
    def validate_departure_year(cls, v: int) -> int:
        max_year = datetime.now().year + 1
        if not (MIN_FLIGHT_YEAR <= v <= max_year):
            raise ValueError(f"departure_year must be between {MIN_FLIGHT_YEAR} and {max_year}")
        return v

    @field_validator("flight_number")
    @classmethod
    def validate_flight_number(cls, v: Optional[str]) -> Optional[str]:
        if v and not FLIGHT_NUMBER_PATTERN.match(v):
            raise ValueError("flight_number must be 2-8 letters/digits")
        return v

    @field_validator("duration_minutes")
    @classmethod
    def validate_duration_minutes(cls, v: Optional[int]) -> Optional[int]:
        if v is not None and not (1 <= v <= 1440):
            raise ValueError("duration_minutes must be between 1 and 1440")
        return v

    @model_validator(mode="after")
    def validate_route(self):
        if self.origin_iata == self.destination_iata:
            raise ValueError("origin_iata and destination_iata cannot be the same airport")
        return self

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

class FlightExtractionResponse(BaseModel):
    flight_number: Optional[str] = None
    airline_name: Optional[str] = None
    airline_iata: Optional[str] = None
    origin: Optional[AirportResponse] = None
    destination: Optional[AirportResponse] = None
    departure_year: Optional[int] = None
    departure_month: Optional[int] = None
    departure_day: Optional[int] = None
    aircraft_type: Optional[str] = None
    cabin_class: Optional[str] = None

class CSVImportRowError(BaseModel):
    row: int
    message: str

class CSVImportResult(BaseModel):
    created_count: int
    errors: list[CSVImportRowError]
