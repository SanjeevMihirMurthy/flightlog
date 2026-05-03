import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { flightsApi } from '../api/flights'

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Syne:wght@700;800&display=swap');

  .fl-root {
    min-height: 100vh;
    background: #080b10;
    font-family: 'DM Mono', monospace;
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

  .fl-map-bg svg {
    width: 100%;
    height: 100%;
    min-height: 100vh;
    display: block;
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
    font-family: 'DM Mono', monospace;
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
    font-family: 'DM Mono', monospace;
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
`

function FlightLog() {
  const [flights, setFlights] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    flightsApi.getAll()
      .then(res => setFlights(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false))
  }, [])

  return (
    <>
      <style>{styles}</style>
      <div className="fl-root">

        {/* Inline JSX SVG — no dangerouslySetInnerHTML, filter IDs are scoped */}
        <div className="fl-map-bg">
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
            {/* Continents */}
            <path d="M95,120 L130,110 L180,108 L230,115 L270,130 L290,155 L310,180 L305,210 L285,240 L260,265 L240,290 L220,310 L200,330 L195,355 L210,370 L220,380 L210,390 L190,385 L170,370 L155,350 L145,330 L135,305 L125,280 L120,250 L112,220 L100,190 L92,160 Z" fill="#111827" stroke="#1e3a5f" strokeWidth="1" opacity="0.95"/>
            <path d="M290,60 L330,55 L370,65 L385,90 L375,115 L350,125 L320,118 L300,100 Z" fill="#111827" stroke="#1e3a5f" strokeWidth="0.8" opacity="0.85"/>
            <path d="M215,405 L250,410 L285,415 L315,420 L335,440 L345,470 L340,510 L325,545 L305,575 L280,600 L260,615 L245,605 L235,580 L225,550 L215,520 L210,490 L205,460 L205,435 Z" fill="#111827" stroke="#1e3a5f" strokeWidth="1" opacity="0.95"/>
            <path d="M620,100 L650,95 L680,100 L710,108 L730,120 L740,140 L730,155 L710,160 L695,170 L680,165 L665,155 L650,148 L635,140 L625,128 Z" fill="#111827" stroke="#1e3a5f" strokeWidth="0.9" opacity="0.95"/>
            <path d="M655,70 L670,60 L685,65 L690,80 L680,95 L665,100 L655,88 Z" fill="#111827" stroke="#1e3a5f" strokeWidth="0.7" opacity="0.8"/>
            <path d="M640,200 L680,195 L715,198 L740,215 L755,245 L760,280 L758,315 L748,350 L730,385 L710,415 L690,440 L670,455 L650,450 L630,435 L618,410 L610,375 L608,340 L612,305 L618,270 L622,235 Z" fill="#111827" stroke="#1e3a5f" strokeWidth="1" opacity="0.95"/>
            <path d="M730,90 L790,80 L860,75 L930,80 L1000,85 L1060,90 L1110,100 L1140,115 L1155,135 L1145,155 L1120,168 L1090,175 L1060,180 L1030,190 L1010,210 L1000,230 L980,245 L955,250 L930,248 L905,255 L885,270 L870,285 L855,295 L840,290 L825,278 L810,268 L795,260 L780,255 L765,248 L750,238 L740,222 L735,205 L730,188 L728,165 L725,140 Z" fill="#111827" stroke="#1e3a5f" strokeWidth="1" opacity="0.95"/>
            <path d="M855,255 L885,270 L900,295 L910,325 L905,355 L888,370 L870,360 L855,340 L845,315 L840,288 Z" fill="#111827" stroke="#1e3a5f" strokeWidth="0.8" opacity="0.9"/>
            <path d="M740,200 L765,205 L780,215 L790,235 L785,260 L770,270 L752,265 L738,248 L732,228 Z" fill="#111827" stroke="#1e3a5f" strokeWidth="0.8" opacity="0.9"/>
            <path d="M1050,450 L1110,440 L1160,445 L1195,460 L1210,485 L1205,515 L1185,538 L1155,548 L1120,545 L1085,535 L1060,515 L1042,490 L1040,465 Z" fill="#111827" stroke="#1e3a5f" strokeWidth="0.9" opacity="0.9"/>
            <path d="M607,112 L618,108 L625,118 L618,128 L607,125 Z" fill="#111827" stroke="#1e3a5f" strokeWidth="0.6" opacity="0.8"/>
            {/* Filters — prefixed IDs to avoid conflicts */}
            <defs>
              <filter id="fl-glow-blue">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
              </filter>
              <filter id="fl-glow-soft">
                <feGaussianBlur stdDeviation="6" result="coloredBlur"/>
                <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
              </filter>
            </defs>
            {/* Glow halos */}
            <path d="M940,230 Q780,60 618,128" fill="none" stroke="#1d4ed8" strokeWidth="6" opacity="0.12" filter="url(#fl-glow-soft)"/>
            <path d="M940,230 Q700,100 260,165" fill="none" stroke="#2563eb" strokeWidth="5" opacity="0.10" filter="url(#fl-glow-soft)"/>
            <path d="M1020,370 Q980,300 940,230" fill="none" stroke="#1e40af" strokeWidth="5" opacity="0.10" filter="url(#fl-glow-soft)"/>
            <path d="M900,295 Q920,262 940,230" fill="none" stroke="#1d4ed8" strokeWidth="5" opacity="0.10" filter="url(#fl-glow-soft)"/>
            {/* Flight paths */}
            <path d="M940,230 Q780,60 618,128" fill="none" stroke="#3b82f6" strokeWidth="1.2" opacity="0.7" filter="url(#fl-glow-blue)" strokeDasharray="5,3"/>
            <path d="M940,230 Q700,100 260,165" fill="none" stroke="#60a5fa" strokeWidth="1.2" opacity="0.6" filter="url(#fl-glow-blue)" strokeDasharray="5,3"/>
            <path d="M1020,370 Q980,300 940,230" fill="none" stroke="#3b82f6" strokeWidth="1.2" opacity="0.65" filter="url(#fl-glow-blue)" strokeDasharray="4,3"/>
            <path d="M900,295 Q920,262 940,230" fill="none" stroke="#60a5fa" strokeWidth="1.2" opacity="0.65" filter="url(#fl-glow-blue)" strokeDasharray="4,3"/>
            {/* Airport dots */}
            <circle cx="940" cy="230" r="5" fill="#3b82f6" opacity="0.9" filter="url(#fl-glow-blue)"/>
            <circle cx="940" cy="230" r="2.5" fill="#93c5fd"/>
            <circle cx="618" cy="128" r="4" fill="#3b82f6" opacity="0.85" filter="url(#fl-glow-blue)"/>
            <circle cx="618" cy="128" r="2" fill="#93c5fd"/>
            <circle cx="260" cy="165" r="4" fill="#3b82f6" opacity="0.8" filter="url(#fl-glow-blue)"/>
            <circle cx="260" cy="165" r="2" fill="#93c5fd"/>
            <circle cx="1020" cy="370" r="4" fill="#3b82f6" opacity="0.8" filter="url(#fl-glow-blue)"/>
            <circle cx="1020" cy="370" r="2" fill="#93c5fd"/>
            <circle cx="900" cy="295" r="4" fill="#3b82f6" opacity="0.8" filter="url(#fl-glow-blue)"/>
            <circle cx="900" cy="295" r="2" fill="#93c5fd"/>
          </svg>
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
                    <span className="fl-year">{flight.departure_year}</span>
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
