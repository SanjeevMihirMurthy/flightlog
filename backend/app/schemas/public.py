from pydantic import BaseModel
from typing import Optional


class PublicProfile(BaseModel):
    name: Optional[str] = None
    picture: Optional[str] = None

    class Config:
        from_attributes = True


class PublicFlight(BaseModel):
    origin_iata: str
    destination_iata: str
    airline: str
    aircraft_type: Optional[str] = None
    distance_km: Optional[float] = None

    class Config:
        from_attributes = True
