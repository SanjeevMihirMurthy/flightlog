import json
from pathlib import Path
from app.models.flights import Flight
from app.models.airports import Airport
from app.schemas.stats import StatsResponse

COUNTRY_CONTINENTS_PATH = Path(__file__).resolve().parent.parent / "data" / "country_continents.json"
with open(COUNTRY_CONTINENTS_PATH) as f:
    _COUNTRY_CONTINENTS = json.load(f)


def compute_stats(flights: list[Flight], airports_by_iata: dict[str, Airport]) -> StatsResponse:
    unique_airports = set()
    unique_countries = set()
    unique_continents = set()
    unique_airlines = set()
    unique_aircraft_types = set()
    distances = []

    for flight in flights:
        if flight.airline:
            unique_airlines.add(flight.airline)
        if flight.aircraft_type:
            unique_aircraft_types.add(flight.aircraft_type)
        if flight.distance_km is not None:
            distances.append(flight.distance_km)

        for iata in (flight.origin_iata, flight.destination_iata):
            unique_airports.add(iata)
            airport = airports_by_iata.get(iata)
            if airport and airport.country:
                unique_countries.add(airport.country)
                continent = _COUNTRY_CONTINENTS.get(airport.country)
                if continent:
                    unique_continents.add(continent)

    return StatsResponse(
        total_flights=len(flights),
        total_distance_km=sum(distances) if distances else 0.0,
        unique_airports=len(unique_airports),
        unique_countries=len(unique_countries),
        unique_continents=len(unique_continents),
        unique_airlines=len(unique_airlines),
        unique_aircraft_types=len(unique_aircraft_types),
        longest_flight_km=max(distances) if distances else None,
        shortest_flight_km=min(distances) if distances else None,
    )


def get_airports_by_iata(db, flights: list[Flight]) -> dict[str, Airport]:
    iata_codes = {code for f in flights for code in (f.origin_iata, f.destination_iata)}
    if not iata_codes:
        return {}
    airports = db.query(Airport).filter(Airport.iata_code.in_(iata_codes)).all()
    return {a.iata_code: a for a in airports}
