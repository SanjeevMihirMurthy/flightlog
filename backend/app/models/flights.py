from sqlalchemy import Column, String, Integer, Float, Time, Text, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from sqlalchemy.types import TIMESTAMP
from app.db.base import Base
from ulid import ULID

def generate_ulid():
    return str(ULID())

class Flight(Base):
    __tablename__ = "flights"

    id = Column(String(26), primary_key=True, default=generate_ulid)
    user_id = Column(String(26), ForeignKey("users.id"), nullable=True, index=True)  # ADD THIS
    flight_number = Column(String(10), nullable=True)
    airline = Column(String(100), nullable=False)
    origin_iata = Column(String(3), ForeignKey("airports.iata_code"), nullable=False)
    destination_iata = Column(String(3), ForeignKey("airports.iata_code"), nullable=False)

    departure_year = Column(Integer, nullable=False)
    departure_month = Column(Integer, nullable=True)
    departure_day = Column(Integer, nullable=True)
    departure_time = Column(Time, nullable=True)
    arrival_time = Column(Time, nullable=True)

    aircraft_type = Column(String(50), nullable=True)
    cabin_class = Column(String(20), nullable=True)
    duration_minutes = Column(Integer, nullable=True)
    distance_km = Column(Float, nullable=True)
    notes = Column(Text, nullable=True)

    created_at = Column(TIMESTAMP, server_default=func.now(), nullable=False)

    user = relationship("User", foreign_keys=[user_id])  # ADD THIS
    origin = relationship("Airport", foreign_keys=[origin_iata])
    destination = relationship("Airport", foreign_keys=[destination_iata])