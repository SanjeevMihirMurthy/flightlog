# Flightlog — Developer Learnings


A running log of things learned while building Flightlog. Updated as we go.

------------------------------------------------------------------------------
## How to use this file
- Add a new entry every time you learn something new
- Date your entries so you can track your progress over time
- Be specific — "learned about Alembic" is useless, "alembic upgrade head applies pending migrations" is useful
- Code snippets are welcome — use backticks for inline code and triple backticks for blocks
------------------------------------------------------------------------------


---

## 5th April 2026

### Project Setup & Structure
- A well structured project from day one saves hours of refactoring later
- `backend/` and `frontend/` separation keeps concerns clean
- Always create a `.gitignore` before the first commit — never commit `venv/`, `.env`, or `__pycache__/`
- `.env.example` is committed to Git, `.env` (with real credentials) never is
- `docs/` folder is for notes and architecture decisions — write to your future self

### Git & GitHub
- `git init` → `git add .` → `git commit -m "message"` is the core loop
- Always work on a `dev` branch, never directly on `main`
- Commit messages should describe *what* changed and *why*, not just "update"

## 19th April 2026

### Virtual Environments
- Always create a `venv` before installing anything in a Python project
- Activate with `venv\Scripts\activate` on Windows
- `pip freeze > requirements.txt` saves your dependencies so others can reproduce your setup
- Never commit the `venv/` folder itself — only `requirements.txt`

### PostgreSQL
- PostgreSQL runs on port `5432` by default
- Passwords with special characters like `@` break URL strings — store credentials separately in `.env`
- Always use `quote_plus()` from `urllib.parse` when building database URLs programmatically
- `psql -U postgres` connects to the database as the superuser
- `CREATE DATABASE flightlog;` creates a new database
- `\dt` lists all tables in the current database
- `\q` exits psql

### SQLAlchemy
- SQLAlchemy is an ORM — it lets you work with database tables as Python classes
- `Column` defines a field in a table
- `nullable=False` means the field is required
- `server_default=func.now()` sets the default value at the database level, not Python level
- `relationship()` creates a link between two models — like a join in SQL
- `ForeignKey("airports.iata_code")` links a column to another table's primary key
- When two foreign keys point to the same table (like origin and destination both pointing to airports), you must specify `foreign_keys=[...]` explicitly

### Alembic (Database Migrations)
- Alembic is like Git but for your database schema — tracks every change over time
- `alembic init alembic` sets up the migrations folder
- `alembic revision --autogenerate -m "message"` detects model changes and generates a migration script
- `alembic upgrade head` applies all pending migrations to the database
- `alembic downgrade -1` rolls back the last migration
- Always import your models in `env.py` so Alembic can detect them
- `target_metadata = Base.metadata` tells Alembic which models to track
- The `%` character in passwords conflicts with configparser — store passwords in `.env` and build the URL with `quote_plus()`

### Pydantic
- Pydantic validates data coming in and going out of your API
- `FlightCreate` — input schema, what the API accepts from the user
- `FlightResponse` — output schema, what the API returns to the user
- `Optional[str] = None` means the field is not required
- `from_attributes = True` inside `class Config` lets Pydantic read directly from SQLAlchemy objects instead of expecting a plain dictionary
- Without `from_attributes = True`, returning a SQLAlchemy object from an endpoint would throw a validation error

### FastAPI
- `@app.get("/")` and `@app.post("/")` define API endpoints
- `APIRouter` groups related endpoints together — keeps `main.py` clean
- `Depends(get_db)` injects a database session into each endpoint automatically
- `response_model=FlightResponse` tells FastAPI to validate and format the response
- `HTTPException(status_code=404, detail="...")` returns a proper error response
- FastAPI auto-generates interactive docs at `/docs` — use it to test endpoints without writing any frontend code
- `CORSMiddleware` allows the React frontend (running on a different port) to talk to the FastAPI backend

### ULIDs
- ULID = Universally Unique Lexicographically Sortable Identifier
- 26 characters long, URL friendly, globally unique
- Sortable by creation time unlike UUIDs — records naturally come back in order
- Better than integer IDs for portfolio projects — shows knowledge of modern patterns
- Generated with `python-ulid` library: `str(ULID())`

### Architecture — API vs Service layer
- Never put business logic directly inside API endpoint functions
- `api/` — handles HTTP only: request, response, validation, status codes
- `services/` — contains all business logic and database operations
- `schemas/` — Pydantic input/output shapes
- `models/` — SQLAlchemy database table definitions
- This separation makes code reusable, testable, and maintainable

## 21th April 2026

### Password with @ breaking the database URL
 - Error: could not translate host name "123@localhost" to address
 - Cause: The database URL format uses @ to separate credentials from the host. A password containing @ breaks the parsing — the URL becomes malformed.
 - Fix: Store credentials separately in .env and build the URL using quote_plus() which automatically encodes special characters:
 - pythonfrom urllib.parse import quote_plus
 - DB_PASSWORD = quote_plus(os.getenv("DB_PASSWORD"))
 - DATABASE_URL = f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
 - Ended up using a simple password without special characters to process it

## Errors Faced & How We Solved Them

### 1. `mkdir -p` not working on Windows Command Prompt
**Error:** `The syntax of the command is incorrect`

**Cause:** `-p` is a Linux flag. Doesn't exist in Windows Command Prompt.

**Fix:** Use backslashes instead:
```cmd
mkdir backend\app\api backend\app\models backend\app\schemas
```
Or switch to Git Bash which understands Linux commands natively.

---

### 2. Circular import between `db/__init__.py` and models
**Error:** `ImportError` when running Alembic

**Cause:** `app/db/__init__.py` was importing from models, and models were importing from `app/db/base`. This created a circular loop.

**Fix:** Make `app/db/__init__.py` completely empty. Never import models from inside the `db/` package.

---

### 3. `keyword argument repeated: server_default`
**Error:** `SyntaxError: keyword argument repeated: server_default`

**Cause:** Same keyword argument was passed twice to a `Column()`:
```python
updated_at = Column(DateTime, server_default=func.now(), server_default=func.now())
```

**Fix:** Use `server_default` for creation time and `onupdate` for update time:
```python
updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
```

---

### 4. `func.now()` passed as positional argument
**Error:** `sqlalchemy.exc.ArgumentError: 'SchemaItem' object expected`

**Cause:** `func.now()` was passed as a positional argument instead of a keyword argument:
```python
created_at = Column(DateTime, func.now())  # WRONG
```

**Fix:**
```python
created_at = Column(DateTime, server_default=func.now(), nullable=False)  # CORRECT
```

---

### 5. Password with `@` breaking the database URL
**Error:** `could not translate host name "123@localhost" to address`

**Cause:** The database URL format uses `@` to separate credentials from the host. A password containing `@` breaks the parsing — the URL becomes malformed.

**Fix:** Store credentials separately in `.env` and build the URL using `quote_plus()` which automatically encodes special characters:
```python
from urllib.parse import quote_plus
DB_PASSWORD = quote_plus(os.getenv("DB_PASSWORD"))
DATABASE_URL = f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
```
Or simply use a password without special characters.

---

### 6. `%` in URL conflicting with configparser
**Error:** `ValueError: invalid interpolation syntax in 'postgresql://postgres:Sanjeev%40123@...'`

**Cause:** Alembic uses Python's `configparser` which treats `%` as a special interpolation character. The `%40` encoding of `@` triggered this.

**Fix 1:** Double the `%` when setting via `set_main_option`:
```python
config.set_main_option("sqlalchemy.url", DATABASE_URL.replace("%", "%%"))
```

**Fix 2 (simpler):** Use a password without special characters so no encoding is needed.

---

### 7. Alembic not using the DATABASE_URL from `.env`
**Error:** Still connecting with wrong URL despite setting it in `.env`

**Cause:** The `run_migrations_online()` function was using `engine_from_config()` which reads from `alembic.ini` — completely ignoring the `DATABASE_URL` built from `.env`.

**Fix:** Use `create_engine(DATABASE_URL)` directly and set the URL on the config object:
```python
config.set_main_option("sqlalchemy.url", DATABASE_URL.replace("%", "%%"))

def run_migrations_online():
    connectable = create_engine(DATABASE_URL)
    with connectable.connect() as connection:
        context.configure(connection=connection, target_metadata=target_metadata)
        with context.begin_transaction():
            context.run_migrations()
```

---

### 8. `KeyError: 'Airport'` — SQLAlchemy can't find related model
**Error:** `sqlalchemy.exc.InvalidRequestError: When initializing mapper Mapper[Flight(flights)], expression 'Airport' failed to locate a name`

**Cause:** The `Flight` model has a `relationship("Airport", ...)` but the `Airport` class hadn't been imported yet when SQLAlchemy tried to set up the relationship.

**Fix:** Import both models explicitly in `main.py` before anything else, with `Airport` before `Flight`:
```python
from app.models.airports import Airport
from app.models.flights import Flight
```
Order matters — `Airport` must be registered with SQLAlchemy before `Flight` tries to reference it.

---

### 9. `ForeignKeyViolation` when creating a flight
**Error:** `psycopg2.errors.ForeignKeyViolation: insert or update on table "flights" violates foreign key constraint`

**Cause:** The `flights` table has foreign keys pointing to `airports`. When trying to create a flight with `origin_iata = "MAA"` and `destination_iata = "DXB"`, PostgreSQL checked that these codes exist in the `airports` table — and they didn't, because the table was empty.

**Fix:** Seed the airports table with real world airport data before creating flights:
```python
# seed_airports.py
import csv, requests
from app.db.session import SessionLocal
from app.models.airports import Airport

def seed_airports():
    url = "https://raw.githubusercontent.com/davidmegginson/ourairports-data/main/airports.csv"
    response = requests.get(url)
    reader = csv.DictReader(response.text.splitlines())
    db = SessionLocal()
    for row in reader:
        if row["iata_code"] and row["iata_code"] != "0":
            db.merge(Airport(
                iata_code=row["iata_code"],
                name=row["name"],
                city=row["municipality"],
                country=row["iso_country"],
                latitude=float(row["latitude_deg"]),
                longitude=float(row["longitude_deg"])
            ))
    db.commit()
    db.close()
```
Run with: `python -m app.db.seed_airports`

---

### 10. JSON decode error when testing the API
**Error:** `json_invalid — Expecting value`

**Cause:** The JSON request body had invalid values:
- `"departure_month": August` — string instead of integer
- `"departure_day": 0` — invalid day number
- `"departure_time": "9:50 AM"` — wrong time format

**Fix:** JSON is strict. Use correct types:
```json
{
  "departure_month": 8,
  "departure_day": null,
  "departure_time": "09:50"
}
```
- Months are integers (1–12), not strings
- Use `null` for unknown values, not `0`
- Times must be in 24-hour `HH:MM` format

---

