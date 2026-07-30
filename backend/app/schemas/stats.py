from pydantic import BaseModel
from typing import Optional


class StatsResponse(BaseModel):
    total_flights: int
    total_distance_km: float
    unique_airports: int
    unique_countries: int
    unique_continents: int
    unique_airlines: int
    unique_aircraft_types: int
    longest_flight_km: Optional[float] = None
    shortest_flight_km: Optional[float] = None
