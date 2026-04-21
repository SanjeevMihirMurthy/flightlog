from sqlalchemy.orm import Session
from app.models.flights import Flight
from app.schemas.flight import FlightCreate

class FlightService:

    @staticmethod
    def create_flight(db: Session, flight: FlightCreate) -> Flight:
        db_flight = Flight(**flight.model_dump())
        db.add(db_flight)
        db.commit()
        db.refresh(db_flight)
        return db_flight

    @staticmethod
    def get_flights(db: Session) -> list[Flight]:
        return db.query(Flight).order_by(Flight.created_at.desc()).all()

    @staticmethod
    def get_flight(db: Session, flight_id: str) -> Flight | None:
        return db.query(Flight).filter(Flight.id == flight_id).first()

    @staticmethod
    def delete_flight(db: Session, flight_id: str) -> bool:
        flight = db.query(Flight).filter(Flight.id == flight_id).first()
        if not flight:
            return False
        db.delete(flight)
        db.commit()
        return True