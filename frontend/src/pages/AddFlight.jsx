import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { flightsApi } from '../api/flights'
import { airportsApi } from '../api/flights'

function AddFlight() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [form, setForm] = useState({
    flight_number: '',
    airline: '',
    origin_iata: '',
    destination_iata: '',
    departure_year: '',
    departure_month: '',
    departure_day: '',
    departure_time: '',
    arrival_time: '',
    aircraft_type: '',
    cabin_class: 'Economy',
    duration_minutes: '',
    notes: ''
  })

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError(null)
    try {
      const payload = {
        ...form,
        departure_year: parseInt(form.departure_year),
        departure_month: form.departure_month ? parseInt(form.departure_month) : null,
        departure_day: form.departure_day ? parseInt(form.departure_day) : null,
        duration_minutes: form.duration_minutes ? parseInt(form.duration_minutes) : null,
        departure_time: form.departure_time || null,
        arrival_time: form.arrival_time || null,
        flight_number: form.flight_number || null,
        notes: form.notes || null,
      }
      await flightsApi.create(payload)
      navigate('/')
    } catch (err) {
      setError('Failed to add flight. Please check your inputs.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = {
    width: '100%',
    padding: '0.6rem',
    background: '#1a1a1a',
    border: '1px solid #333',
    borderRadius: '6px',
    color: '#fff',
    fontSize: '0.9rem',
    marginTop: '4px'
  }

  const labelStyle = {
    fontSize: '0.85rem',
    color: '#aaa',
    display: 'block',
    marginBottom: '1rem'
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '600px' }}>
      <h1>Log a Flight</h1>
      <p style={{ color: '#888', marginTop: '0.5rem', marginBottom: '2rem' }}>
        Add a flight to your aviation passport
      </p>

      {error && (
        <div style={{ background: '#2a1a1a', border: '1px solid #ff4444', borderRadius: '6px', padding: '0.75rem', marginBottom: '1rem', color: '#ff6666' }}>
          {error}
        </div>
      )}

      <label style={labelStyle}>
        Airline *
        <input style={inputStyle} name="airline" value={form.airline} onChange={handleChange} placeholder="e.g. Emirates" />
      </label>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <label style={labelStyle}>
          Origin IATA *
          <input style={inputStyle} name="origin_iata" value={form.origin_iata} onChange={handleChange} placeholder="e.g. MAA" maxLength={3} />
        </label>
        <label style={labelStyle}>
          Destination IATA *
          <input style={inputStyle} name="destination_iata" value={form.destination_iata} onChange={handleChange} placeholder="e.g. DXB" maxLength={3} />
        </label>
      </div>

      <label style={labelStyle}>
        Flight Number
        <input style={inputStyle} name="flight_number" value={form.flight_number} onChange={handleChange} placeholder="e.g. EK545" />
      </label>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
        <label style={labelStyle}>
          Year *
          <input style={inputStyle} name="departure_year" value={form.departure_year} onChange={handleChange} placeholder="2023" type="number" />
        </label>
        <label style={labelStyle}>
          Month
          <input style={inputStyle} name="departure_month" value={form.departure_month} onChange={handleChange} placeholder="8" type="number" min="1" max="12" />
        </label>
        <label style={labelStyle}>
          Day
          <input style={inputStyle} name="departure_day" value={form.departure_day} onChange={handleChange} placeholder="15" type="number" min="1" max="31" />
        </label>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <label style={labelStyle}>
          Departure Time
          <input style={inputStyle} name="departure_time" value={form.departure_time} onChange={handleChange} placeholder="09:50" type="time" />
        </label>
        <label style={labelStyle}>
          Arrival Time
          <input style={inputStyle} name="arrival_time" value={form.arrival_time} onChange={handleChange} placeholder="12:30" type="time" />
        </label>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <label style={labelStyle}>
          Aircraft Type
          <input style={inputStyle} name="aircraft_type" value={form.aircraft_type} onChange={handleChange} placeholder="e.g. A320" />
        </label>
        <label style={labelStyle}>
          Cabin Class
          <select style={inputStyle} name="cabin_class" value={form.cabin_class} onChange={handleChange}>
            <option value="Economy">Economy</option>
            <option value="Premium Economy">Premium Economy</option>
            <option value="Business">Business</option>
            <option value="First">First</option>
          </select>
        </label>
      </div>

      <label style={labelStyle}>
        Duration (minutes)
        <input style={inputStyle} name="duration_minutes" value={form.duration_minutes} onChange={handleChange} placeholder="e.g. 240" type="number" />
      </label>

      <label style={labelStyle}>
        Notes
        <textarea style={{ ...inputStyle, height: '80px', resize: 'vertical' }} name="notes" value={form.notes} onChange={handleChange} placeholder="Anything memorable about this flight..." />
      </label>

      <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
        <button
          onClick={handleSubmit}
          disabled={loading}
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
          {loading ? 'Saving...' : 'Log Flight'}
        </button>
        <button
          onClick={() => navigate('/')}
          style={{
            background: 'transparent',
            color: '#888',
            border: '1px solid #333',
            borderRadius: '6px',
            padding: '0.75rem 1.5rem',
            cursor: 'pointer',
            fontSize: '0.9rem'
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  )
}

export default AddFlight