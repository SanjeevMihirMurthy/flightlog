import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { flightsApi, airlinesApi, airportsApi } from "../api/flights";
import AirportAutocomplete from "../components/AirportAutocomplete";
import BoardingPassPreview from "../components/BoardingPassPreview";
import MapBackdropPanel from "../components/MapBackdropPanel";
import { INITIAL_FORM, getFormErrors } from "../utils/flightForm";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;700&family=Syne:wght@700;800&display=swap');

  .af-root {
    display: flex; justify-content: center; min-height: 100vh; background: #080b10;
    font-family: 'JetBrains Mono', monospace; color: #e8e8e8;
  }
  .af-content {
    display: flex; width: 100%; max-width: 1320px;
  }

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
    font-family: 'JetBrains Mono', monospace; font-size: 0.82rem;
    outline: none; transition: border-color 0.2s, background 0.2s;
    box-sizing: border-box;
  }
  .af-input:focus, .af-select:focus, .af-textarea:focus {
    border-color: rgba(59,130,246,0.4); background: rgba(59,130,246,0.04);
  }
  .af-input::placeholder { color: #1f2937; }
  .af-input:disabled, .af-select:disabled { opacity: 0.35; cursor: not-allowed; }
  .af-input.invalid { border-color: rgba(239,68,68,0.5); }
  .af-select option { background: #0d1117; }
  .af-textarea { height: 80px; resize: vertical; }

  .af-field-error {
    font-size: 0.66rem; color: #f87171; letter-spacing: 0.04em;
    margin-top: 6px; text-transform: none;
  }

  .aa-wrap { position: relative; }
  .aa-dropdown {
    position: absolute; top: calc(100% + 4px); left: 0; right: 0; z-index: 20;
    background: #0d1117; border: 1px solid rgba(59,130,246,0.25);
    border-radius: 4px; max-height: 220px; overflow-y: auto;
    box-shadow: 0 8px 24px rgba(0,0,0,0.4);
  }
  .aa-option {
    padding: 9px 12px; cursor: pointer; display: flex; align-items: baseline; gap: 8px;
    font-family: 'JetBrains Mono', monospace;
  }
  .aa-option.highlighted, .aa-option:hover { background: rgba(59,130,246,0.12); }
  .aa-option-code { color: #60a5fa; font-weight: 700; font-size: 0.78rem; flex-shrink: 0; }
  .aa-option-name { color: #9ca3af; font-size: 0.74rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

  .af-route-preview {
    display: flex; align-items: center; gap: 10px;
    margin: -4px 0 20px; font-size: 0.8rem; color: #60a5fa;
    letter-spacing: 0.05em;
  }
  .af-route-preview-arrow { color: #3b82f6; }

  .af-route-chips {
    display: flex; flex-wrap: nowrap; align-items: center; gap: 8px;
    margin: -8px 0 20px; overflow-x: auto; padding-bottom: 6px;
    scrollbar-width: thin; scrollbar-color: rgba(59,130,246,0.3) transparent;
  }
  .af-route-chips::-webkit-scrollbar { height: 4px; }
  .af-route-chips::-webkit-scrollbar-thumb { background: rgba(59,130,246,0.3); border-radius: 2px; }
  .af-route-chips-label {
    font-size: 0.66rem; color: #374151; letter-spacing: 0.08em;
    text-transform: uppercase; margin-right: 2px; flex-shrink: 0;
  }
  .af-route-chip {
    background: rgba(59,130,246,0.08); border: 1px solid rgba(59,130,246,0.25);
    border-radius: 20px; padding: 5px 12px; color: #93c5fd;
    font-family: 'JetBrains Mono', monospace; font-size: 0.72rem;
    cursor: pointer; transition: all 0.2s; white-space: nowrap; flex-shrink: 0;
  }
  .af-route-chip:hover { background: rgba(59,130,246,0.16); border-color: rgba(59,130,246,0.4); }

  .af-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }

  .af-airline-row { display: flex; align-items: center; gap: 10px; }
  .af-airline-logo {
    width: 36px; height: 36px; object-fit: contain;
    background: #fff; border-radius: 4px; padding: 3px; flex-shrink: 0;
  }

  .af-fn-wrap { display: flex; align-items: stretch; }
  .af-fn-prefix {
    padding: 9px 12px; background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.08); border-right: none;
    border-radius: 4px 0 0 4px; color: #6b7280; font-size: 0.82rem;
    font-family: 'JetBrains Mono', monospace; min-width: 44px; text-align: center;
    display: flex; align-items: center; justify-content: center;
  }
  .af-fn-input {
    flex: 1; border-radius: 0 4px 4px 0 !important;
  }

  .af-actions { display: flex; gap: 10px; margin-top: 32px; }
  .af-btn-primary {
    background: #2563eb; color: #fff; border: none; border-radius: 4px;
    padding: 10px 24px; font-family: 'JetBrains Mono', monospace; font-size: 0.82rem;
    letter-spacing: 0.05em; cursor: pointer; transition: background 0.2s;
  }
  .af-btn-primary:hover:not(:disabled) { background: #1d4ed8; }
  .af-btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
  .af-btn-ghost {
    background: transparent; color: #374151; border: 1px solid rgba(255,255,255,0.08);
    border-radius: 4px; padding: 10px 20px; font-family: 'JetBrains Mono', monospace;
    font-size: 0.82rem; cursor: pointer; transition: all 0.2s;
  }
  .af-btn-ghost:hover { color: #6b7280; border-color: rgba(255,255,255,0.15); }

  @media (max-width: 768px) {
    .af-content { flex-direction: column; }
    .af-panel { flex: none; width: 100%; box-sizing: border-box; padding: 32px 24px; }
    .af-grid-2 { grid-template-columns: 1fr; }
  }
`;

function EditFlight() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [pageLoading, setPageLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [attempted, setAttempted] = useState(false);
  const [selectedAirlineCode, setSelectedAirlineCode] = useState("");
  const [airlines, setAirlines] = useState([]);
  const [airlinesLoading, setAirlinesLoading] = useState(true);
  const [originAirport, setOriginAirport] = useState(null);
  const [destinationAirport, setDestinationAirport] = useState(null);
  const [routeAirlines, setRouteAirlines] = useState([]);
  const [form, setForm] = useState(INITIAL_FORM);

  const formErrors = attempted ? getFormErrors(form) : {};
  const resolvedAirlineCode = selectedAirlineCode || (airlines.find(a => a.name === form.airline)?.iata_code || "");

  useEffect(() => {
    airlinesApi.getAll()
      .then(res => setAirlines(res.data || []))
      .catch(() => setError("Failed to load airlines"))
      .finally(() => setAirlinesLoading(false));
  }, []);

  useEffect(() => {
    flightsApi.getOne(id)
      .then(({ data: flight }) => {
        setForm({
          flight_number: flight.flight_number || "",
          airline: flight.airline || "",
          origin_iata: flight.origin_iata || "",
          destination_iata: flight.destination_iata || "",
          departure_year: flight.departure_year ? String(flight.departure_year) : "",
          aircraft_type: flight.aircraft_type || "",
          cabin_class: flight.cabin_class || "Economy",
          duration_minutes: flight.duration_minutes ? String(flight.duration_minutes) : "",
          notes: flight.notes || "",
        });
        Promise.all([
          airportsApi.getOne(flight.origin_iata).catch(() => null),
          airportsApi.getOne(flight.destination_iata).catch(() => null),
        ]).then(([origin, destination]) => {
          if (origin) setOriginAirport(origin.data);
          if (destination) setDestinationAirport(destination.data);
        });
      })
      .catch(() => setNotFound(true))
      .finally(() => setPageLoading(false));
  }, [id]);

  useEffect(() => {
    if (!form.origin_iata || !form.destination_iata) return;
    let cancelled = false;
    airlinesApi.forRoute(form.origin_iata, form.destination_iata)
      .then(res => { if (!cancelled) setRouteAirlines(res.data || []) })
      .catch(() => { if (!cancelled) setRouteAirlines([]) });
    return () => { cancelled = true };
  }, [form.origin_iata, form.destination_iata]);

  const handleSelectRouteAirline = (airline) => {
    setForm(prev => ({ ...prev, airline: airline.name }));
    setSelectedAirlineCode(airline.iata_code);
  };

  const handleAirlineChange = (e) => {
    const selectedName = e.target.value;
    const selectedAirline = airlines.find(a => a.name === selectedName);
    setForm({ ...form, airline: selectedName });
    setSelectedAirlineCode(selectedAirline?.iata_code || "");
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    setAttempted(true);
    if (Object.keys(getFormErrors(form)).length > 0) {
      setError("Please fix the highlighted fields.");
      return;
    }

    setSaving(true); setError(null);
    try {
      const payload = {
        ...form,
        departure_year: parseInt(form.departure_year),
        departure_month: null,
        departure_day: null,
        duration_minutes: form.duration_minutes ? parseInt(form.duration_minutes) : null,
        departure_time: null,
        arrival_time: null,
        flight_number: form.flight_number || null,
        notes: form.notes || null,
      };
      await flightsApi.update(id, payload);
      navigate("/my-flights");
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to update flight. Please check your inputs.");
    } finally {
      setSaving(false);
    }
  };

  if (pageLoading) {
    return (
      <>
        <style>{styles}</style>
        <div className="af-root">
          <div className="af-panel">
            <p className="af-subtitle">Loading flight...</p>
          </div>
        </div>
      </>
    );
  }

  if (notFound) {
    return (
      <>
        <style>{styles}</style>
        <div className="af-root">
          <div className="af-panel">
            <button className="af-back" onClick={() => navigate("/my-flights")}>← Back</button>
            <div className="af-error">Flight not found.</div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{styles}</style>
      <div className="af-root">
        <div className="af-content">

        <div className="af-panel">
          <button className="af-back" onClick={() => navigate("/my-flights")}>
            ← Back
          </button>
          <h1 className="af-title">Edit Flight</h1>
          <p className="af-subtitle">Update the details of this flight</p>

          {error && <div className="af-error">{error}</div>}

          {/* ROUTE */}
          <div className="af-section-label">Route</div>
          <div className="af-grid-2">
            <label className="af-label">
              <span>Origin *</span>
              <AirportAutocomplete
                className={`af-input ${formErrors.origin_iata ? "invalid" : ""}`}
                value={form.origin_iata}
                onSelect={airport => { setForm({ ...form, origin_iata: airport?.iata_code || "" }); setOriginAirport(airport) }}
                placeholder="MAA or Chennai"
              />
              {formErrors.origin_iata && <div className="af-field-error">{formErrors.origin_iata}</div>}
            </label>
            <label className="af-label">
              <span>Destination *</span>
              <AirportAutocomplete
                className={`af-input ${formErrors.destination_iata ? "invalid" : ""}`}
                value={form.destination_iata}
                onSelect={airport => { setForm({ ...form, destination_iata: airport?.iata_code || "" }); setDestinationAirport(airport) }}
                placeholder="DXB or Dubai"
              />
              {formErrors.destination_iata && <div className="af-field-error">{formErrors.destination_iata}</div>}
            </label>
          </div>
          {form.origin_iata && form.destination_iata && (
            <div className="af-route-preview">
              <span>{form.origin_iata}</span>
              <span className="af-route-preview-arrow">→</span>
              <span>{form.destination_iata}</span>
            </div>
          )}
          {form.origin_iata && form.destination_iata && routeAirlines.length > 0 && (
            <div className="af-route-chips">
              <span className="af-route-chips-label">Flown by:</span>
              {routeAirlines.map(a => (
                <button
                  key={a.iata_code}
                  type="button"
                  className="af-route-chip"
                  onClick={() => handleSelectRouteAirline(a)}
                >
                  {a.name}
                </button>
              ))}
            </div>
          )}

          {/* AIRLINE */}
          <div className="af-section-label">Airline</div>
          <label className="af-label">
            <span>Airline *</span>
            <div className="af-airline-row">
              <select
                className={`af-select ${formErrors.airline ? "invalid" : ""}`}
                name="airline" value={form.airline} onChange={handleAirlineChange} style={{ flex: 1 }}
                disabled={airlinesLoading}
              >
                <option value="">{airlinesLoading ? "Loading airlines..." : "Select airline"}</option>
                {airlines.map(a => (
                  <option key={a.iata_code} value={a.name}>{a.name} ({a.iata_code})</option>
                ))}
              </select>
              {resolvedAirlineCode && (
                <img
                  className="af-airline-logo"
                  src={`https://images.kiwi.com/airlines/64/${resolvedAirlineCode}.png`}
                  alt={form.airline}
                  onError={e => { e.target.style.display = 'none' }}
                />
              )}
            </div>
            {formErrors.airline && <div className="af-field-error">{formErrors.airline}</div>}
          </label>

          {/* FLIGHT NUMBER */}
          <label className="af-label">
            <span>Flight Number</span>
            <div className="af-fn-wrap">
              <div className="af-fn-prefix">{resolvedAirlineCode || '--'}</div>
              <input
                className={`af-input af-fn-input ${formErrors.flight_number ? "invalid" : ""}`}
                name="flight_number"
                value={form.flight_number.replace(resolvedAirlineCode, "")}
                onChange={e => setForm({ ...form, flight_number: `${resolvedAirlineCode}${e.target.value}` })}
                placeholder={resolvedAirlineCode ? "545" : "Select airline first"}
                disabled={!resolvedAirlineCode}
              />
            </div>
            {formErrors.flight_number && <div className="af-field-error">{formErrors.flight_number}</div>}
          </label>

          {/* DATE */}
          <div className="af-section-label">Date</div>
          <label className="af-label">
            <span>Year *</span>
            <input
              className={`af-input ${formErrors.departure_year ? "invalid" : ""}`}
              name="departure_year" value={form.departure_year} onChange={handleChange} placeholder="2024" type="number"
            />
            {formErrors.departure_year && <div className="af-field-error">{formErrors.departure_year}</div>}
          </label>

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
            <input
              className={`af-input ${formErrors.duration_minutes ? "invalid" : ""}`}
              name="duration_minutes" value={form.duration_minutes} onChange={handleChange} placeholder="240" type="number"
            />
            {formErrors.duration_minutes && <div className="af-field-error">{formErrors.duration_minutes}</div>}
          </label>

          {/* NOTES */}
          <div className="af-section-label">Notes</div>
          <label className="af-label">
            <span>Anything memorable?</span>
            <textarea className="af-textarea" name="notes" value={form.notes} onChange={handleChange} placeholder="Anything memorable about this flight..."/>
          </label>

          <div className="af-actions">
            <button className="af-btn-primary" onClick={handleSubmit} disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </button>
            <button className="af-btn-ghost" onClick={() => navigate("/my-flights")}>Cancel</button>
          </div>
        </div>

        <MapBackdropPanel tagline={<>Every flight<br/>tells a story</>}>
          <BoardingPassPreview
            form={form}
            originAirport={originAirport}
            destinationAirport={destinationAirport}
            selectedAirlineCode={resolvedAirlineCode}
          />
        </MapBackdropPanel>

        </div>
      </div>
    </>
  );
}

export default EditFlight;
