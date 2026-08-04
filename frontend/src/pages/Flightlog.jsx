import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapContainer, TileLayer } from 'react-leaflet'
import { flightsApi } from '../api/flights'
import 'leaflet/dist/leaflet.css'

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;700&family=Syne:wght@700;800&display=swap');

  .fl-root {
    min-height: 100vh;
    background: #080b10;
    font-family: 'JetBrains Mono', monospace;
    color: #e8e8e8;
    position: relative;
    overflow-x: hidden;
  }

  .fl-map-bg {
    position: absolute;
    inset: 0;
    width: 100%;
    min-height: 100%;
    z-index: 0;
    opacity: 0.55;
    pointer-events: none;
  }

  .fl-map-bg .leaflet-container {
    width: 100%;
    height: 100%;
    min-height: 100vh;
    background: #080b10;
  }

  .fl-vignette {
    position: absolute;
    inset: 0;
    z-index: 1;
    pointer-events: none;
    background: radial-gradient(ellipse at center, transparent 30%, #080b10 90%);
    min-height: 100%;
  }

  .fl-scanlines {
    position: absolute;
    inset: 0;
    z-index: 2;
    pointer-events: none;
    min-height: 100%;
    background-image: repeating-linear-gradient(
      0deg,
      transparent,
      transparent 2px,
      rgba(0,0,0,0.08) 2px,
      rgba(0,0,0,0.08) 4px
    );
  }

  .fl-content {
    position: relative;
    z-index: 10;
    max-width: 960px;
    margin: 0 auto;
    padding: 44px 32px;
  }

  .fl-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 48px;
  }

  .fl-title {
    font-family: 'Syne', sans-serif;
    font-weight: 800;
    font-size: 2rem;
    letter-spacing: -0.02em;
    color: #fff;
    margin: 0;
  }

  .fl-subtitle {
    font-size: 0.72rem;
    color: #4a5568;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    margin-top: 5px;
  }

  .fl-header-actions { display: flex; gap: 10px; }

  .fl-btn-ghost {
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.1);
    color: #6b7280;
    padding: 8px 18px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.78rem;
    letter-spacing: 0.06em;
    cursor: pointer;
    border-radius: 4px;
    backdrop-filter: blur(8px);
    transition: all 0.2s;
  }
  .fl-btn-ghost:hover {
    background: rgba(255,255,255,0.08);
    color: #d1d5db;
    border-color: rgba(255,255,255,0.2);
  }

  .fl-btn-primary {
    background: #2563eb;
    border: none;
    color: #fff;
    padding: 9px 20px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.78rem;
    letter-spacing: 0.05em;
    cursor: pointer;
    border-radius: 4px;
    transition: background 0.2s;
  }
  .fl-btn-primary:hover { background: #1d4ed8; }

  .fl-list {
    display: flex;
    flex-direction: column;
    gap: 3px;
  }

  .fl-card {
    background: rgba(8, 11, 16, 0.75);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 6px;
    padding: 22px 28px;
    backdrop-filter: blur(18px);
    -webkit-backdrop-filter: blur(18px);
    transition: border-color 0.2s, background 0.2s;
    position: relative;
    overflow: hidden;
    cursor: default;
  }

  .fl-card::before {
    content: '';
    position: absolute;
    left: 0; top: 0; bottom: 0;
    width: 2px;
    background: linear-gradient(to bottom, #3b82f6, transparent);
    opacity: 0;
    transition: opacity 0.25s;
  }

  .fl-card:hover {
    border-color: rgba(59,130,246,0.22);
    background: rgba(12,17,28,0.88);
  }
  .fl-card:hover::before { opacity: 1; }

  .fl-card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 5px;
  }

  .fl-route {
    font-family: 'Syne', sans-serif;
    font-weight: 700;
    font-size: 1rem;
    color: #f0f4ff;
    letter-spacing: 0.04em;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .fl-route-dot {
    width: 5px; height: 5px;
    border-radius: 50%;
    background: #3b82f6;
    box-shadow: 0 0 6px #3b82f6;
    flex-shrink: 0;
    animation: fl-pulse 2s ease-in-out infinite;
  }

  .fl-route-arrow { color: #3b82f6; font-size: 0.8em; }

  .fl-year {
    font-size: 0.7rem;
    color: #3b82f6;
    letter-spacing: 0.2em;
    font-weight: 500;
  }

  .fl-card-header-right { display: flex; align-items: center; gap: 12px; }
  .fl-card-actions { display: flex; gap: 6px; }
  .fl-icon-btn {
    background: transparent; border: 1px solid rgba(255,255,255,0.08);
    border-radius: 4px; width: 26px; height: 26px;
    display: flex; align-items: center; justify-content: center;
    color: #4a5568; cursor: pointer; font-size: 0.78rem; transition: all 0.2s;
  }
  .fl-icon-btn:hover { color: #93c5fd; border-color: rgba(59,130,246,0.35); background: rgba(59,130,246,0.08); }
  .fl-icon-btn-danger:hover { color: #f87171; border-color: rgba(239,68,68,0.35); background: rgba(239,68,68,0.08); }

  .fl-confirm { display: flex; align-items: center; gap: 8px; }
  .fl-confirm-text { font-size: 0.66rem; color: #f87171; letter-spacing: 0.05em; text-transform: uppercase; }
  .fl-confirm-yes, .fl-confirm-no {
    font-family: 'JetBrains Mono', monospace; font-size: 0.66rem; letter-spacing: 0.05em;
    padding: 4px 10px; border-radius: 4px; cursor: pointer; transition: all 0.2s;
  }
  .fl-confirm-yes { background: rgba(239,68,68,0.15); border: 1px solid rgba(239,68,68,0.4); color: #fca5a5; }
  .fl-confirm-yes:hover { background: rgba(239,68,68,0.25); }
  .fl-confirm-yes:disabled { opacity: 0.5; cursor: not-allowed; }
  .fl-confirm-no { background: transparent; border: 1px solid rgba(255,255,255,0.1); color: #6b7280; }
  .fl-confirm-no:hover { color: #9ca3af; border-color: rgba(255,255,255,0.2); }

  .fl-meta {
    font-size: 0.7rem;
    color: #4a5568;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    margin-bottom: 10px;
  }

  .fl-notes {
    font-size: 0.8rem;
    color: #6b7280;
    line-height: 1.65;
    font-weight: 300;
    max-width: 82%;
  }

  .fl-empty { color: #374151; font-size: 0.85rem; padding: 3rem 0; }
  .fl-loading { color: #374151; font-size: 0.82rem; letter-spacing: 0.1em; padding: 3rem 0; }

  @keyframes fl-pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.35; transform: scale(0.55); }
  }
  .fl-card:nth-child(2) .fl-route-dot { animation-delay: 0.5s; }
  .fl-card:nth-child(3) .fl-route-dot { animation-delay: 1s; }
  .fl-card:nth-child(4) .fl-route-dot { animation-delay: 1.5s; }
  .fl-card:nth-child(5) .fl-route-dot { animation-delay: 2s; }

  @media (max-width: 768px) {
    .fl-content { padding: 24px 18px; }
    .fl-header { flex-direction: column; align-items: flex-start; gap: 14px; }
    .fl-card { padding: 16px 18px; }
    .fl-notes { max-width: 100%; }
  }
`

function FlightLog() {
  const [flights, setFlights] = useState([])
  const [loading, setLoading] = useState(true)
  const [confirmDeleteId, setConfirmDeleteId] = useState(null)
  const [deletingId, setDeletingId] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    flightsApi.getAll()
      .then(res => setFlights(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false))
  }, [])

  const handleDelete = async (id) => {
    setDeletingId(id)
    try {
      await flightsApi.delete(id)
      setFlights(prev => prev.filter(f => f.id !== id))
    } catch (err) {
      console.error(err)
    } finally {
      setDeletingId(null)
      setConfirmDeleteId(null)
    }
  }

  return (
    <>
      <style>{styles}</style>
      <div className="fl-root">

        {/* Real map background */}
        <div className="fl-map-bg">
          <MapContainer
            center={[20, 10]} zoom={2} minZoom={2} maxZoom={2}
            zoomControl={false} dragging={false} scrollWheelZoom={false}
            doubleClickZoom={false} touchZoom={false} boxZoom={false}
            keyboard={false} attributionControl={false}
          >
            <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
          </MapContainer>
        </div>

        <div className="fl-vignette" />
        <div className="fl-scanlines" />

        <div className="fl-content">
          <header className="fl-header">
            <div>
              <h1 className="fl-title">My Flights</h1>
              <p className="fl-subtitle">{loading ? '—' : flights.length} flights logged</p>
            </div>
            <div className="fl-header-actions">
              <button className="fl-btn-ghost" onClick={() => navigate('/map')}>🗺 Map</button>
              <button className="fl-btn-primary" onClick={() => navigate('/add-flight')}>+ Log Flight</button>
            </div>
          </header>

          <div className="fl-list">
            {loading ? (
              <p className="fl-loading">Loading flights...</p>
            ) : flights.length === 0 ? (
              <p className="fl-empty">No flights logged yet.</p>
            ) : (
              flights.map(flight => (
                <div key={flight.id} className="fl-card">
                  <div className="fl-card-header">
                    <div className="fl-route">
                      <span className="fl-route-dot" />
                      {flight.origin_iata}
                      <span className="fl-route-arrow">→</span>
                      {flight.destination_iata}
                    </div>
                    <div className="fl-card-header-right">
                      <span className="fl-year">{flight.departure_year}</span>
                      {confirmDeleteId === flight.id ? (
                        <div className="fl-confirm">
                          <span className="fl-confirm-text">Delete?</span>
                          <button
                            className="fl-confirm-yes"
                            onClick={() => handleDelete(flight.id)}
                            disabled={deletingId === flight.id}
                          >
                            {deletingId === flight.id ? "..." : "Yes"}
                          </button>
                          <button className="fl-confirm-no" onClick={() => setConfirmDeleteId(null)}>Cancel</button>
                        </div>
                      ) : (
                        <div className="fl-card-actions">
                          <button
                            className="fl-icon-btn"
                            title="Edit flight"
                            onClick={() => navigate(`/edit-flight/${flight.id}`)}
                          >
                            ✎
                          </button>
                          <button
                            className="fl-icon-btn fl-icon-btn-danger"
                            title="Delete flight"
                            onClick={() => setConfirmDeleteId(flight.id)}
                          >
                            🗑
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="fl-meta">
                    {flight.airline} · {flight.aircraft_type} · {flight.cabin_class}
                  </div>
                  {flight.notes && (
                    <div className="fl-notes">{flight.notes}</div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export default FlightLog
