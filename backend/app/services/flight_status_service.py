import os
import requests
from app.schemas.tracking import FlightStatusResponse

AVIATIONSTACK_BASE_URL = "https://api.aviationstack.com/v1/flights"

_STATUS_PRIORITY = {"active": 0, "scheduled": 1, "diverted": 2, "incident": 3, "landed": 4, "cancelled": 5}


def _pick_best_result(results: list[dict]) -> dict:
    return min(results, key=lambda r: _STATUS_PRIORITY.get(r.get("flight_status"), 99))


class FlightStatusService:

    @staticmethod
    def get_flight_status(flight_iata: str, flight_date: str | None = None) -> FlightStatusResponse | None:
        api_key = os.getenv("AVIATIONSTACK_API_KEY")
        if not api_key:
            raise RuntimeError("AVIATIONSTACK_API_KEY is not configured")

        params = {"access_key": api_key, "flight_iata": flight_iata}
        if flight_date:
            params["flight_date"] = flight_date

        response = requests.get(AVIATIONSTACK_BASE_URL, params=params, timeout=10)
        response.raise_for_status()
        payload = response.json()

        if "error" in payload:
            raise RuntimeError(payload["error"].get("message", "aviationstack request failed"))

        results = payload.get("data") or []
        if not results:
            return None

        flight = _pick_best_result(results)
        departure = flight.get("departure") or {}
        arrival = flight.get("arrival") or {}
        airline = flight.get("airline") or {}
        flight_info = flight.get("flight") or {}
        aircraft = flight.get("aircraft") or {}

        return FlightStatusResponse(
            flight_number=flight_info.get("iata") or flight_iata,
            airline=airline.get("name"),
            flight_status=flight.get("flight_status"),
            departure_airport=departure.get("airport"),
            departure_iata=departure.get("iata"),
            departure_scheduled=departure.get("scheduled"),
            departure_estimated=departure.get("estimated"),
            departure_actual=departure.get("actual"),
            departure_terminal=departure.get("terminal"),
            departure_gate=departure.get("gate"),
            arrival_airport=arrival.get("airport"),
            arrival_iata=arrival.get("iata"),
            arrival_scheduled=arrival.get("scheduled"),
            arrival_estimated=arrival.get("estimated"),
            arrival_actual=arrival.get("actual"),
            arrival_terminal=arrival.get("terminal"),
            arrival_gate=arrival.get("gate"),
            aircraft_type=aircraft.get("icao") or aircraft.get("iata"),
        )
