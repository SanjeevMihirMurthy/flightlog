from sqlalchemy import Column, String, Float, DateTime, Integer
from sqlalchemy.sql import func
from app.db.base import Base

class Airlines(Base):
    __tablename__ = "airlines"
    airline_id = Column(Integer, primary_key=True, index=True)
    iata_code = Column(String(2), unique=True, nullable=False)
    name = Column(String, nullable=False)
    country = Column(String)