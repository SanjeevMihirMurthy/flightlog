import json
import requests
from pathlib import Path

DATA_URL = "https://raw.githubusercontent.com/jpatokal/openflights/master/data/airlines.dat"
OUTPUT_PATH = Path(__file__).resolve().parent.parent / "data" / "airline_icao_codes.json"


def build_airline_icao_codes():
    response = requests.get(DATA_URL)
    lines = response.text.splitlines()

    codes = {}
    for line in lines:
        fields = [f.strip().strip('"') for f in line.split(",")]
        if len(fields) < 8:
            continue

        iata_code = fields[3]
        icao_code = fields[4]
        active = fields[7]

        if (
            iata_code and iata_code != "\\N" and len(iata_code) == 2
            and icao_code and icao_code != "\\N" and len(icao_code) == 3
            and active == "Y"
        ):
            codes.setdefault(iata_code, icao_code)

    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    with open(OUTPUT_PATH, "w") as f:
        json.dump(codes, f, indent=2, sort_keys=True)

    print(f"Wrote {len(codes)} IATA->ICAO airline codes to {OUTPUT_PATH}")


if __name__ == "__main__":
    build_airline_icao_codes()
