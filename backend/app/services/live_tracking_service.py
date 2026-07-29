import os
import time
import json
from pathlib import Path
import requests
from app.schemas.tracking import LiveFlightPosition

OPENSKY_TOKEN_URL = "https://auth.opensky-network.org/auth/realms/opensky-network/protocol/openid-connect/token"
OPENSKY_STATES_URL = "https://opensky-network.org/api/states/all"

ICAO_CODES_PATH = Path(__file__).resolve().parent.parent / "data" / "airline_icao_codes.json"
with open(ICAO_CODES_PATH) as f:
    _AIRLINE_ICAO_CODES = json.load(f)

_token_cache = {"access_token": None, "expires_at": 0}


class LiveTrackingService:

    @staticmethod
    def _resolve_callsign_candidates(flight_iata: str) -> list[str]:
        prefix = flight_iata[:2].upper()
        number_part = flight_iata[2:].strip()

        icao_code = _AIRLINE_ICAO_CODES.get(prefix)
        if not icao_code or not number_part:
            return []

        candidates = {f"{icao_code}{number_part}"}
        stripped = number_part.lstrip("0")
        if stripped:
            candidates.add(f"{icao_code}{stripped}")

        return list(candidates)

    @staticmethod
    def _get_access_token() -> str:
        if _token_cache["access_token"] and time.time() < _token_cache["expires_at"]:
            return _token_cache["access_token"]

        client_id = os.getenv("OPENSKY_CLIENT_ID")
        client_secret = os.getenv("OPENSKY_CLIENT_SECRET")
        if not client_id or not client_secret:
            raise RuntimeError("OPENSKY_CLIENT_ID / OPENSKY_CLIENT_SECRET are not configured")

        response = requests.post(
            OPENSKY_TOKEN_URL,
            data={
                "grant_type": "client_credentials",
                "client_id": client_id,
                "client_secret": client_secret,
            },
            timeout=10,
        )
        response.raise_for_status()
        payload = response.json()

        _token_cache["access_token"] = payload["access_token"]
        _token_cache["expires_at"] = time.time() + payload.get("expires_in", 1800) - 30
        return _token_cache["access_token"]

    @staticmethod
    def get_live_position(flight_iata: str) -> LiveFlightPosition:
        candidates = LiveTrackingService._resolve_callsign_candidates(flight_iata)
        if not candidates:
            return LiveFlightPosition(found=False)

        token = LiveTrackingService._get_access_token()
        response = requests.get(
            OPENSKY_STATES_URL,
            headers={"Authorization": f"Bearer {token}"},
            timeout=15,
        )
        response.raise_for_status()
        payload = response.json()

        states = payload.get("states") or []
        for state in states:
            callsign = (state[1] or "").strip().upper()
            if callsign in candidates:
                return LiveFlightPosition(
                    found=True,
                    callsign=callsign,
                    longitude=state[5],
                    latitude=state[6],
                    altitude=state[7],
                    on_ground=state[8],
                    velocity=state[9],
                    heading=state[10],
                    last_contact=state[4],
                )

        return LiveFlightPosition(found=False)
