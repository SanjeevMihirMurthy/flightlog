# Flightlog ✈️

A personal aviation passport — log every flight you've ever taken,
visualise your routes on a world map, and explore rich stats about
your flying history.

## Tech Stack
- **Backend:** Python + FastAPI + PostgreSQL + SQLAlchemy
- **Frontend:** ReactJS + Leaflet
- **AI (coming soon):** Claude API

## Project Structure
flightlog/
├── backend/        # FastAPI app
├── frontend/       # React app
├── docs/           # Architecture notes
└── docker-compose.yml

## Getting Started

### Backend
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload

### Frontend
cd frontend
npm install
npm run dev

## Project Status
🚧 Phase 1 — Project setup and database schema