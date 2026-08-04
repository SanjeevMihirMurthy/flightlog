import csv
import io
from sqlalchemy.orm import Session
from app.models.flights import Flight
from app.models.airports import Airport
from app.schemas.flight import FlightCreate
from app.services.geo import haversine_km

class FlightService:

    @staticmethod
    def create_flight(db: Session, flight: FlightCreate, user_id: str) -> Flight:
        origin = db.query(Airport).filter(Airport.iata_code == flight.origin_iata).first()
        destination = db.query(Airport).filter(Airport.iata_code == flight.destination_iata).first()
        if not origin:
            raise ValueError(f"unknown origin_iata '{flight.origin_iata}'")
        if not destination:
            raise ValueError(f"unknown destination_iata '{flight.destination_iata}'")

        db_flight = Flight(**flight.model_dump(), user_id=user_id)
        db_flight.distance_km = haversine_km(
            origin.latitude, origin.longitude,
            destination.latitude, destination.longitude,
        )

        db.add(db_flight)
        db.commit()
        db.refresh(db_flight)
        return db_flight

    @staticmethod
    def get_flights(db: Session, user_id: str) -> list[Flight]:
        return (
            db.query(Flight)
            .filter(Flight.user_id == user_id)
            .order_by(Flight.created_at.desc())
            .all()
        )

    @staticmethod
    def get_flight(db: Session, flight_id: str, user_id: str) -> Flight | None:
        return (
            db.query(Flight)
            .filter(Flight.id == flight_id, Flight.user_id == user_id)
            .first()
        )

    @staticmethod
    def update_flight(db: Session, flight_id: str, flight: FlightCreate, user_id: str) -> Flight | None:
        db_flight = (
            db.query(Flight)
            .filter(Flight.id == flight_id, Flight.user_id == user_id)
            .first()
        )
        if not db_flight:
            return None

        origin = db.query(Airport).filter(Airport.iata_code == flight.origin_iata).first()
        destination = db.query(Airport).filter(Airport.iata_code == flight.destination_iata).first()
        if not origin:
            raise ValueError(f"unknown origin_iata '{flight.origin_iata}'")
        if not destination:
            raise ValueError(f"unknown destination_iata '{flight.destination_iata}'")

        for key, value in flight.model_dump().items():
            setattr(db_flight, key, value)
        db_flight.distance_km = haversine_km(
            origin.latitude, origin.longitude,
            destination.latitude, destination.longitude,
        )

        db.commit()
        db.refresh(db_flight)
        return db_flight

    @staticmethod
    def delete_flight(db: Session, flight_id: str, user_id: str) -> bool:
        flight = (
            db.query(Flight)
            .filter(Flight.id == flight_id, Flight.user_id == user_id)
            .first()
        )
        if not flight:
            return False
        db.delete(flight)
        db.commit()
        return True

    @staticmethod
    def import_csv(db: Session, user_id: str, csv_text: str) -> dict:
        reader = csv.DictReader(io.StringIO(csv_text))
        created_count = 0
        errors = []

        def _clean(row: dict, field: str) -> str | None:
            value = (row.get(field) or "").strip()
            return value or None

        def _clean_int(row: dict, field: str) -> int | None:
            value = _clean(row, field)
            return int(value) if value is not None else None

        for row_number, row in enumerate(reader, start=2):
            try:
                airline = _clean(row, "airline")
                origin_iata = (_clean(row, "origin_iata") or "").upper() or None
                destination_iata = (_clean(row, "destination_iata") or "").upper() or None

                if not airline:
                    raise ValueError("airline is required")
                if not origin_iata or not destination_iata:
                    raise ValueError("origin_iata and destination_iata are required")
                if not db.query(Airport).filter(Airport.iata_code == origin_iata).first():
                    raise ValueError(f"unknown origin_iata '{origin_iata}'")
                if not db.query(Airport).filter(Airport.iata_code == destination_iata).first():
                    raise ValueError(f"unknown destination_iata '{destination_iata}'")

                departure_year = _clean_int(row, "departure_year")
                if departure_year is None:
                    raise ValueError("departure_year is required")

                flight = FlightCreate(
                    flight_number=_clean(row, "flight_number"),
                    airline=airline,
                    origin_iata=origin_iata,
                    destination_iata=destination_iata,
                    departure_year=departure_year,
                    departure_month=_clean_int(row, "departure_month"),
                    departure_day=_clean_int(row, "departure_day"),
                    aircraft_type=_clean(row, "aircraft_type"),
                    cabin_class=_clean(row, "cabin_class"),
                    duration_minutes=_clean_int(row, "duration_minutes"),
                    notes=_clean(row, "notes"),
                )
                FlightService.create_flight(db, flight, user_id)
                created_count += 1
            except (ValueError, TypeError) as e:
                errors.append({"row": row_number, "message": str(e)})

        return {"created_count": created_count, "errors": errors}