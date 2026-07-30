from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware
import os

# --------------------------------------------------
# Importing Models
# --------------------------------------------------

from app.models.airports import Airport
from app.models.flights import Flight
from app.models.airlines import Airlines
from app.models.users import User


# --------------------------------------------------
# Create FastAPI app
# --------------------------------------------------

app = FastAPI(
    title="Flightlog API",
    description="Personal aviation passport — track every flight you've ever taken",
    version="0.1.0"
)

# --------------------------------------------------
# CORS (frontend integration)
# --------------------------------------------------
DEFAULT_ALLOWED_ORIGINS = "http://localhost:5173,http://192.168.0.53:5173"
allowed_origins = os.getenv("ALLOWED_ORIGINS", DEFAULT_ALLOWED_ORIGINS).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(
    SessionMiddleware,
    secret_key=os.getenv("SECRET_KEY", "your-secret-key")
)

@app.get("/")
def root():
    return {"message": "Flightlog API is running!"}

@app.get("/health")
def health():
    return {"status": "healthy"}

# API calls
from app.api.flights_api import router as flights_router
from app.api.airports_api import router as airports_router
from app.api.airlines_api import router as airlines_router
from app.api.auth_api import router as auth_router
from app.api.tracking_api import router as tracking_router
from app.api.stats_api import router as stats_router
from app.api.public_api import router as public_router

# --------------------------------------------------
# Include Routers
# --------------------------------------------------
app.include_router(flights_router)
app.include_router(airports_router)
app.include_router(airlines_router)
app.include_router(auth_router)
app.include_router(tracking_router)
app.include_router(stats_router)
app.include_router(public_router)