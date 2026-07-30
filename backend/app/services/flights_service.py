from sqlalchemy.orm import Session
from app.models.flights import Flight
from app.models.airports import Airport
from app.schemas.flight import FlightCreate
from app.services.geo import haversine_km

class FlightService:

    @staticmethod
    def create_flight(db: Session, flight: FlightCreate, user_id: str) -> Flight:
        db_flight = Flight(**flight.model_dump(), user_id=user_id)

        origin = db.query(Airport).filter(Airport.iata_code == flight.origin_iata).first()
        destination = db.query(Airport).filter(Airport.iata_code == flight.destination_iata).first()
        if origin and destination:
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