import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapContainer, TileLayer } from 'react-leaflet'
import { flightsApi, airlinesApi } from '../api/flights'
import { useAuth } from '../context/useAuth'
import 'leaflet/dist/leaflet.css'

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;700&family=Syne:wght@700;800&display=swap');

  .db-root {
    min-height: 100vh;
    background: #080b10;
    font-family: 'JetBrains Mono', monospace;
    color: #e8e8e8;
    position: relative;
    overflow-x: hidden;
  }

  .db-map-bg {
    position: absolute;
    inset: 0;
    width: 100%;
    min-height: 100%;
    z-index: 0;
    opacity: 0.55;
    pointer-events: none;
  }

  .db-map-bg .leaflet-container {
    width: 100%;
    height: 100%;
    min-height: 100vh;
    background: #080b10;
  }

  .db-vignette {
    position: absolute;
    inset: 0;
    z-index: 1;
    pointer-events: none;
    background: radial-gradient(ellipse at center, transparent 30%, #080b10 90%);
    min-height: 100%;
  }

  .db-scanlines {
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

  .db-content {
    position: relative;
    z-index: 10;
    max-width: 960px;
    margin: 0 auto;
    padding: 44px 32px;
  }

  .db-header {
    margin-bottom: 52px;
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
  }

  .db-share-btn {
    background: rgba(59,130,246,0.08);
    border: 1px solid rgba(59,130,246,0.25);
    color: #60a5fa;
    border-radius: 4px;
    padding: 8px 16px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.7rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    cursor: pointer;
    transition: background 0.2s;
    margin-top: 4px;
  }

  .db-share-btn:hover { background: rgba(59,130,246,0.16); }

  .db-title {
    font-family: 'Syne', sans-serif;
    font-weight: 800;
    font-size: 2rem;
    letter-spacing: -0.02em;
    color: #fff;
    margin: 0;
  }

  .db-subtitle {
    font-size: 0.72rem;
    color: #4a5568;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    margin-top: 5px;
  }

  /* STATS GRID */
  .db-stats-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 3px;
    margin-bottom: 3px;
  }

  .db-stat-card {
    background: rgba(8,11,16,0.75);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 6px;
    padding: 28px 24px;
    backdrop-filter: blur(18px);
    position: relative;
    overflow: hidden;
    transition: border-color 0.2s, background 0.2s;
  }

  .db-stat-card::before {
    content: '';
    position: absolute;
    left: 0; top: 0; right: 0;
    height: 2px;
    background: linear-gradient(to right, #3b82f6, transparent);
    opacity: 0;
    transition: opacity 0.25s;
  }

  .db-stat-card:hover {
    border-color: rgba(59,130,246,0.22);
    background: rgba(12,17,28,0.88);
  }

  .db-stat-card:hover::before { opacity: 1; }

  .db-stat-label {
    font-size: 0.62rem;
    color: #4a5568;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    margin-bottom: 12px;
  }

  .db-stat-value {
    font-family: 'Syne', sans-serif;
    font-weight: 800;
    font-size: 2.2rem;
    color: #fff;
    letter-spacing: -0.02em;
    line-height: 1;
  }

  .db-stat-unit {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.65rem;
    color: #4a5568;
    letter-spacing: 0.15em;
    margin-top: 6px;
    text-transform: uppercase;
  }

  /* SECOND ROW */
  .db-second-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 3px;
    margin-bottom: 3px;
  }

  .db-card {
    background: rgba(8,11,16,0.75);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 6px;
    padding: 28px 24px;
    backdrop-filter: blur(18px);
    position: relative;
    overflow: hidden;
    transition: border-color 0.2s, background 0.2s;
  }

  .db-card::before {
    content: '';
    position: absolute;
    left: 0; top: 0; bottom: 0;
    width: 2px;
    background: linear-gradient(to bottom, #3b82f6, transparent);
    opacity: 0;
    transition: opacity 0.25s;
  }

  .db-card:hover {
    border-color: rgba(59,130,246,0.22);
    background: rgba(12,17,28,0.88);
  }

  .db-card:hover::before { opacity: 1; }

  .db-card-title {
    font-size: 0.62rem;
    color: #4a5568;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    margin-bottom: 20px;
  }

  /* AIRLINES */
  .db-airline-row {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 14px;
  }

  .db-airline-row:last-child { margin-bottom: 0; }

  .db-airline-logo {
    width: 28px;
    height: 28px;
    object-fit: contain;
    background: #fff;
    border-radius: 4px;
    padding: 2px;
    flex-shrink: 0;
  }

  .db-airline-name {
    font-size: 0.78rem;
    color: #9ca3af;
    flex: 1;
  }

  .db-airline-count {
    font-size: 0.7rem;
    color: #3b82f6;
    letter-spacing: 0.1em;
  }

  /* RECENT FLIGHTS */
  .db-recent-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 0;
    border-bottom: 1px solid rgba(255,255,255,0.04);
  }

  .db-recent-row:last-child { border-bottom: none; }

  .db-recent-route {
    font-family: 'Syne', sans-serif;
    font-weight: 700;
    font-size: 0.9rem;
    color: #f0f4ff;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .db-recent-dot {
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: #3b82f6;
    box-shadow: 0 0 6px #3b82f6;
    flex-shrink: 0;
    animation: db-pulse 2s ease-in-out infinite;
  }

  .db-recent-arrow { color: #3b82f6; font-size: 0.8em; }

  .db-recent-meta {
    font-size: 0.68rem;
    color: #4a5568;
    letter-spacing: 0.08em;
  }

  .db-recent-year {
    font-size: 0.68rem;
    color: #3b82f6;
    letter-spacing: 0.2em;
  }

  /* AIRCRAFT */
  .db-aircraft-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
  }

  .db-aircraft-row:last-child { margin-bottom: 0; }

  .db-aircraft-name {
    font-size: 0.78rem;
    color: #9ca3af;
  }

  .db-aircraft-bar-wrap {
    flex: 1;
    margin: 0 12px;
    height: 2px;
    background: rgba(255,255,255,0.05);
    border-radius: 2px;
    overflow: hidden;
  }

  .db-aircraft-bar {
    height: 100%;
    background: linear-gradient(to right, #3b82f6, #60a5fa);
    border-radius: 2px;
    transition: width 0.8s ease;
  }

  .db-aircraft-count {
    font-size: 0.68rem;
    color: #3b82f6;
    letter-spacing: 0.1em;
    min-width: 20px;
    text-align: right;
  }

  /* QUICK ACTIONS */
  .db-actions-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 3px;
  }

  .db-action-btn {
    background: rgba(8,11,16,0.75);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 6px;
    padding: 20px 24px;
    backdrop-filter: blur(18px);
    cursor: pointer;
    text-align: left;
    transition: border-color 0.2s, background 0.2s;
    font-family: 'JetBrains Mono', monospace;
  }

  .db-action-btn:hover {
    border-color: rgba(59,130,246,0.3);
    background: rgba(12,17,28,0.88);
  }

  .db-action-icon {
    font-size: 1.2rem;
    margin-bottom: 8px;
    display: block;
  }

  .db-action-label {
    font-size: 0.72rem;
    color: #9ca3af;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    display: block;
    margin-bottom: 4px;
  }

  .db-action-desc {
    font-size: 0.65rem;
    color: #4a5568;
    letter-spacing: 0.05em;
  }

  @keyframes db-pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.35; transform: scale(0.55); }
  }

  @media (max-width: 768px) {
    .db-content { padding: 24px 18px; }
    .db-header { flex-direction: column; align-items: flex-start; gap: 16px; }
    .db-stats-grid { grid-template-columns: repeat(2, 1fr); }
    .db-second-grid { grid-template-columns: 1fr; }
    .db-actions-grid { grid-template-columns: 1fr; }
  }
`

function Dashboard() {
  const [flights, setFlights] = useState([])
  const [airlines, setAirlines] = useState([])
  const [loading, setLoading] = useState(true)
  const [linkCopied, setLinkCopied] = useState(false)
  const navigate = useNavigate()
  const { user } = useAuth()

  useEffect(() => {
    flightsApi.getAll()
      .then(res => setFlights(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    airlinesApi.getAll()
      .then(res => setAirlines(res.data || []))
      .catch(() => {})
  }, [])

  const copyShareLink = () => {
    if (!user) return
    navigator.clipboard.writeText(`${window.location.origin}/u/${user.id}`)
    setLinkCopied(true)
    setTimeout(() => setLinkCopied(false), 2000)
  }

  // Compute stats
  const totalFlights = flights.length

  const uniqueCountries = new Set(
    flights.flatMap(f => [f.origin_iata?.slice(0, 2), f.destination_iata?.slice(0, 2)])
  ).size

  const uniqueAirports = new Set(
    flights.flatMap(f => [f.origin_iata, f.destination_iata])
  ).size

  const totalHours = Math.round(
    flights.reduce((acc, f) => acc + (f.duration_minutes || 0), 0) / 60
  )

  // Airlines with count
  const airlineMap = {}
  flights.forEach(f => {
    if (f.airline) airlineMap[f.airline] = (airlineMap[f.airline] || 0) + 1
  })
  const topAirlines = Object.entries(airlineMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)

  // Aircraft with count
  const aircraftMap = {}
  flights.forEach(f => {
    if (f.aircraft_type) aircraftMap[f.aircraft_type] = (aircraftMap[f.aircraft_type] || 0) + 1
  })
  const topAircraft = Object.entries(aircraftMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)

  const maxAircraftCount = topAircraft[0]?.[1] || 1

  // Recent flights
  const recentFlights = [...flights]
    .sort((a, b) => b.departure_year - a.departure_year)
    .slice(0, 4)

  // Get airline IATA from the airlines reference table, falling back to the flight number prefix
  const getAirlineCode = (airline) => {
    const known = airlines.find(a => a.name === airline)
    if (known?.iata_code) return known.iata_code

    const match = flights.find(f => f.airline === airline)
    if (match?.flight_number && match.flight_number.length >= 2) {
      return match.flight_number.substring(0, 2).toUpperCase()
    }
    return null
  }

  return (
    <>
      <style>{styles}</style>
      <div className="db-root">

        {/* Real map background */}
        <div className="db-map-bg">
          <MapContainer
            center={[20, 10]} zoom={2} minZoom={2} maxZoom={2}
            zoomControl={false} dragging={false} scrollWheelZoom={false}
            doubleClickZoom={false} touchZoom={false} boxZoom={false}
            keyboard={false} attributionControl={false}
          >
            <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
          </MapContainer>
        </div>

        <div className="db-vignette" />
        <div className="db-scanlines" />

        <div className="db-content">

          {/* HEADER */}
          <header className="db-header">
            <div>
              <h1 className="db-title">Dashboard</h1>
              <p className="db-subtitle">Your aviation passport at a glance</p>
            </div>
            <button className="db-share-btn" onClick={copyShareLink}>
              {linkCopied ? 'Link copied!' : 'Copy share link'}
            </button>
          </header>

          {loading ? (
            <p style={{ color: '#374151', fontSize: '0.82rem', letterSpacing: '0.1em' }}>
              Loading...
            </p>
          ) : (
            <>
              {/* TOP STATS */}
              <div className="db-stats-grid">
                <div className="db-stat-card">
                  <div className="db-stat-label">Total Flights</div>
                  <div className="db-stat-value">{totalFlights}</div>
                  <div className="db-stat-unit">flights logged</div>
                </div>
                <div className="db-stat-card">
                  <div className="db-stat-label">Hours in Air</div>
                  <div className="db-stat-value">{totalHours}</div>
                  <div className="db-stat-unit">hours total</div>
                </div>
                <div className="db-stat-card">
                  <div className="db-stat-label">Airports</div>
                  <div className="db-stat-value">{uniqueAirports}</div>
                  <div className="db-stat-unit">unique airports</div>
                </div>
                <div className="db-stat-card">
                  <div className="db-stat-label">Airlines</div>
                  <div className="db-stat-value">{Object.keys(airlineMap).length}</div>
                  <div className="db-stat-unit">airlines flown</div>
                </div>
              </div>

              {/* AIRLINES + RECENT */}
              <div className="db-second-grid" style={{ marginTop: '3px' }}>

                {/* Airlines */}
                <div className="db-card">
                  <div className="db-card-title">Airlines flown</div>
                  {topAirlines.map(([airline, count]) => {
                    const code = getAirlineCode(airline)
                    return (
                      <div key={airline} className="db-airline-row">
                        {code && (
                          <img
                            src={`https://images.kiwi.com/airlines/64/${code}.png`}
                            alt={airline}
                            className="db-airline-logo"
                            onError={(e) => { e.target.style.display = 'none' }}
                          />
                        )}
                        <span className="db-airline-name">{airline}</span>
                        <span className="db-airline-count">{count}x</span>
                      </div>
                    )
                  })}
                </div>

                {/* Recent flights */}
                <div className="db-card">
                  <div className="db-card-title">Recent flights</div>
                  {recentFlights.map(flight => (
                    <div key={flight.id} className="db-recent-row">
                      <div>
                        <div className="db-recent-route">
                          <span className="db-recent-dot" />
                          {flight.origin_iata}
                          <span className="db-recent-arrow">→</span>
                          {flight.destination_iata}
                        </div>
                        <div className="db-recent-meta" style={{ marginTop: '3px' }}>
                          {flight.airline} · {flight.aircraft_type}
                        </div>
                      </div>
                      <span className="db-recent-year">{flight.departure_year}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* AIRCRAFT */}
              <div className="db-card" style={{ marginTop: '3px' }}>
                <div className="db-card-title">Aircraft flown</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 40px' }}>
                  {topAircraft.map(([aircraft, count]) => (
                    <div key={aircraft} className="db-aircraft-row">
                      <span className="db-aircraft-name">{aircraft}</span>
                      <div className="db-aircraft-bar-wrap">
                        <div
                          className="db-aircraft-bar"
                          style={{ width: `${(count / maxAircraftCount) * 100}%` }}
                        />
                      </div>
                      <span className="db-aircraft-count">{count}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* QUICK ACTIONS */}
              {/* <div className="db-actions-grid" style={{ marginTop: '3px' }}>
                <button className="db-action-btn" onClick={() => navigate('/add-flight')}>
                  <span className="db-action-icon">✈</span>
                  <span className="db-action-label">Log a flight</span>
                  <span className="db-action-desc">Add a new flight to your passport</span>
                </button>
                <button className="db-action-btn" onClick={() => navigate('/map')}>
                  <span className="db-action-icon">🗺</span>
                  <span className="db-action-label">View map</span>
                  <span className="db-action-desc">See all your routes on the world map</span>
                </button>
                <button className="db-action-btn" onClick={() => navigate('/flights')}>
                  <span className="db-action-icon">📋</span>
                  <span className="db-action-label">All flights</span>
                  <span className="db-action-desc">Browse your complete flight history</span>
                </button>
              </div> */}
            </>
          )}
        </div>
      </div>
    </>
  )
}

export default Dashboard