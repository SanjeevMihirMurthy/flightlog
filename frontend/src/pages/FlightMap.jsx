import React, { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet'
import { flightsApi, airportsApi } from '../api/flights'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const createAirlineMarker = (airlineCode) => L.divIcon({
  html: `
    <div style="
      width: 34px; height: 34px; border-radius: 50%;
      background: #fff; border: 2px solid #3b82f6;
      display: flex; align-items: center; justify-content: center;
      overflow: hidden; box-shadow: 0 0 14px rgba(59,130,246,0.5), 0 0 4px rgba(59,130,246,0.8);
    ">
      <img src="https://images.kiwi.com/airlines/64/${airlineCode}.png"
        style="width: 22px; height: 22px; object-fit: contain;"
        onerror="this.src='https://www.gstatic.com/images/icons/material/system/2x/flight_black_24dp.png'"
      />
    </div>`,
  className: '',
  iconSize: [34, 34],
  iconAnchor: [17, 17],
  popupAnchor: [0, -18]
})

const glowingMarker = L.divIcon({
  className: '',
  html: `<div style="
    width: 8px; height: 8px;
    background: #60a5fa; border-radius: 50%;
    box-shadow: 0 0 8px #60a5fa, 0 0 2px #93c5fd;
    border: 1.5px solid rgba(255,255,255,0.6);
  "></div>`,
  iconSize: [8, 8],
  iconAnchor: [4, 4]
})

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Syne:wght@700;800&display=swap');

  .fm-root {
    position: fixed; inset: 0; background: #080b10;
    font-family: 'DM Mono', monospace;
  }

  /* Leaflet popup override */
  .leaflet-popup-content-wrapper {
    background: rgba(8,11,16,0.95) !important;
    border: 1px solid rgba(59,130,246,0.25) !important;
    border-radius: 6px !important;
    box-shadow: 0 0 20px rgba(59,130,246,0.15) !important;
    backdrop-filter: blur(12px) !important;
    color: #e8e8e8 !important;
    font-family: 'DM Mono', monospace !important;
    font-size: 0.78rem !important;
  }
  .leaflet-popup-tip { background: rgba(8,11,16,0.95) !important; }
  .leaflet-popup-close-button { color: #4a5568 !important; }
  .leaflet-popup-close-button:hover { color: #9ca3af !important; }

  /* ── HEADER ── */
  .fm-header {
    position: absolute; top: 0; left: 0; z-index: 1000;
    padding: 36px 40px; pointer-events: none;
  }
  .fm-title {
    font-family: 'Syne', sans-serif; font-weight: 800;
    font-size: 1.6rem; letter-spacing: -0.02em; color: #fff; margin: 0;
  }
  .fm-subtitle {
    font-size: 0.68rem; color: #4a5568; letter-spacing: 0.18em;
    text-transform: uppercase; margin-top: 5px;
  }
  .fm-header-actions {
    display: flex; gap: 8px; margin-top: 18px; pointer-events: all;
  }
  .fm-btn-ghost {
    background: rgba(8,11,16,0.8); border: 1px solid rgba(255,255,255,0.1);
    color: #6b7280; padding: 7px 16px; font-family: 'DM Mono', monospace;
    font-size: 0.75rem; letter-spacing: 0.06em; cursor: pointer;
    border-radius: 4px; backdrop-filter: blur(12px); transition: all 0.2s;
  }
  .fm-btn-ghost:hover { background: rgba(255,255,255,0.08); color: #d1d5db; border-color: rgba(255,255,255,0.2); }
  .fm-btn-primary {
    background: #2563eb; border: none; color: #fff; padding: 7px 16px;
    font-family: 'DM Mono', monospace; font-size: 0.75rem; letter-spacing: 0.05em;
    cursor: pointer; border-radius: 4px; transition: background 0.2s;
  }
  .fm-btn-primary:hover { background: #1d4ed8; }

  /* ── LEGEND ── */
  .fm-legend {
    position: absolute; top: 36px; right: 36px; z-index: 1000;
    background: rgba(8,11,16,0.88); backdrop-filter: blur(16px);
    border: 1px solid rgba(255,255,255,0.07); border-radius: 6px;
    padding: 18px 20px; min-width: 200px;
  }

  .fm-legend-section { margin-bottom: 20px; }
  .fm-legend-section:last-child { margin-bottom: 0; }

  .fm-legend-heading {
    font-size: 0.62rem; color: #1e3a5f; letter-spacing: 0.2em;
    text-transform: uppercase; margin-bottom: 12px;
    padding-bottom: 8px; border-bottom: 1px solid #0f1929;
  }

  .fm-legend-airline {
    display: flex; align-items: center; gap: 10px; margin-bottom: 10px;
  }
  .fm-legend-airline:last-child { margin-bottom: 0; }
  .fm-legend-airline-logo {
    width: 26px; height: 26px; object-fit: contain;
    background: #fff; border-radius: 4px; padding: 2px; flex-shrink: 0;
  }
  .fm-legend-airline-name { font-size: 0.76rem; color: #9ca3af; }

  .fm-legend-line-row {
    display: flex; align-items: center; gap: 10px; margin-bottom: 8px;
  }
  .fm-legend-line-row:last-child { margin-bottom: 0; }
  .fm-legend-line {
    width: 28px; height: 1.5px; background: #3b82f6;
    border-top: 1.5px dashed #3b82f6; flex-shrink: 0;
  }
  .fm-legend-dot-row {
    display: flex; align-items: center; gap: 10px; margin-bottom: 8px;
  }
  .fm-legend-dot {
    width: 8px; height: 8px; border-radius: 50%;
    background: #60a5fa; box-shadow: 0 0 6px #60a5fa;
    border: 1.5px solid rgba(255,255,255,0.5); flex-shrink: 0;
  }
  .fm-legend-marker {
    width: 18px; height: 18px; border-radius: 50%;
    background: #fff; border: 2px solid #3b82f6;
    box-shadow: 0 0 8px rgba(59,130,246,0.5); flex-shrink: 0;
  }
  .fm-legend-label { font-size: 0.72rem; color: #6b7280; }

  /* ── BOTTOM STATS ── */
  .fm-stats {
    position: absolute; bottom: 0; left: 0; right: 0; z-index: 1000;
    padding: 28px 40px;
    background: linear-gradient(to top, rgba(8,11,16,0.95) 0%, transparent 100%);
    display: flex; gap: 40px; pointer-events: none;
  }
  .fm-stat-value {
    font-family: 'Syne', sans-serif; font-weight: 800;
    font-size: 1.4rem; color: #fff; letter-spacing: -0.02em;
  }
  .fm-stat-label {
    font-size: 0.62rem; color: #374151; letter-spacing: 0.2em;
    text-transform: uppercase; margin-top: 2px;
  }

  /* ── LOADING ── */
  .fm-loading {
    position: fixed; inset: 0; background: #080b10;
    display: flex; align-items: center; justify-content: center;
    font-family: 'DM Mono', monospace; font-size: 0.8rem;
    color: #374151; letter-spacing: 0.15em; text-transform: uppercase;
  }
  .fm-loading-dot {
    display: inline-block; width: 5px; height: 5px; border-radius: 50%;
    background: #3b82f6; box-shadow: 0 0 6px #3b82f6; margin-right: 12px;
    animation: fm-pulse 1.5s ease-in-out infinite;
  }
  @keyframes fm-pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.3; transform: scale(0.5); }
  }
`

function FlightMap() {
  const [routes, setRoutes] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const loadRoutes = async () => {
      try {
        const res = await flightsApi.getAll()
        const flights = res.data
        const airportCache = {}
        const routeData = await Promise.all(
          flights.map(async (flight) => {
            const getAirport = async (code) => {
              if (airportCache[code]) return airportCache[code]
              const r = await airportsApi.getOne(code)
              airportCache[code] = r.data
              return r.data
            }
            const [origin, destination] = await Promise.all([
              getAirport(flight.origin_iata),
              getAirport(flight.destination_iata)
            ])
            return { flight, origin, destination }
          })
        )
        setRoutes(routeData)
      } catch (err) {
        console.error('Error loading flight data:', err)
      } finally {
        setLoading(false)
      }
    }
    loadRoutes()
  }, [])

  const getAirlineIata = (flight) => {
    if (flight.flight_number && flight.flight_number.length >= 2)
      return flight.flight_number.substring(0, 2).toUpperCase()
    return null
  }

  const stats = useMemo(() => {
    const uniqueAirlines = [...new Map(
      routes.map(r => [r.flight.airline, getAirlineIata(r.flight)])
    ).entries()].filter(([_, code]) => code)

    const uniqueCountries = new Set([
      ...routes.map(r => r.origin.country),
      ...routes.map(r => r.destination.country)
    ]).size

    const uniqueAirports = new Set([
      ...routes.map(r => r.origin.iata_code),
      ...routes.map(r => r.destination.iata_code)
    ]).size

    return { uniqueAirlines, uniqueCountries, uniqueAirports }
  }, [routes])

  if (loading) return (
    <>
      <style>{styles}</style>
      <div className="fm-loading">
        <span className="fm-loading-dot" />
        Loading flight data...
      </div>
    </>
  )

  return (
    <>
      <style>{styles}</style>
      <div className="fm-root">

        {/* HEADER */}
        <div className="fm-header">
          <h1 className="fm-title">Flight Map</h1>
          <p className="fm-subtitle">{routes.length} active routes</p>
          <div className="fm-header-actions">
            <button className="fm-btn-ghost" onClick={() => navigate('/')}>← My Flights</button>
            <button className="fm-btn-primary" onClick={() => navigate('/add-flight')}>+ Log Flight</button>
          </div>
        </div>

        {/* LEGEND */}
        <div className="fm-legend">

          {/* Airlines */}
          <div className="fm-legend-section">
            <div className="fm-legend-heading">Airlines Flown</div>
            {stats.uniqueAirlines.length === 0 ? (
              <div className="fm-legend-label">No flights logged</div>
            ) : (
              stats.uniqueAirlines.map(([name, code]) => (
                <div key={name} className="fm-legend-airline">
                  <img
                    className="fm-legend-airline-logo"
                    src={`https://images.kiwi.com/airlines/64/${code}.png`}
                    alt={name}
                    onError={e => { e.target.style.display = 'none' }}
                  />
                  <span className="fm-legend-airline-name">{name}</span>
                </div>
              ))
            )}
          </div>

          {/* Map key */}
          <div className="fm-legend-section">
            <div className="fm-legend-heading">Map Key</div>
            <div className="fm-legend-line-row">
              <div className="fm-legend-line" />
              <span className="fm-legend-label">Flight route</span>
            </div>
            <div className="fm-legend-dot-row">
              <div className="fm-legend-dot" />
              <span className="fm-legend-label">Departure airport</span>
            </div>
            <div className="fm-legend-dot-row">
              <div className="fm-legend-marker" />
              <span className="fm-legend-label">Arrival airport</span>
            </div>
          </div>

        </div>

        {/* MAP */}
        <MapContainer
          center={[20, 10]}
          zoom={3}
          style={{ height: '100vh', width: '100vw' }}
          zoomControl={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://carto.com/">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />

          {routes.map(({ flight, origin, destination }) => {
            const airlineCode = getAirlineIata(flight)
            const airlineIcon = airlineCode ? createAirlineMarker(airlineCode) : L.Icon.Default()

            return (
              <React.Fragment key={flight.id}>
                <Marker position={[origin.latitude, origin.longitude]} icon={glowingMarker}>
                  <Popup>
                    <div style={{ fontFamily: "'DM Mono', monospace" }}>
                      <div style={{ fontSize: '0.65rem', color: '#4a5568', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 4 }}>Departure</div>
                      <div style={{ fontWeight: 500, color: '#e8e8e8' }}>{origin.iata_code}</div>
                      <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: 2 }}>{origin.name}</div>
                      {flight.flight_number && (
                        <div style={{ fontSize: '0.68rem', color: '#3b82f6', marginTop: 6, letterSpacing: '0.1em' }}>{flight.flight_number}</div>
                      )}
                    </div>
                  </Popup>
                </Marker>

                <Marker position={[destination.latitude, destination.longitude]} icon={airlineIcon}>
                  <Popup>
                    <div style={{ fontFamily: "'DM Mono', monospace", textAlign: 'center' }}>
                      <img src={`https://images.kiwi.com/airlines/64/${airlineCode}.png`} style={{ height: 18, marginBottom: 6 }} alt="" />
                      <div style={{ fontSize: '0.65rem', color: '#4a5568', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 2 }}>Arrival · {flight.airline}</div>
                      <div style={{ fontWeight: 500, color: '#e8e8e8' }}>{destination.iata_code}</div>
                      <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: 2 }}>{destination.name}</div>
                      {flight.flight_number && (
                        <div style={{ fontSize: '0.68rem', color: '#3b82f6', marginTop: 6, letterSpacing: '0.1em' }}>{flight.flight_number}</div>
                      )}
                    </div>
                  </Popup>
                </Marker>

                <Polyline
                  positions={[[origin.latitude, origin.longitude], [destination.latitude, destination.longitude]]}
                  color="#3b82f6"
                  weight={1.5}
                  opacity={0.6}
                  dashArray="5, 10"
                />
              </React.Fragment>
            )
          })}
        </MapContainer>

        {/* BOTTOM STATS */}
        <div className="fm-stats">
          {[
            { value: routes.length, label: 'Flights' },
            { value: stats.uniqueCountries, label: 'Countries' },
            { value: stats.uniqueAirports, label: 'Airports' },
            { value: stats.uniqueAirlines.length, label: 'Airlines' },
          ].map(({ value, label }) => (
            <div key={label}>
              <div className="fm-stat-value">{value}</div>
              <div className="fm-stat-label">{label}</div>
            </div>
          ))}
        </div>

      </div>
    </>
  )
}

export default FlightMap