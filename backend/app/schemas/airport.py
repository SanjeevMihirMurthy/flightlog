from pydantic import BaseModel

class AirportResponse(BaseModel):
    iata_code: str
    name: str
    city: str
    country: str
    latitude: float
    longitude: float

    class Config:
        from_attributes = True