import { useNavigate, useLocation } from 'react-router-dom'

function Navbar() {
  const navigate = useNavigate()
  const location = useLocation()

  const isActive = (path) => location.pathname === path

  const navItems = [
    { label: 'Dashboard', path: '/' },
    { label: 'My Flights', path: '/my-flights' },
    { label: 'Map', path: '/map' },
  ]

  return (
    <nav style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 999,
      background: 'rgba(8,11,16,0.95)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid rgba(255,255,255,0.05)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 2.5rem',
      height: '52px'
    }}>

      {/* Logo */}
      <div
        onClick={() => navigate('/')}
        style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
      >
        <span style={{ fontSize: '1rem' }}>✈</span>
        <span style={{
          fontFamily: "'Syne', sans-serif",
          fontWeight: '800',
          fontSize: '1rem',
          color: '#fff',
          letterSpacing: '-0.02em'
        }}>
          Flightlog
        </span>
      </div>

      {/* Nav items */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
        {navItems.map(item => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            style={{
              background: isActive(item.path) ? 'rgba(255,255,255,0.06)' : 'transparent',
              color: isActive(item.path) ? '#fff' : '#4a5568',
              border: 'none',
              borderRadius: '4px',
              padding: '0.4rem 1rem',
              cursor: 'pointer',
              fontFamily: "'DM Mono', monospace",
              fontSize: '0.72rem',
              fontWeight: '400',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              transition: 'all 0.15s ease'
            }}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Log Flight button */}
      <button
        onClick={() => navigate('/add-flight')}
        style={{
          background: '#2563eb',
          color: '#fff',
          border: 'none',
          borderRadius: '4px',
          padding: '0.45rem 1.1rem',
          cursor: 'pointer',
          fontFamily: "'DM Mono', monospace",
          fontSize: '0.72rem',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          transition: 'background 0.2s'
        }}
      >
        + Log Flight
      </button>

    </nav>
  )
}

export default Navbar