import requests
from sqlalchemy.orm import Session
from sqlalchemy.dialects.postgresql import insert
from app.db.session import SessionLocal
from app.models.routes import Route
from app.models.airlines import Airlines
from app.models.airports import Airport

def seed_routes():
    url = "https://raw.githubusercontent.com/jpatokal/openflights/master/data/routes.dat"
    response = requests.get(url)
    lines = response.text.splitlines()

    db: Session = SessionLocal()
    count = 0
    seen_routes = set()

    try:
        known_airlines = {row[0] for row in db.query(Airlines.iata_code).all()}
        known_airports = {row[0] for row in db.query(Airport.iata_code).all()}

        for line in lines:
            fields = [f.strip().strip('"') for f in line.split(",")]

            if len(fields) < 5:
                continue

            airline_iata = fields[0]
            origin_iata = fields[2]
            destination_iata = fields[4]

            if not (airline_iata and origin_iata and destination_iata):
                continue
            if airline_iata == "\\N" or origin_iata == "\\N" or destination_iata == "\\N":
                continue
            if len(airline_iata) != 2 or len(origin_iata) != 3 or len(destination_iata) != 3:
                continue
            if airline_iata not in known_airlines:
                continue
            if origin_iata not in known_airports or destination_iata not in known_airports:
                continue

            key = (airline_iata, origin_iata, destination_iata)
            if key in seen_routes:
                continue
            seen_routes.add(key)

            stmt = insert(Route).values(
                airline_iata=airline_iata,
                origin_iata=origin_iata,
                destination_iata=destination_iata,
            )
            stmt = stmt.on_conflict_do_nothing(
                index_elements=["airline_iata", "origin_iata", "destination_iata"]
            )
            db.execute(stmt)

            count += 1
            if count % 500 == 0:
                db.flush()

        db.commit()
        print(f"Seeded {count} unique routes successfully!")

    except Exception as e:
        db.rollback()
        print(f"Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_routes()
