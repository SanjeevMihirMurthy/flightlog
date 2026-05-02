from pydantic import BaseModel

class AirlinesListAll(BaseModel):
    airline_id: int
    iata_code: str
    name: str
    country: str | None = None # Use | None for optional fields

    class Config:
        # For Pydantic v2:
        from_attributes = True 
        # For Pydantic v1 (if you're on an older version):
        # orm_mode = True