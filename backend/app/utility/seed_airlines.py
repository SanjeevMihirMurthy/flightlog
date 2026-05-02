import requests
from sqlalchemy.orm import Session
from sqlalchemy.dialects.postgresql import insert  # If using PostgreSQL
from app.db.session import SessionLocal
from app.models.airlines import Airlines

def seed_airlines():
    url = "https://raw.githubusercontent.com/jpatokal/openflights/master/data/airlines.dat"
    response = requests.get(url)
    lines = response.text.splitlines()

    db: Session = SessionLocal()
    count = 0
    # Track codes seen in this run to avoid internal duplicates in the CSV
    seen_codes = set()

    try:
        for line in lines:
            # Note: Using csv module is safer for splitting quoted commas, 
            # but sticking to your split logic for simplicity
            fields = [f.strip().strip('"') for f in line.split(",")]
            
            if len(fields) < 8:
                continue

            name = fields[1]
            iata_code = fields[3]
            country = fields[6]
            active = fields[7]

            # Validation logic
            if iata_code and iata_code != "\\N" and len(iata_code) == 2 and active == "Y":
                
                # SKIP if we already processed this code in this loop
                if iata_code in seen_codes:
                    continue
                
                airline_data = {
                    "iata_code": iata_code,
                    "name": name,
                    "country": country if country != "\\N" else None
                }

                # OPTION A: Using PostgreSQL "ON CONFLICT" (Most efficient)
                stmt = insert(Airlines).values(**airline_data)
                stmt = stmt.on_conflict_do_update(
                    index_elements=['iata_code'],
                    set_={"name": name, "country": airline_data["country"]}
                )
                db.execute(stmt)
                
                seen_codes.add(iata_code)
                count += 1
                
                # Optional: Flush every 100 rows to keep memory low
                if count % 100 == 0:
                    db.flush()

        db.commit()
        print(f"Seeded {count} unique airlines successfully!")
        
    except Exception as e:
        db.rollback()
        print(f"Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_airlines()