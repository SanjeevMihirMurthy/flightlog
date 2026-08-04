import WikiThumbnail from "./WikiThumbnail";

const styles = `
  @keyframes af-pop-in {
    from { opacity: 0; transform: scale(0.92) translateY(14px); }
    to { opacity: 1; transform: scale(1) translateY(0); }
  }
  @keyframes af-glow-pulse {
    0%, 100% { box-shadow: 0 24px 60px rgba(0,0,0,0.5), 0 0 0 rgba(59,130,246,0); }
    50% { box-shadow: 0 24px 60px rgba(0,0,0,0.5), 0 0 32px rgba(59,130,246,0.25); }
  }
  @keyframes af-glow-pulse-warn {
    0%, 100% { box-shadow: 0 24px 60px rgba(0,0,0,0.5), 0 0 0 rgba(239,68,68,0); }
    50% { box-shadow: 0 24px 60px rgba(0,0,0,0.5), 0 0 32px rgba(239,68,68,0.3); }
  }

  /* Boarding pass preview — tall/narrow, like the form panel */
  .af-boarding-pass {
    z-index: 2; width: 440px; max-width: 90%;
    background: rgba(10,14,20,0.88); backdrop-filter: blur(16px);
    border: 1px solid rgba(255,255,255,0.1); border-radius: 24px;
    overflow: hidden;
    animation: af-pop-in 0.55s cubic-bezier(0.34,1.56,0.64,1) backwards,
               af-glow-pulse 4s ease-in-out infinite;
  }
  .af-boarding-pass.invalid {
    border-color: rgba(239,68,68,0.3);
    animation: af-pop-in 0.55s cubic-bezier(0.34,1.56,0.64,1) backwards,
               af-glow-pulse-warn 2s ease-in-out infinite;
  }
  .af-bp-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 24px 28px; border-bottom: 1px dashed rgba(255,255,255,0.14);
  }
  .af-bp-airline { display: flex; align-items: center; gap: 12px; min-width: 0; }
  .af-bp-airline-logo {
    width: 40px; height: 40px; object-fit: contain; flex-shrink: 0;
    background: #fff; border-radius: 8px; padding: 3px;
  }
  .af-bp-airline-logo-empty {
    display: flex; align-items: center; justify-content: center;
    color: rgba(255,255,255,0.3); background: rgba(255,255,255,0.05); font-size: 1.2rem;
  }
  .af-bp-airline-name {
    font-size: 1.1rem; font-weight: 500; color: #e8e8e8;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .af-bp-tag {
    font-size: 0.66rem; letter-spacing: 0.14em; color: #60a5fa;
    text-transform: uppercase; font-weight: 700; flex-shrink: 0; margin-left: 10px;
  }

  .af-bp-route { display: flex; flex-direction: column; align-items: center; padding: 28px 28px 24px; }
  .af-bp-endpoint { display: flex; flex-direction: column; align-items: center; gap: 12px; width: 100%; }
  .af-bp-photo {
    width: 100%; height: 150px; border-radius: 12px; overflow: hidden;
    border: 1px solid rgba(255,255,255,0.1);
  }
  .af-bp-photo-img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .af-bp-photo-empty {
    width: 100%; height: 100%;
    display: flex; align-items: center; justify-content: center;
    color: rgba(255,255,255,0.2); background: rgba(255,255,255,0.03); font-size: 2rem;
  }
  .af-bp-photo-warn {
    width: 100%; height: 100%;
    display: flex; align-items: center; justify-content: center;
    color: rgba(239,68,68,0.6); background: rgba(239,68,68,0.06); font-size: 2rem;
  }
  .af-bp-code {
    font-family: 'Syne', sans-serif; font-weight: 800; font-size: 2.6rem;
    color: #fff; letter-spacing: 0.02em;
  }
  .af-bp-code-warn { color: #f87171; }
  .af-bp-city {
    font-size: 0.8rem; color: rgba(255,255,255,0.4); text-transform: uppercase;
    letter-spacing: 0.06em; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%;
  }
  .af-bp-city-warn { color: #f87171; }
  .af-bp-path-vertical {
    position: relative; width: 100%; height: 48px;
    display: flex; align-items: center; justify-content: center;
  }
  .af-bp-path-vertical::before {
    content: ''; position: absolute; left: 50%; top: 0; bottom: 0;
    border-left: 3px dashed rgba(59,130,246,0.4);
  }
  .af-bp-plane {
    position: relative; z-index: 1; background: #0a0e14; border-radius: 50%;
    color: #60a5fa; font-size: 1.4rem; padding: 6px; line-height: 1;
    transform: rotate(180deg);
  }

  .af-bp-fields { display: flex; justify-content: space-between; padding: 0 28px 28px; }
  .af-bp-field { display: flex; flex-direction: column; gap: 5px; }
  .af-bp-field-label { font-size: 0.66rem; color: rgba(255,255,255,0.35); text-transform: uppercase; letter-spacing: 0.1em; }
  .af-bp-field-value { font-size: 1.05rem; color: #e8e8e8; font-weight: 500; }

  .af-bp-perforation { position: relative; height: 0; border-top: 1px dashed rgba(255,255,255,0.18); }
  .af-bp-notch {
    position: absolute; top: 50%; transform: translateY(-50%);
    width: 30px; height: 30px; border-radius: 50%; background: #0a0e14;
  }
  .af-bp-notch-left { left: -15px; }
  .af-bp-notch-right { right: -15px; }

  .af-bp-stub { display: flex; align-items: center; gap: 18px; padding: 24px 28px; }
  .af-bp-stub-photo { width: 76px; height: 58px; border-radius: 10px; overflow: hidden; flex-shrink: 0; border: 1px solid rgba(255,255,255,0.1); }
  .af-bp-stub-info { display: flex; flex-direction: column; gap: 5px; flex: 1; min-width: 0; }
  .af-bp-barcode {
    width: 108px; height: 50px; flex-shrink: 0; opacity: 0.5;
    background: repeating-linear-gradient(90deg, #fff 0 2px, transparent 2px 4px, #fff 4px 5px, transparent 5px 9px, #fff 9px 10px, transparent 10px 13px, #fff 13px 15px, transparent 15px 18px);
  }

  .wiki-thumb-placeholder {
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    gap: 7px; color: rgba(255,255,255,0.25); font-size: 0.76rem;
    letter-spacing: 0.06em; text-transform: uppercase;
  }
  .wiki-thumb-icon { font-size: 1.7rem; }
`;

function BoardingPassPreview({ form, originAirport, destinationAirport, selectedAirlineCode }) {
  const hasContent = originAirport || destinationAirport || selectedAirlineCode || form.aircraft_type.trim().length >= 3;
  const routeConflict = Boolean(form.origin_iata && form.destination_iata && form.origin_iata === form.destination_iata);

  return (
    <>
      <style>{styles}</style>
      {hasContent && (
        <div className={`af-boarding-pass ${routeConflict ? "invalid" : ""}`}>
          <div className="af-bp-header">
            <div className="af-bp-airline">
              {selectedAirlineCode ? (
                <img
                  className="af-bp-airline-logo"
                  src={`https://images.kiwi.com/airlines/64/${selectedAirlineCode}.png`}
                  alt={form.airline}
                  onError={e => { e.target.style.display = 'none' }}
                />
              ) : (
                <div className="af-bp-airline-logo af-bp-airline-logo-empty">✈</div>
              )}
              <span className="af-bp-airline-name">{form.airline || "Your Airline"}</span>
            </div>
            <span className="af-bp-tag">Boarding Pass</span>
          </div>

          <div className="af-bp-route">
            <div className="af-bp-endpoint">
              <div className="af-bp-photo">
                {originAirport
                  ? <WikiThumbnail className="af-bp-photo-img" query={originAirport.name} alt={originAirport.name} />
                  : <div className="af-bp-photo-img af-bp-photo-empty">✈</div>}
              </div>
              <div className="af-bp-code">{form.origin_iata || "———"}</div>
              <div className="af-bp-city">{originAirport?.city || "Origin"}</div>
            </div>

            <div className="af-bp-path-vertical">
              <span className="af-bp-plane">✈</span>
            </div>

            <div className="af-bp-endpoint">
              <div className="af-bp-photo">
                {routeConflict
                  ? <div className="af-bp-photo-img af-bp-photo-warn">⚠</div>
                  : destinationAirport
                    ? <WikiThumbnail className="af-bp-photo-img" query={destinationAirport.name} alt={destinationAirport.name} />
                    : <div className="af-bp-photo-img af-bp-photo-empty">✈</div>}
              </div>
              <div className={`af-bp-code ${routeConflict ? "af-bp-code-warn" : ""}`}>{form.destination_iata || "———"}</div>
              <div className={`af-bp-city ${routeConflict ? "af-bp-city-warn" : ""}`}>
                {routeConflict ? "Same as origin" : (destinationAirport?.city || "Destination")}
              </div>
            </div>
          </div>

          <div className="af-bp-fields">
            <div className="af-bp-field">
              <span className="af-bp-field-label">Flight</span>
              <span className="af-bp-field-value">
                {selectedAirlineCode ? `${selectedAirlineCode}${form.flight_number.replace(selectedAirlineCode, "")}` : "—"}
              </span>
            </div>
            <div className="af-bp-field">
              <span className="af-bp-field-label">Class</span>
              <span className="af-bp-field-value">{form.cabin_class}</span>
            </div>
            <div className="af-bp-field">
              <span className="af-bp-field-label">Date</span>
              <span className="af-bp-field-value">{form.departure_year || "—"}</span>
            </div>
          </div>

          <div className="af-bp-perforation">
            <span className="af-bp-notch af-bp-notch-left" />
            <span className="af-bp-notch af-bp-notch-right" />
          </div>

          <div className="af-bp-stub">
            <div className="af-bp-stub-photo">
              {form.aircraft_type.trim().length >= 3
                ? <WikiThumbnail className="af-bp-photo-img" query={form.aircraft_type} alt={form.aircraft_type} />
                : <div className="af-bp-photo-img af-bp-photo-empty">✈</div>}
            </div>
            <div className="af-bp-stub-info">
              <span className="af-bp-field-label">Aircraft</span>
              <span className="af-bp-field-value">{form.aircraft_type || "TBD"}</span>
            </div>
            <div className="af-bp-barcode" />
          </div>
        </div>
      )}
    </>
  );
}

export default BoardingPassPreview;
