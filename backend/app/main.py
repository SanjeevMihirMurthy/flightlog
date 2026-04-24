from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# --------------------------------------------------
# Importing Models
# --------------------------------------------------

from app.models.airports import Airport
from app.models.flights import Flight


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
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
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


# --------------------------------------------------
# Include Routers
# --------------------------------------------------
app.include_router(flights_router)
app.include_router(airports_router)