import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { flightsApi } from '../api/flights'

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Syne:wght@700;800&display=swap');

  .db-root {
    min-height: 100vh;
    background: #080b10;
    font-family: 'DM Mono', monospace;
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

  .db-map-bg svg {
    width: 100%;
    height: 100%;
    min-height: 100vh;
    display: block;
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
  }

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
    font-family: 'DM Mono', monospace;
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
    font-family: 'DM Mono', monospace;
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
`

function Dashboard() {
  const [flights, setFlights] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    flightsApi.getAll()
      .then(res => setFlights(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false))
  }, [])

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

  // Get airline IATA from flight number
  const getAirlineCode = (airline) => {
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

        {/* SVG background — same as FlightLog */}
        <div className="db-map-bg">
          <svg viewBox="0 0 1440 810" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
            <rect width="1440" height="810" fill="#080b10"/>
            <g stroke="#1a2235" strokeWidth="0.5" opacity="0.9">
              {[81,162,243,324,405,486,567,648,729].map(y =>
                <line key={`h${y}`} x1="0" y1={y} x2="1440" y2={y}/>
              )}
              {[144,288,432,576,720,864,1008,1152,1296].map(x =>
                <line key={`v${x}`} x1={x} y1="0" x2={x} y2="810"/>
              )}
            </g>
            <path d="M95,120 L130,110 L180,108 L230,115 L270,130 L290,155 L310,180 L305,210 L285,240 L260,265 L240,290 L220,310 L200,330 L195,355 L210,370 L220,380 L210,390 L190,385 L170,370 L155,350 L145,330 L135,305 L125,280 L120,250 L112,220 L100,190 L92,160 Z" fill="#111827" stroke="#1e3a5f" strokeWidth="1" opacity="0.95"/>
            <path d="M290,60 L330,55 L370,65 L385,90 L375,115 L350,125 L320,118 L300,100 Z" fill="#111827" stroke="#1e3a5f" strokeWidth="0.8" opacity="0.85"/>
            <path d="M215,405 L250,410 L285,415 L315,420 L335,440 L345,470 L340,510 L325,545 L305,575 L280,600 L260,615 L245,605 L235,580 L225,550 L215,520 L210,490 L205,460 L205,435 Z" fill="#111827" stroke="#1e3a5f" strokeWidth="1" opacity="0.95"/>
            <path d="M620,100 L650,95 L680,100 L710,108 L730,120 L740,140 L730,155 L710,160 L695,170 L680,165 L665,155 L650,148 L635,140 L625,128 Z" fill="#111827" stroke="#1e3a5f" strokeWidth="0.9" opacity="0.95"/>
            <path d="M655,70 L670,60 L685,65 L690,80 L680,95 L665,100 L655,88 Z" fill="#111827" stroke="#1e3a5f" strokeWidth="0.7" opacity="0.8"/>
            <path d="M640,200 L680,195 L715,198 L740,215 L755,245 L760,280 L758,315 L748,350 L730,385 L710,415 L690,440 L670,455 L650,450 L630,435 L618,410 L610,375 L608,340 L612,305 L618,270 L622,235 Z" fill="#111827" stroke="#1e3a5f" strokeWidth="1" opacity="0.95"/>
            <path d="M730,90 L790,80 L860,75 L930,80 L1000,85 L1060,90 L1110,100 L1140,115 L1155,135 L1145,155 L1120,168 L1090,175 L1060,180 L1030,190 L1010,210 L1000,230 L980,245 L955,250 L930,248 L905,255 L885,270 L870,285 L855,295 L840,290 L825,278 L810,268 L795,260 L780,255 L765,248 L750,238 L740,222 L735,205 L730,188 L728,165 L725,140 Z" fill="#111827" stroke="#1e3a5f" strokeWidth="1" opacity="0.95"/>
            <path d="M855,255 L885,270 L900,295 L910,325 L905,355 L888,370 L870,360 L855,340 L845,315 L840,288 Z" fill="#111827" stroke="#1e3a5f" strokeWidth="0.8" opacity="0.9"/>
            <path d="M1050,450 L1110,440 L1160,445 L1195,460 L1210,485 L1205,515 L1185,538 L1155,548 L1120,545 L1085,535 L1060,515 L1042,490 L1040,465 Z" fill="#111827" stroke="#1e3a5f" strokeWidth="0.9" opacity="0.9"/>
            <defs>
              <filter id="db-glow-blue">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
              </filter>
              <filter id="db-glow-soft">
                <feGaussianBlur stdDeviation="6" result="coloredBlur"/>
                <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
              </filter>
            </defs>
            <path d="M940,230 Q780,60 618,128" fill="none" stroke="#1d4ed8" strokeWidth="6" opacity="0.12" filter="url(#db-glow-soft)"/>
            <path d="M940,230 Q700,100 260,165" fill="none" stroke="#2563eb" strokeWidth="5" opacity="0.10" filter="url(#db-glow-soft)"/>
            <path d="M1020,370 Q980,300 940,230" fill="none" stroke="#1e40af" strokeWidth="5" opacity="0.10" filter="url(#db-glow-soft)"/>
            <path d="M940,230 Q780,60 618,128" fill="none" stroke="#3b82f6" strokeWidth="1.2" opacity="0.7" filter="url(#db-glow-blue)" strokeDasharray="5,3"/>
            <path d="M940,230 Q700,100 260,165" fill="none" stroke="#60a5fa" strokeWidth="1.2" opacity="0.6" filter="url(#db-glow-blue)" strokeDasharray="5,3"/>
            <path d="M1020,370 Q980,300 940,230" fill="none" stroke="#3b82f6" strokeWidth="1.2" opacity="0.65" filter="url(#db-glow-blue)" strokeDasharray="4,3"/>
            <circle cx="940" cy="230" r="5" fill="#3b82f6" opacity="0.9" filter="url(#db-glow-blue)"/>
            <circle cx="940" cy="230" r="2.5" fill="#93c5fd"/>
            <circle cx="618" cy="128" r="4" fill="#3b82f6" opacity="0.85" filter="url(#db-glow-blue)"/>
            <circle cx="618" cy="128" r="2" fill="#93c5fd"/>
            <circle cx="260" cy="165" r="4" fill="#3b82f6" opacity="0.8" filter="url(#db-glow-blue)"/>
            <circle cx="260" cy="165" r="2" fill="#93c5fd"/>
            <circle cx="1020" cy="370" r="4" fill="#3b82f6" opacity="0.8" filter="url(#db-glow-blue)"/>
            <circle cx="1020" cy="370" r="2" fill="#93c5fd"/>
          </svg>
        </div>

        <div className="db-vignette" />
        <div className="db-scanlines" />

        <div className="db-content">

          {/* HEADER */}
          <header className="db-header">
            <h1 className="db-title">Dashboard</h1>
            <p className="db-subtitle">Your aviation passport at a glance</p>
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
              <div className="db-actions-grid" style={{ marginTop: '3px' }}>
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
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
}

export default Dashboard