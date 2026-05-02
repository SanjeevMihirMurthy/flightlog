from sqlalchemy.orm import Session
from app.models.airlines import Airlines
from app.schemas.airlines import AirlinesListAll

class AirlineService:

    @staticmethod
    def get_airlines(db: Session) -> list[AirlinesListAll]:
        return db.query(Airlines).all()
