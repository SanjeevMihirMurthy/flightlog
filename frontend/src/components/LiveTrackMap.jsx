import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

const createPlaneIcon = (heading = 0) => L.divIcon({
  html: `
    <div style="
      width: 30px; height: 30px;
      display: flex; align-items: center; justify-content: center;
      transform: rotate(${heading}deg);
      filter: drop-shadow(0 0 6px rgba(59,130,246,0.8));
    ">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="#60a5fa">
        <path d="M12 2 L15 11 L22 14 L15 15.5 L14 22 L12 18 L10 22 L9 15.5 L2 14 L9 11 Z" />
      </svg>
    </div>`,
  className: '',
  iconSize: [30, 30],
  iconAnchor: [15, 15],
  popupAnchor: [0, -14],
})

function Recenter({ lat, lon }) {
  const map = useMap()

  useEffect(() => {
    map.setView([lat, lon], map.getZoom(), { animate: true })
  }, [lat, lon, map])

  return null
}

function LiveTrackMap({ position }) {
  if (!position) return null

  const { latitude, longitude, heading, callsign, altitude, velocity } = position

  return (
    <MapContainer
      center={[latitude, longitude]}
      zoom={6}
      style={{ height: '100%', width: '100%' }}
      zoomControl={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://carto.com/">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      />
      <Marker position={[latitude, longitude]} icon={createPlaneIcon(heading || 0)}>
        <Popup>
          <div style={{ fontFamily: "'DM Mono', monospace" }}>
            <div style={{ fontWeight: 500, color: '#e8e8e8' }}>{callsign}</div>
            {typeof altitude === 'number' && (
              <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: 2 }}>
                {Math.round(altitude)} m altitude
              </div>
            )}
            {typeof velocity === 'number' && (
              <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                {Math.round(velocity * 3.6)} km/h
              </div>
            )}
          </div>
        </Popup>
      </Marker>
      <Recenter lat={latitude} lon={longitude} />
    </MapContainer>
  )
}

export default LiveTrackMap
