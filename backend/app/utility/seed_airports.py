import csv
import requests
from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.models.airports import Airport

def seed_airports():
    url = "https://raw.githubusercontent.com/davidmegginson/ourairports-data/main/airports.csv"
    response = requests.get(url)
    lines = response.text.splitlines()
    reader = csv.DictReader(lines)

    db: Session = SessionLocal()
    count = 0

    try:
        for row in reader:
            if row["iata_code"] and row["iata_code"] != "0":
                airport = Airport(
                    iata_code=row["iata_code"],
                    name=row["name"],
                    city=row["municipality"],
                    country=row["iso_country"],
                    latitude=float(row["latitude_deg"]),
                    longitude=float(row["longitude_deg"])
                )
                db.merge(airport)
                count += 1

        db.commit()
        print(f"Seeded {count} airports successfully!")
    except Exception as e:
        db.rollback()
        print(f"Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_airports()