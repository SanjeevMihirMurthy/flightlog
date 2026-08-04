import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/useAuth'

const styles = `
  .nav-bar {
    position: fixed; top: 0; left: 0; right: 0; z-index: 999;
    background: rgba(8,11,16,0.95); backdrop-filter: blur(12px);
    border-bottom: 1px solid rgba(255,255,255,0.05);
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 2.5rem; height: 52px;
    font-family: 'JetBrains Mono', monospace;
  }
  .nav-logo { display: flex; align-items: center; gap: 10px; cursor: pointer; }
  .nav-logo-img { height: 20px; width: auto; display: block; mix-blend-mode: lighten; }

  .nav-links { display: flex; align-items: center; gap: 2px; }
  .nav-link {
    background: transparent; color: #4a5568; border: none; border-radius: 4px;
    padding: 0.4rem 1rem; cursor: pointer; font-family: 'JetBrains Mono', monospace;
    font-size: 0.72rem; font-weight: 400; letter-spacing: 0.08em; text-transform: uppercase;
    transition: all 0.15s ease;
  }
  .nav-link.active { background: rgba(255,255,255,0.06); color: #fff; }

  .nav-right { display: flex; align-items: center; gap: 14px; }
  .nav-cta {
    background: #2563eb; color: #fff; border: none; border-radius: 4px;
    padding: 0.45rem 1.1rem; cursor: pointer; font-family: 'JetBrains Mono', monospace;
    font-size: 0.72rem; letter-spacing: 0.08em; text-transform: uppercase; transition: background 0.2s;
  }
  .nav-cta:hover { background: #1d4ed8; }

  .nav-user { display: flex; align-items: center; gap: 10px; }
  .nav-avatar { width: 26px; height: 26px; border-radius: 50%; }
  .nav-avatar-fallback {
    width: 26px; height: 26px; border-radius: 50%; background: #1f2937; color: #9ca3af;
    display: flex; align-items: center; justify-content: center; font-size: 0.7rem;
  }
  .nav-username { font-size: 0.72rem; color: #9ca3af; }
  .nav-logout {
    background: transparent; color: #4a5568; border: none; cursor: pointer;
    font-family: 'JetBrains Mono', monospace; font-size: 0.68rem; letter-spacing: 0.08em;
    text-transform: uppercase; transition: color 0.15s;
  }
  .nav-logout:hover { color: #9ca3af; }

  .nav-hamburger {
    display: none; background: none; border: none; color: #e8e8e8;
    font-size: 1.3rem; cursor: pointer; padding: 4px 8px; line-height: 1;
  }

  .nav-mobile-menu { display: none; }

  @media (max-width: 768px) {
    .nav-bar { padding: 0 1.25rem; }
    .nav-links, .nav-right { display: none; }
    .nav-hamburger { display: block; }

    .nav-mobile-menu.open {
      display: flex; flex-direction: column; gap: 4px;
      position: fixed; top: 52px; left: 0; right: 0; z-index: 998;
      background: rgba(8,11,16,0.98); backdrop-filter: blur(12px);
      border-bottom: 1px solid rgba(255,255,255,0.08);
      padding: 12px 16px 16px;
      max-height: calc(100vh - 52px); overflow-y: auto;
    }
    .nav-mobile-menu .nav-link { text-align: left; padding: 10px 12px; font-size: 0.78rem; }
    .nav-mobile-menu .nav-cta { width: 100%; padding: 10px; margin-top: 6px; box-sizing: border-box; }
    .nav-mobile-user {
      display: flex; align-items: center; justify-content: space-between;
      margin-top: 10px; padding-top: 10px; border-top: 1px solid rgba(255,255,255,0.06);
    }
  }
`

function Navbar() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const isActive = (path) => location.pathname === path

  const navItems = [
    { label: 'Dashboard', path: '/' },
    { label: 'My Flights', path: '/my-flights' },
    { label: 'Map', path: '/map' },
    { label: 'Achievements', path: '/achievements' },
  ]

  const goTo = (path) => {
    setMenuOpen(false)
    navigate(path)
  }

  return (
    <>
      <style>{styles}</style>
      <nav className="nav-bar">
        <div className="nav-logo" onClick={() => goTo('/')}>
          <img src="/logo.png" alt="Flightlog" className="nav-logo-img" />
        </div>

        <div className="nav-links">
          {navItems.map(item => (
            <button
              key={item.path}
              className={`nav-link ${isActive(item.path) ? 'active' : ''}`}
              onClick={() => navigate(item.path)}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="nav-right">
          <button className="nav-cta" onClick={() => navigate('/add-flight')}>+ Log Flight</button>
          {user && (
            <div className="nav-user">
              {user.picture ? (
                <img className="nav-avatar" src={user.picture} alt={user.name || user.email} />
              ) : (
                <div className="nav-avatar-fallback">{(user.name || user.email || '?').charAt(0).toUpperCase()}</div>
              )}
              <button className="nav-logout" onClick={handleLogout}>Log out</button>
            </div>
          )}
        </div>

        <button className="nav-hamburger" onClick={() => setMenuOpen(o => !o)} aria-label="Menu">
          {menuOpen ? '✕' : '☰'}
        </button>

        <div className={`nav-mobile-menu ${menuOpen ? 'open' : ''}`}>
          {navItems.map(item => (
            <button
              key={item.path}
              className={`nav-link ${isActive(item.path) ? 'active' : ''}`}
              onClick={() => goTo(item.path)}
            >
              {item.label}
            </button>
          ))}
          <button className="nav-cta" onClick={() => goTo('/add-flight')}>+ Log Flight</button>
          {user && (
            <div className="nav-mobile-user">
              <div className="nav-user">
                {user.picture ? (
                  <img className="nav-avatar" src={user.picture} alt={user.name || user.email} />
                ) : (
                  <div className="nav-avatar-fallback">{(user.name || user.email || '?').charAt(0).toUpperCase()}</div>
                )}
                <span className="nav-username">{user.name || user.email}</span>
              </div>
              <button className="nav-logout" onClick={() => { setMenuOpen(false); handleLogout() }}>Log out</button>
            </div>
          )}
        </div>
      </nav>
    </>
  )
}

export default Navbar
