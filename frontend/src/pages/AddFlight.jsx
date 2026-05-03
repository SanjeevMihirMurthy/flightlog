import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { flightsApi, airportsApi, airlinesApi } from "../api/flights";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Syne:wght@700;800&display=swap');

  .af-root {
    display: flex; min-height: 100vh; background: #080b10;
    font-family: 'DM Mono', monospace; color: #e8e8e8;
  }

  /* ── LEFT PANEL ── */
  .af-panel {
    flex: 0 0 500px; padding: 44px 40px; overflow-y: auto;
    background: rgba(8,11,16,0.97);
    border-right: 1px solid rgba(255,255,255,0.06);
    position: relative; z-index: 10;
  }
  .af-back {
    display: inline-flex; align-items: center; gap: 6px;
    font-size: 0.72rem; color: #374151; letter-spacing: 0.12em;
    text-transform: uppercase; cursor: pointer; margin-bottom: 32px;
    background: none; border: none; padding: 0; transition: color 0.2s;
  }
  .af-back:hover { color: #6b7280; }
  .af-title {
    font-family: 'Syne', sans-serif; font-weight: 800; font-size: 1.6rem;
    letter-spacing: -0.02em; color: #fff; margin: 0 0 6px;
  }
  .af-subtitle { font-size: 0.75rem; color: #374151; letter-spacing: 0.1em; margin-bottom: 36px; }

  .af-error {
    background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.25);
    border-radius: 4px; padding: 10px 14px; margin-bottom: 20px;
    color: #fca5a5; font-size: 0.78rem; letter-spacing: 0.04em;
  }

  .af-section-label {
    font-size: 0.65rem; color: #1e3a5f; letter-spacing: 0.2em;
    text-transform: uppercase; margin: 28px 0 14px; border-top: 1px solid #0f1929;
    padding-top: 16px;
  }
  .af-section-label:first-of-type { margin-top: 0; border-top: none; padding-top: 0; }

  .af-label {
    font-size: 0.72rem; color: #4b5563; letter-spacing: 0.1em;
    text-transform: uppercase; display: block; margin-bottom: 12px;
  }
  .af-label span { display: block; margin-bottom: 5px; }

  .af-input, .af-select, .af-textarea {
    width: 100%; padding: 9px 12px;
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 4px; color: #e8e8e8;
    font-family: 'DM Mono', monospace; font-size: 0.82rem;
    outline: none; transition: border-color 0.2s, background 0.2s;
    box-sizing: border-box;
  }
  .af-input:focus, .af-select:focus, .af-textarea:focus {
    border-color: rgba(59,130,246,0.4); background: rgba(59,130,246,0.04);
  }
  .af-input::placeholder { color: #1f2937; }
  .af-input:disabled { opacity: 0.35; cursor: not-allowed; }
  .af-select option { background: #0d1117; }
  .af-textarea { height: 80px; resize: vertical; }

  .af-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .af-grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; }

  /* Airline select row */
  .af-airline-row { display: flex; align-items: center; gap: 10px; }
  .af-airline-logo {
    width: 36px; height: 36px; object-fit: contain;
    background: #fff; border-radius: 4px; padding: 3px; flex-shrink: 0;
  }

  /* Flight number prefix */
  .af-fn-wrap { display: flex; align-items: stretch; }
  .af-fn-prefix {
    padding: 9px 12px; background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.08); border-right: none;
    border-radius: 4px 0 0 4px; color: #6b7280; font-size: 0.82rem;
    font-family: 'DM Mono', monospace; min-width: 44px; text-align: center;
    display: flex; align-items: center; justify-content: center;
  }
  .af-fn-input {
    flex: 1; border-radius: 0 4px 4px 0 !important;
  }

  /* Actions */
  .af-actions { display: flex; gap: 10px; margin-top: 32px; }
  .af-btn-primary {
    background: #2563eb; color: #fff; border: none; border-radius: 4px;
    padding: 10px 24px; font-family: 'DM Mono', monospace; font-size: 0.82rem;
    letter-spacing: 0.05em; cursor: pointer; transition: background 0.2s;
  }
  .af-btn-primary:hover:not(:disabled) { background: #1d4ed8; }
  .af-btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
  .af-btn-ghost {
    background: transparent; color: #374151; border: 1px solid rgba(255,255,255,0.08);
    border-radius: 4px; padding: 10px 20px; font-family: 'DM Mono', monospace;
    font-size: 0.82rem; cursor: pointer; transition: all 0.2s;
  }
  .af-btn-ghost:hover { color: #6b7280; border-color: rgba(255,255,255,0.15); }

  /* ── RIGHT PANEL — map bg ── */
  .af-map-panel {
    flex: 1; position: relative; overflow: hidden; min-height: 100vh;
  }
  .af-map-svg {
    position: absolute; inset: 0; width: 100%; height: 100%;
    opacity: 0.5; pointer-events: none;
  }
  .af-map-vignette {
    position: absolute; inset: 0; pointer-events: none;
    background: linear-gradient(to right, #080b10 0%, rgba(8,11,16,0.3) 40%, transparent 100%);
  }
  .af-map-scanlines {
    position: absolute; inset: 0; pointer-events: none;
    background-image: repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.07) 2px, rgba(0,0,0,0.07) 4px);
  }
  .af-map-tagline {
    position: absolute; bottom: 3rem; right: 3rem; z-index: 2; text-align: right;
    font-family: 'Syne', sans-serif; font-weight: 800; font-size: 2.2rem;
    color: rgba(255,255,255,0.07); letter-spacing: -0.02em; line-height: 1.1;
    pointer-events: none;
  }
  .af-airline-badge {
    position: absolute; top: 3rem; right: 3rem; z-index: 2;
    display: flex; align-items: center; gap: 12px;
    background: rgba(255,255,255,0.05); backdrop-filter: blur(12px);
    border: 1px solid rgba(255,255,255,0.09); border-radius: 8px; padding: 12px 16px;
    animation: af-fade-in 0.3s ease;
  }
  .af-airline-badge-logo {
    width: 34px; height: 34px; object-fit: contain;
    background: #fff; border-radius: 4px; padding: 3px;
  }
  .af-airline-badge-caption { font-size: 0.65rem; color: rgba(255,255,255,0.35); letter-spacing: 0.1em; text-transform: uppercase; }
  .af-airline-badge-name { font-size: 0.88rem; font-weight: 500; color: #e8e8e8; margin-top: 2px; }

  @keyframes af-fade-in { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: none; } }
`

const MAP_SVG = (
  <svg viewBox="0 0 1440 810" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice" className="af-map-svg">
    <rect width="1440" height="810" fill="#080b10"/>
    <g stroke="#1a2235" strokeWidth="0.5" opacity="0.9">
      {[81,162,243,324,405,486,567,648,729].map(y => <line key={y} x1="0" y1={y} x2="1440" y2={y}/>)}
      {[144,288,432,576,720,864,1008,1152,1296].map(x => <line key={x} x1={x} y1="0" x2={x} y2="810"/>)}
    </g>
    <path d="M95,120 L130,110 L180,108 L230,115 L270,130 L290,155 L310,180 L305,210 L285,240 L260,265 L240,290 L220,310 L200,330 L195,355 L210,370 L220,380 L210,390 L190,385 L170,370 L155,350 L145,330 L135,305 L125,280 L120,250 L112,220 L100,190 L92,160 Z" fill="#111827" stroke="#1e3a5f" strokeWidth="1" opacity="0.95"/>
    <path d="M290,60 L330,55 L370,65 L385,90 L375,115 L350,125 L320,118 L300,100 Z" fill="#111827" stroke="#1e3a5f" strokeWidth="0.8" opacity="0.85"/>
    <path d="M215,405 L250,410 L285,415 L315,420 L335,440 L345,470 L340,510 L325,545 L305,575 L280,600 L260,615 L245,605 L235,580 L225,550 L215,520 L210,490 L205,460 L205,435 Z" fill="#111827" stroke="#1e3a5f" strokeWidth="1" opacity="0.95"/>
    <path d="M620,100 L650,95 L680,100 L710,108 L730,120 L740,140 L730,155 L710,160 L695,170 L680,165 L665,155 L650,148 L635,140 L625,128 Z" fill="#111827" stroke="#1e3a5f" strokeWidth="0.9" opacity="0.95"/>
    <path d="M640,200 L680,195 L715,198 L740,215 L755,245 L760,280 L758,315 L748,350 L730,385 L710,415 L690,440 L670,455 L650,450 L630,435 L618,410 L610,375 L608,340 L612,305 L618,270 L622,235 Z" fill="#111827" stroke="#1e3a5f" strokeWidth="1" opacity="0.95"/>
    <path d="M730,90 L790,80 L860,75 L930,80 L1000,85 L1060,90 L1110,100 L1140,115 L1155,135 L1145,155 L1120,168 L1090,175 L1060,180 L1030,190 L1010,210 L1000,230 L980,245 L955,250 L930,248 L905,255 L885,270 L870,285 L855,295 L840,290 L825,278 L810,268 L795,260 L780,255 L765,248 L750,238 L740,222 L735,205 L730,188 L728,165 L725,140 Z" fill="#111827" stroke="#1e3a5f" strokeWidth="1" opacity="0.95"/>
    <path d="M855,255 L885,270 L900,295 L910,325 L905,355 L888,370 L870,360 L855,340 L845,315 L840,288 Z" fill="#111827" stroke="#1e3a5f" strokeWidth="0.8" opacity="0.9"/>
    <path d="M740,200 L765,205 L780,215 L790,235 L785,260 L770,270 L752,265 L738,248 L732,228 Z" fill="#111827" stroke="#1e3a5f" strokeWidth="0.8" opacity="0.9"/>
    <path d="M1050,450 L1110,440 L1160,445 L1195,460 L1210,485 L1205,515 L1185,538 L1155,548 L1120,545 L1085,535 L1060,515 L1042,490 L1040,465 Z" fill="#111827" stroke="#1e3a5f" strokeWidth="0.9" opacity="0.9"/>
    <defs>
      <filter id="af-glow"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    </defs>
    {/* Decorative route arcs */}
    <path d="M940,230 Q780,60 618,128" fill="none" stroke="#3b82f6" strokeWidth="1" opacity="0.3" filter="url(#af-glow)" strokeDasharray="5,3"/>
    <path d="M940,230 Q700,100 260,165" fill="none" stroke="#60a5fa" strokeWidth="1" opacity="0.25" filter="url(#af-glow)" strokeDasharray="5,3"/>
    <circle cx="940" cy="230" r="4" fill="#3b82f6" opacity="0.7" filter="url(#af-glow)"/>
    <circle cx="618" cy="128" r="3" fill="#3b82f6" opacity="0.6" filter="url(#af-glow)"/>
    <circle cx="260" cy="165" r="3" fill="#3b82f6" opacity="0.6" filter="url(#af-glow)"/>
  </svg>
)

function AddFlight() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedAirlineCode, setSelectedAirlineCode] = useState("");
  const [airlines, setAirlines] = useState([]);
  const [form, setForm] = useState({
    flight_number: "", airline: "", origin_iata: "", destination_iata: "",
    departure_year: "", departure_month: "", departure_day: "",
    departure_time: "", arrival_time: "", aircraft_type: "",
    cabin_class: "Economy", duration_minutes: "", notes: "",
  });

  useEffect(() => {
    setLoading(true);
    airlinesApi.getAll()
      .then(res => setAirlines(res.data || []))
      .catch(() => setError("Failed to load airlines"))
      .finally(() => setLoading(false));
  }, []);

  const handleAirlineChange = (e) => {
    const selectedName = e.target.value;
    const selectedAirline = airlines.find(a => a.name === selectedName);
    setForm({ ...form, airline: selectedName });
    setSelectedAirlineCode(selectedAirline?.iata_code || "");
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    setLoading(true); setError(null);
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
      };
      await flightsApi.create(payload);
      navigate("/");
    } catch (err) {
      setError("Failed to add flight. Please check your inputs.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{styles}</style>
      <div className="af-root">

        {/* ── LEFT FORM PANEL ── */}
        <div className="af-panel">
          <button className="af-back" onClick={() => navigate("/")}>
            ← Back
          </button>
          <h1 className="af-title">Log a Flight</h1>
          <p className="af-subtitle">Add a flight to your aviation passport</p>

          {error && <div className="af-error">{error}</div>}

          {/* AIRLINE */}
          <div className="af-section-label">Airline</div>
          <label className="af-label">
            <span>Airline *</span>
            <div className="af-airline-row">
              <select className="af-select" name="airline" value={form.airline} onChange={handleAirlineChange} style={{ flex: 1 }}>
                <option value="">Select airline</option>
                {airlines.map(a => (
                  <option key={a.iata_code} value={a.name}>{a.name} ({a.iata_code})</option>
                ))}
              </select>
              {selectedAirlineCode && (
                <img
                  className="af-airline-logo"
                  src={`https://images.kiwi.com/airlines/64/${selectedAirlineCode}.png`}
                  alt={form.airline}
                  onError={e => { e.target.style.display = 'none' }}
                />
              )}
            </div>
          </label>

          {/* FLIGHT NUMBER */}
          <label className="af-label">
            <span>Flight Number</span>
            <div className="af-fn-wrap">
              <div className="af-fn-prefix">{selectedAirlineCode || '--'}</div>
              <input
                className="af-input af-fn-input"
                name="flight_number"
                value={form.flight_number.replace(selectedAirlineCode, "")}
                onChange={e => setForm({ ...form, flight_number: `${selectedAirlineCode}${e.target.value}` })}
                placeholder={selectedAirlineCode ? "545" : "Select airline first"}
                disabled={!selectedAirlineCode}
              />
            </div>
          </label>

          {/* ROUTE */}
          <div className="af-section-label">Route</div>
          <div className="af-grid-2">
            <label className="af-label">
              <span>Origin IATA *</span>
              <input className="af-input" name="origin_iata" value={form.origin_iata} onChange={handleChange} placeholder="MAA" maxLength={3}/>
            </label>
            <label className="af-label">
              <span>Destination IATA *</span>
              <input className="af-input" name="destination_iata" value={form.destination_iata} onChange={handleChange} placeholder="DXB" maxLength={3}/>
            </label>
          </div>

          {/* DATE */}
          <div className="af-section-label">Date & Time</div>
          <div className="af-grid-3">
            <label className="af-label">
              <span>Year *</span>
              <input className="af-input" name="departure_year" value={form.departure_year} onChange={handleChange} placeholder="2024" type="number"/>
            </label>
            <label className="af-label">
              <span>Month</span>
              <input className="af-input" name="departure_month" value={form.departure_month} onChange={handleChange} placeholder="8" type="number" min="1" max="12"/>
            </label>
            <label className="af-label">
              <span>Day</span>
              <input className="af-input" name="departure_day" value={form.departure_day} onChange={handleChange} placeholder="15" type="number" min="1" max="31"/>
            </label>
          </div>
          <div className="af-grid-2">
            <label className="af-label">
              <span>Departure</span>
              <input className="af-input" name="departure_time" value={form.departure_time} onChange={handleChange} type="time"/>
            </label>
            <label className="af-label">
              <span>Arrival</span>
              <input className="af-input" name="arrival_time" value={form.arrival_time} onChange={handleChange} type="time"/>
            </label>
          </div>

          {/* AIRCRAFT */}
          <div className="af-section-label">Aircraft</div>
          <div className="af-grid-2">
            <label className="af-label">
              <span>Aircraft Type</span>
              <input className="af-input" name="aircraft_type" value={form.aircraft_type} onChange={handleChange} placeholder="A380"/>
            </label>
            <label className="af-label">
              <span>Cabin Class</span>
              <select className="af-select" name="cabin_class" value={form.cabin_class} onChange={handleChange}>
                <option value="Economy">Economy</option>
                <option value="Premium Economy">Premium Economy</option>
                <option value="Business">Business</option>
                <option value="First">First</option>
              </select>
            </label>
          </div>
          <label className="af-label">
            <span>Duration (minutes)</span>
            <input className="af-input" name="duration_minutes" value={form.duration_minutes} onChange={handleChange} placeholder="240" type="number"/>
          </label>

          {/* NOTES */}
          <div className="af-section-label">Notes</div>
          <label className="af-label">
            <span>Anything memorable?</span>
            <textarea className="af-textarea" name="notes" value={form.notes} onChange={handleChange} placeholder="Anything memorable about this flight..."/>
          </label>

          <div className="af-actions">
            <button className="af-btn-primary" onClick={handleSubmit} disabled={loading}>
              {loading ? "Saving..." : "Log Flight"}
            </button>
            <button className="af-btn-ghost" onClick={() => navigate("/")}>Cancel</button>
          </div>
        </div>

        {/* ── RIGHT MAP PANEL ── */}
        <div className="af-map-panel">
          {MAP_SVG}
          <div className="af-map-vignette"/>
          <div className="af-map-scanlines"/>

          {selectedAirlineCode && (
            <div className="af-airline-badge">
              <img
                className="af-airline-badge-logo"
                src={`https://images.kiwi.com/airlines/64/${selectedAirlineCode}.png`}
                alt={form.airline}
                onError={e => { e.target.style.display = 'none' }}
              />
              <div>
                <div className="af-airline-badge-caption">Selected airline</div>
                <div className="af-airline-badge-name">{form.airline}</div>
              </div>
            </div>
          )}

          <div className="af-map-tagline">
            Every flight<br/>tells a story
          </div>
        </div>

      </div>
    </>
  );
}

export default AddFlight;
