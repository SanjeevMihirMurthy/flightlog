import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { flightsApi } from '../api/flights'

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

  if (loading) return <p style={{ padding: '2rem' }}>Loading flights...</p>

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>My Flights</h1>
          <p style={{ color: '#888', marginTop: '0.5rem' }}>
            {flights.length} flights logged
          </p>
        </div>
        <button
          onClick={() => navigate('/add-flight')}
          style={{
            background: '#2563eb',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            padding: '0.75rem 1.5rem',
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontWeight: '600'
          }}
        >
          + Log Flight
        </button>
      </div>

      <div style={{ marginTop: '2rem' }}>
        {flights.length === 0 ? (
          <p style={{ color: '#888' }}>No flights logged yet.</p>
        ) : (
          flights.map(flight => (
            <div key={flight.id} style={{
              background: '#1a1a1a',
              border: '1px solid #333',
              borderRadius: '8px',
              padding: '1rem',
              marginBottom: '1rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <strong>{flight.origin_iata} → {flight.destination_iata}</strong>
                <span style={{ color: '#888' }}>{flight.departure_year}</span>
              </div>
              <div style={{ color: '#aaa', marginTop: '0.5rem', fontSize: '0.9rem' }}>
                {flight.airline} · {flight.aircraft_type} · {flight.cabin_class}
              </div>
              {flight.notes && (
                <div style={{ color: '#666', marginTop: '0.5rem', fontSize: '0.85rem' }}>
                  {flight.notes}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default FlightLog