import base64
import os
from typing import Optional

from google import genai
from google.genai import errors
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.models.airports import Airport
from app.models.airlines import Airlines
from app.schemas.airport import AirportResponse
from app.schemas.flight import FlightExtractionResponse

MODEL = "gemini-3.6-flash"

EXTRACTION_PROMPT = (
    "This is a boarding pass or flight itinerary. Extract the flight details. "
    "If a field isn't visible or can't be determined, leave it null rather than guessing. "
    "Airport and airline fields should be IATA codes."
)


class _FlightExtraction(BaseModel):
    flight_number: Optional[str] = None
    airline_name: Optional[str] = None
    airline_iata: Optional[str] = None
    origin_iata: Optional[str] = None
    destination_iata: Optional[str] = None
    departure_year: Optional[int] = None
    departure_month: Optional[int] = None
    departure_day: Optional[int] = None
    aircraft_type: Optional[str] = None
    cabin_class: Optional[str] = None


class ExtractionService:

    @staticmethod
    def extract_from_file(db: Session, file_bytes: bytes, media_type: str) -> FlightExtractionResponse:
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            raise RuntimeError("GEMINI_API_KEY is not configured")

        client = genai.Client(api_key=api_key)
        file_data = base64.b64encode(file_bytes).decode("utf-8")
        content_type = "document" if media_type == "application/pdf" else "image"

        try:
            interaction = client.interactions.create(
                model=MODEL,
                input=[
                    {"type": content_type, "data": file_data, "mime_type": media_type},
                    {"type": "text", "text": EXTRACTION_PROMPT},
                ],
                response_format={
                    "type": "text",
                    "mime_type": "application/json",
                    "schema": _FlightExtraction.model_json_schema(),
                },
            )
        except errors.APIError as e:
            if e.code in (401, 403):
                raise RuntimeError(f"Gemini API key is invalid or lacks permission: {e.message}")
            raise RuntimeError(e.message or str(e))
        except Exception as e:
            raise RuntimeError(f"Gemini request failed: {e}")

        extracted = _FlightExtraction.model_validate_json(interaction.output_text)

        airline = None
        if extracted.airline_iata:
            airline = db.query(Airlines).filter(Airlines.iata_code == extracted.airline_iata.upper()).first()
        if not airline and extracted.airline_name:
            airline = db.query(Airlines).filter(Airlines.name.ilike(f"%{extracted.airline_name}%")).first()

        origin = None
        if extracted.origin_iata:
            origin = db.query(Airport).filter(Airport.iata_code == extracted.origin_iata.upper()).first()

        destination = None
        if extracted.destination_iata:
            destination = db.query(Airport).filter(Airport.iata_code == extracted.destination_iata.upper()).first()

        return FlightExtractionResponse(
            flight_number=extracted.flight_number,
            airline_name=airline.name if airline else extracted.airline_name,
            airline_iata=airline.iata_code if airline else extracted.airline_iata,
            origin=AirportResponse.model_validate(origin) if origin else None,
            destination=AirportResponse.model_validate(destination) if destination else None,
            departure_year=extracted.departure_year,
            departure_month=extracted.departure_month,
            departure_day=extracted.departure_day,
            aircraft_type=extracted.aircraft_type,
            cabin_class=extracted.cabin_class,
        )
