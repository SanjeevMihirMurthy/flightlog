import { useEffect, useState } from 'react'
import { statsApi } from '../api/stats'

const ACHIEVEMENTS = [
  { id: 'flights-5', label: '5 Flights', description: 'Log 5 flights', check: s => s.total_flights >= 5 },
  { id: 'flights-10', label: '10 Flights', description: 'Log 10 flights', check: s => s.total_flights >= 10 },
  { id: 'flights-25', label: '25 Flights', description: 'Log 25 flights', check: s => s.total_flights >= 25 },
  { id: 'flights-50', label: '50 Flights', description: 'Log 50 flights', check: s => s.total_flights >= 50 },
  { id: 'countries-3', label: '3 Countries', description: 'Visit 3 different countries', check: s => s.unique_countries >= 3 },
  { id: 'countries-5', label: '5 Countries', description: 'Visit 5 different countries', check: s => s.unique_countries >= 5 },
  { id: 'countries-10', label: '10 Countries', description: 'Visit 10 different countries', check: s => s.unique_countries >= 10 },
  { id: 'continents-2', label: 'Two Continents', description: 'Visit 2 continents', check: s => s.unique_continents >= 2 },
  { id: 'continents-4', label: 'Four Continents', description: 'Visit 4 continents', check: s => s.unique_continents >= 4 },
  { id: 'continents-6', label: 'World Traveler', description: 'Visit 6 continents', check: s => s.unique_continents >= 6 },
  { id: 'distance-10k', label: '10,000 km', description: 'Fly 10,000 km total', check: s => s.total_distance_km >= 10000 },
  { id: 'distance-50k', label: '50,000 km', description: 'Fly 50,000 km total', check: s => s.total_distance_km >= 50000 },
  { id: 'distance-100k', label: 'Globe Trotter', description: 'Fly 100,000 km total', check: s => s.total_distance_km >= 100000 },
  { id: 'airlines-3', label: '3 Airlines', description: 'Fly 3 different airlines', check: s => s.unique_airlines >= 3 },
  { id: 'airlines-5', label: '5 Airlines', description: 'Fly 5 different airlines', check: s => s.unique_airlines >= 5 },
  { id: 'aircraft-3', label: '3 Aircraft Types', description: 'Fly 3 different aircraft types', check: s => s.unique_aircraft_types >= 3 },
]

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;700&family=Syne:wght@700;800&display=swap');

  .ach-root {
    min-height: 100vh;
    background: #080b10;
    font-family: 'JetBrains Mono', monospace;
    color: #e8e8e8;
  }

  .ach-content {
    max-width: 960px;
    margin: 0 auto;
    padding: 44px 32px;
  }

  .ach-title {
    font-family: 'Syne', sans-serif;
    font-weight: 800;
    font-size: 2rem;
    letter-spacing: -0.02em;
    color: #fff;
    margin: 0;
  }

  .ach-subtitle {
    font-size: 0.72rem;
    color: #4a5568;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    margin-top: 5px;
    margin-bottom: 32px;
  }

  .ach-stats-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 3px;
    margin-bottom: 32px;
  }

  .ach-stat-card {
    background: rgba(8,11,16,0.75);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 6px;
    padding: 24px 20px;
    backdrop-filter: blur(18px);
  }

  .ach-stat-label {
    font-size: 0.62rem;
    color: #4a5568;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    margin-bottom: 10px;
  }

  .ach-stat-value {
    font-family: 'Syne', sans-serif;
    font-weight: 800;
    font-size: 1.8rem;
    color: #fff;
    letter-spacing: -0.02em;
  }

  .ach-section-label {
    font-size: 0.62rem;
    color: #4a5568;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    margin-bottom: 16px;
  }

  .ach-badge-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 10px;
  }

  .ach-badge {
    border-radius: 6px;
    padding: 18px 16px;
    border: 1px solid rgba(255,255,255,0.07);
    background: rgba(8,11,16,0.75);
  }

  .ach-badge.earned {
    border-color: rgba(59,130,246,0.35);
    background: rgba(59,130,246,0.06);
  }

  .ach-badge-icon {
    font-size: 1.3rem;
    margin-bottom: 10px;
    opacity: 0.3;
  }

  .ach-badge.earned .ach-badge-icon { opacity: 1; }

  .ach-badge-label {
    font-family: 'Syne', sans-serif;
    font-weight: 700;
    font-size: 0.9rem;
    color: #6b7280;
  }

  .ach-badge.earned .ach-badge-label { color: #e8e8e8; }

  .ach-badge-desc {
    font-size: 0.68rem;
    color: #374151;
    margin-top: 4px;
    letter-spacing: 0.02em;
  }

  .ach-loading {
    font-size: 0.8rem;
    color: #374151;
    letter-spacing: 0.1em;
    text-transform: uppercase;
  }
`

function Achievements() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    statsApi.getMine()
      .then(res => setStats(res.data))
      .catch(() => setStats(null))
      .finally(() => setLoading(false))
  }, [])

  const earnedCount = stats ? ACHIEVEMENTS.filter(a => a.check(stats)).length : 0

  return (
    <>
      <style>{styles}</style>
      <div className="ach-root">
        <div className="ach-content">
          <h1 className="ach-title">Achievements</h1>
          <p className="ach-subtitle">
            {stats ? `${earnedCount} of ${ACHIEVEMENTS.length} unlocked` : 'Your milestones so far'}
          </p>

          {loading ? (
            <div className="ach-loading">Loading...</div>
          ) : (
            <>
              <div className="ach-stats-grid">
                <div className="ach-stat-card">
                  <div className="ach-stat-label">Total Flights</div>
                  <div className="ach-stat-value">{stats?.total_flights ?? 0}</div>
                </div>
                <div className="ach-stat-card">
                  <div className="ach-stat-label">Distance Flown</div>
                  <div className="ach-stat-value">{Math.round(stats?.total_distance_km ?? 0).toLocaleString()} km</div>
                </div>
                <div className="ach-stat-card">
                  <div className="ach-stat-label">Countries</div>
                  <div className="ach-stat-value">{stats?.unique_countries ?? 0}</div>
                </div>
                <div className="ach-stat-card">
                  <div className="ach-stat-label">Continents</div>
                  <div className="ach-stat-value">{stats?.unique_continents ?? 0}</div>
                </div>
              </div>

              <div className="ach-section-label">Badges</div>
              <div className="ach-badge-grid">
                {ACHIEVEMENTS.map(achievement => {
                  const earned = stats ? achievement.check(stats) : false
                  return (
                    <div key={achievement.id} className={`ach-badge ${earned ? 'earned' : ''}`}>
                      <div className="ach-badge-icon">{earned ? '★' : '☆'}</div>
                      <div className="ach-badge-label">{achievement.label}</div>
                      <div className="ach-badge-desc">{achievement.description}</div>
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
}

export default Achievements
