from sqlalchemy.orm import Session
from app.models.airlines import Airlines
from app.models.routes import Route
from app.schemas.airlines import AirlinesListAll

class AirlineService:

    @staticmethod
    def get_airlines(db: Session) -> list[AirlinesListAll]:
        return db.query(Airlines).all()

    @staticmethod
    def get_airlines_for_route(db: Session, origin_iata: str, destination_iata: str) -> list[Airlines]:
        return (
            db.query(Airlines)
            .join(Route, Route.airline_iata == Airlines.iata_code)
            .filter(Route.origin_iata == origin_iata.upper(), Route.destination_iata == destination_iata.upper())
            .distinct()
            .all()
        )
