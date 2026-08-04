from sqlalchemy import Column, Integer, String, ForeignKey, UniqueConstraint
from app.db.base import Base

class Route(Base):
    __tablename__ = "routes"

    id = Column(Integer, primary_key=True, autoincrement=True)
    airline_iata = Column(String(2), ForeignKey("airlines.iata_code"), nullable=False, index=True)
    origin_iata = Column(String(3), ForeignKey("airports.iata_code"), nullable=False, index=True)
    destination_iata = Column(String(3), ForeignKey("airports.iata_code"), nullable=False, index=True)

    __table_args__ = (
        UniqueConstraint("airline_iata", "origin_iata", "destination_iata", name="uq_route_airline_origin_destination"),
    )
