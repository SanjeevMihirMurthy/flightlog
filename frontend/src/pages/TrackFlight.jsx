import { useEffect, useRef, useState } from 'react'
import { trackingApi } from '../api/tracking'
import LiveTrackMap from '../components/LiveTrackMap'

const LIVE_POLL_INTERVAL_MS = 20000

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Syne:wght@700;800&display=swap');

  .tf-root {
    min-height: 100vh;
    background: #080b10;
    font-family: 'DM Mono', monospace;
    color: #e8e8e8;
  }

  .tf-content {
    max-width: 960px;
    margin: 0 auto;
    padding: 44px 32px;
  }

  .tf-title {
    font-family: 'Syne', sans-serif;
    font-weight: 800;
    font-size: 2rem;
    letter-spacing: -0.02em;
    color: #fff;
    margin: 0;
  }

  .tf-subtitle {
    font-size: 0.72rem;
    color: #4a5568;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    margin-top: 5px;
    margin-bottom: 32px;
  }

  .tf-search-row {
    display: flex;
    gap: 10px;
    margin-bottom: 28px;
  }

  .tf-input {
    flex: 1;
    padding: 11px 14px;
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 6px;
    color: #e8e8e8;
    font-family: 'DM Mono', monospace;
    font-size: 0.85rem;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    outline: none;
  }

  .tf-input:focus { border-color: rgba(59,130,246,0.4); }

  .tf-btn-primary {
    background: #2563eb;
    color: #fff;
    border: none;
    border-radius: 6px;
    padding: 11px 24px;
    cursor: pointer;
    font-family: 'DM Mono', monospace;
    font-size: 0.78rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    transition: background 0.2s;
  }

  .tf-btn-primary:hover { background: #1d4ed8; }
  .tf-btn-primary:disabled { background: #1f2937; cursor: not-allowed; }

  .tf-error {
    background: rgba(239,68,68,0.08);
    border: 1px solid rgba(239,68,68,0.25);
    border-radius: 4px;
    padding: 10px 14px;
    margin-bottom: 20px;
    color: #fca5a5;
    font-size: 0.78rem;
    letter-spacing: 0.04em;
  }

  .tf-card {
    background: rgba(8,11,16,0.75);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 6px;
    padding: 24px;
    backdrop-filter: blur(18px);
    margin-bottom: 3px;
  }

  .tf-card-title {
    font-size: 0.62rem;
    color: #4a5568;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    margin-bottom: 18px;
  }

  .tf-status-badge {
    display: inline-block;
    padding: 3px 10px;
    border-radius: 3px;
    font-size: 0.65rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    background: rgba(59,130,246,0.12);
    color: #60a5fa;
    border: 1px solid rgba(59,130,246,0.25);
  }

  .tf-route-grid {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    gap: 20px;
    align-items: center;
    margin-top: 18px;
  }

  .tf-route-airport { font-size: 0.9rem; color: #f0f4ff; font-family: 'Syne', sans-serif; font-weight: 700; }
  .tf-route-meta { font-size: 0.72rem; color: #6b7280; margin-top: 6px; }
  .tf-route-arrow { color: #3b82f6; font-size: 1.1rem; }

  .tf-map-wrap {
    height: 420px;
    border-radius: 6px;
    overflow: hidden;
    border: 1px solid rgba(255,255,255,0.07);
  }

  .tf-empty-state {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 420px;
    border-radius: 6px;
    border: 1px dashed rgba(255,255,255,0.1);
    color: #4a5568;
    font-size: 0.75rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
  }
`

function formatTime(iso) {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
  } catch {
    return iso
  }
}

function TrackFlight() {
  const [flightNumberInput, setFlightNumberInput] = useState('')
  const [trackedFlightNumber, setTrackedFlightNumber] = useState(null)

  const [status, setStatus] = useState(null)
  const [statusError, setStatusError] = useState(null)
  const [statusLoading, setStatusLoading] = useState(false)

  const [live, setLive] = useState(null)
  const [liveError, setLiveError] = useState(null)
  const pollRef = useRef(null)

  useEffect(() => {
    return () => clearInterval(pollRef.current)
  }, [])

  const fetchLive = (flightNumber) => {
    trackingApi.getLive(flightNumber)
      .then(res => { setLive(res.data); setLiveError(null) })
      .catch(err => setLiveError(err.response?.data?.detail || 'Could not fetch live position'))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const trimmed = flightNumberInput.replace(/\s+/g, '').toUpperCase()
    if (trimmed.length < 3) return

    clearInterval(pollRef.current)

    setTrackedFlightNumber(trimmed)
    setStatus(null)
    setStatusError(null)
    setLive(null)
    setLiveError(null)
    setStatusLoading(true)

    trackingApi.getStatus(trimmed)
      .then(res => setStatus(res.data))
      .catch(err => setStatusError(err.response?.data?.detail || 'Could not fetch flight status'))
      .finally(() => setStatusLoading(false))

    fetchLive(trimmed)
    pollRef.current = setInterval(() => fetchLive(trimmed), LIVE_POLL_INTERVAL_MS)
  }

  return (
    <>
      <style>{styles}</style>
      <div className="tf-root">
        <div className="tf-content">
          <h1 className="tf-title">Track a Flight</h1>
          <p className="tf-subtitle">Live status and position by flight number</p>

          <form className="tf-search-row" onSubmit={handleSubmit}>
            <input
              className="tf-input"
              placeholder="e.g. 6E123"
              value={flightNumberInput}
              onChange={(e) => setFlightNumberInput(e.target.value)}
            />
            <button className="tf-btn-primary" type="submit" disabled={statusLoading}>
              {statusLoading ? 'Tracking…' : 'Track'}
            </button>
          </form>

          {!trackedFlightNumber && (
            <div className="tf-empty-state">Enter a flight number to get started</div>
          )}

          {statusError && <div className="tf-error">{statusError}</div>}

          {status && (
            <div className="tf-card">
              <div className="tf-card-title">Flight Status</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: '1.2rem' }}>
                  {status.flight_number}
                </span>
                <span style={{ color: '#6b7280', fontSize: '0.8rem' }}>{status.airline}</span>
                {status.flight_status && (
                  <span className="tf-status-badge">{status.flight_status}</span>
                )}
              </div>

              <div className="tf-route-grid">
                <div>
                  <div className="tf-route-airport">{status.departure_iata || '—'}</div>
                  <div className="tf-route-meta">{status.departure_airport}</div>
                  <div className="tf-route-meta">Scheduled {formatTime(status.departure_scheduled)}</div>
                  {status.departure_terminal && <div className="tf-route-meta">Terminal {status.departure_terminal} · Gate {status.departure_gate || '—'}</div>}
                </div>
                <div className="tf-route-arrow">→</div>
                <div>
                  <div className="tf-route-airport">{status.arrival_iata || '—'}</div>
                  <div className="tf-route-meta">{status.arrival_airport}</div>
                  <div className="tf-route-meta">Scheduled {formatTime(status.arrival_scheduled)}</div>
                  {status.arrival_terminal && <div className="tf-route-meta">Terminal {status.arrival_terminal} · Gate {status.arrival_gate || '—'}</div>}
                </div>
              </div>
            </div>
          )}

          {trackedFlightNumber && (
            <div className="tf-card">
              <div className="tf-card-title">Live Position</div>
              {liveError && <div className="tf-error">{liveError}</div>}
              {live?.found ? (
                <div className="tf-map-wrap">
                  <LiveTrackMap position={live} />
                </div>
              ) : (
                <div className="tf-empty-state">
                  {live ? 'No live signal — flight may not be airborne right now' : 'Checking for a live signal…'}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default TrackFlight
