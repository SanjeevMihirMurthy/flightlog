from sqlalchemy.orm import Session
from app.models.airports import Airport

class AirportService:

    @staticmethod
    def search_airports(db: Session, query: str) -> list[Airport]:
        search = f"%{query.upper()}%"
        return db.query(Airport).filter(
            Airport.iata_code.ilike(search) |
            Airport.name.ilike(f"%{query}%") |
            Airport.city.ilike(f"%{query}%")
        ).limit(10).all()

    @staticmethod
    def get_airport(db: Session, iata_code: str) -> Airport | None:
        return db.query(Airport).filter(
            Airport.iata_code == iata_code.upper()
        ).first()