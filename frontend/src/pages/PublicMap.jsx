import React, { useEffect, useState, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet'
import { publicApi } from '../api/public'
import { airportsApi, airlinesApi } from '../api/flights'
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
  @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;700&family=Syne:wght@700;800&display=swap');

  .pm-root { position: fixed; inset: 0; background: #080b10; font-family: 'JetBrains Mono', monospace; }

  .leaflet-popup-content-wrapper {
    background: rgba(8,11,16,0.95) !important;
    border: 1px solid rgba(59,130,246,0.25) !important;
    border-radius: 6px !important;
    color: #e8e8e8 !important;
    font-family: 'JetBrains Mono', monospace !important;
    font-size: 0.78rem !important;
  }
  .leaflet-popup-tip { background: rgba(8,11,16,0.95) !important; }

  .pm-header {
    position: absolute; top: 0; left: 0; z-index: 1000;
    padding: 36px 40px; pointer-events: none;
    display: flex; align-items: center; gap: 14px;
  }
  .pm-avatar { width: 44px; height: 44px; border-radius: 50%; border: 2px solid rgba(59,130,246,0.4); }
  .pm-title { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 1.4rem; color: #fff; margin: 0; }
  .pm-subtitle { font-size: 0.65rem; color: #4a5568; letter-spacing: 0.15em; text-transform: uppercase; margin-top: 3px; }

  .pm-stats {
    position: absolute; bottom: 0; left: 0; right: 0; z-index: 1000;
    padding: 28px 40px;
    background: linear-gradient(to top, rgba(8,11,16,0.95) 0%, transparent 100%);
    display: flex; gap: 40px; pointer-events: none;
  }
  .pm-stat-value { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 1.4rem; color: #fff; }
  .pm-stat-label { font-size: 0.6rem; color: #374151; letter-spacing: 0.18em; text-transform: uppercase; margin-top: 2px; }

  .pm-loading, .pm-error {
    position: fixed; inset: 0; background: #080b10;
    display: flex; align-items: center; justify-content: center;
    font-family: 'JetBrains Mono', monospace; font-size: 0.8rem;
    color: #374151; letter-spacing: 0.15em; text-transform: uppercase;
  }
`

function PublicMap() {
  const { userId } = useParams()
  const [profile, setProfile] = useState(null)
  const [stats, setStats] = useState(null)
  const [routes, setRoutes] = useState([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    Promise.all([
      publicApi.getProfile(userId),
      publicApi.getStats(userId),
      publicApi.getFlights(userId),
      airlinesApi.getAll().catch(() => ({ data: [] })),
    ])
      .then(async ([profileRes, statsRes, flightsRes, airlinesRes]) => {
        setProfile(profileRes.data)
        setStats(statsRes.data)

        const airlineIataByName = {}
        for (const a of airlinesRes.data || []) airlineIataByName[a.name] = a.iata_code

        const airportCache = {}
        const getAirport = async (code) => {
          if (airportCache[code]) return airportCache[code]
          const r = await airportsApi.getOne(code)
          airportCache[code] = r.data
          return r.data
        }

        const routeData = await Promise.all(
          (flightsRes.data || []).map(async (flight) => {
            const [origin, destination] = await Promise.all([
              getAirport(flight.origin_iata),
              getAirport(flight.destination_iata),
            ])
            return { flight, origin, destination, airlineCode: airlineIataByName[flight.airline] }
          })
        )
        setRoutes(routeData)
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [userId])

  const uniqueAirlines = useMemo(() => {
    return [...new Set(routes.map(r => r.flight.airline))].length
  }, [routes])

  if (loading) return (
    <>
      <style>{styles}</style>
      <div className="pm-loading">Loading flight map...</div>
    </>
  )

  if (notFound) return (
    <>
      <style>{styles}</style>
      <div className="pm-error">Flight map not found</div>
    </>
  )

  return (
    <>
      <style>{styles}</style>
      <div className="pm-root">
        <div className="pm-header">
          {profile?.picture && <img className="pm-avatar" src={profile.picture} alt={profile.name} />}
          <div>
            <h1 className="pm-title">{profile?.name || 'Flightlog'}</h1>
            <p className="pm-subtitle">Public flight map</p>
          </div>
        </div>

        <MapContainer center={[20, 10]} zoom={3} style={{ height: '100vh', width: '100vw' }} zoomControl={false}>
          <TileLayer
            attribution='&copy; <a href="https://carto.com/">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />

          {routes.map(({ flight, origin, destination, airlineCode }, i) => {
            const airlineIcon = airlineCode ? createAirlineMarker(airlineCode) : L.Icon.Default()
            return (
              <React.Fragment key={i}>
                <Marker position={[origin.latitude, origin.longitude]} icon={glowingMarker}>
                  <Popup>{origin.iata_code} · {origin.name}</Popup>
                </Marker>
                <Marker position={[destination.latitude, destination.longitude]} icon={airlineIcon}>
                  <Popup>{destination.iata_code} · {destination.name}<br/>{flight.airline}</Popup>
                </Marker>
                <Polyline
                  positions={[[origin.latitude, origin.longitude], [destination.latitude, destination.longitude]]}
                  color="#3b82f6" weight={1.5} opacity={0.6} dashArray="5, 10"
                />
              </React.Fragment>
            )
          })}
        </MapContainer>

        <div className="pm-stats">
          {[
            { value: stats?.total_flights ?? 0, label: 'Flights' },
            { value: stats?.unique_countries ?? 0, label: 'Countries' },
            { value: stats?.unique_airports ?? 0, label: 'Airports' },
            { value: uniqueAirlines, label: 'Airlines' },
          ].map(({ value, label }) => (
            <div key={label}>
              <div className="pm-stat-value">{value}</div>
              <div className="pm-stat-label">{label}</div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

export default PublicMap
