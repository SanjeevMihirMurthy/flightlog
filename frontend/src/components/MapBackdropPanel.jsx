const styles = `
  .af-map-panel {
    flex: 1; position: relative; overflow: hidden; min-height: 100vh;
    display: flex; align-items: center; justify-content: center; padding: 3rem 0;
    box-sizing: border-box;
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
    position: absolute; bottom: 2rem; right: 2rem; z-index: 2; text-align: right;
    font-family: 'Syne', sans-serif; font-weight: 800; font-size: 1.8rem;
    color: rgba(255,255,255,0.07); letter-spacing: -0.02em; line-height: 1.1;
    pointer-events: none;
  }

  @media (max-width: 768px) {
    .af-map-panel { min-height: 60vh; padding: 2.5rem 1rem; }
    .af-map-tagline { display: none; }
  }
`;

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
);

function MapBackdropPanel({ children, tagline }) {
  return (
    <>
      <style>{styles}</style>
      <div className="af-map-panel">
        {MAP_SVG}
        <div className="af-map-vignette" />
        <div className="af-map-scanlines" />
        {children}
        {tagline && <div className="af-map-tagline">{tagline}</div>}
      </div>
    </>
  );
}

export default MapBackdropPanel;
