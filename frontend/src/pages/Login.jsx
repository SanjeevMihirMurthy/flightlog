import { useAuth } from '../context/useAuth'

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;700&family=Syne:wght@700;800&display=swap');

  .login-root {
    position: relative;
    min-height: 100vh;
    background: #080b10;
    font-family: 'JetBrains Mono', monospace;
    color: #e8e8e8;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
  }

  .login-video {
    position: fixed;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    z-index: 0;
  }

  .login-video-overlay {
    position: fixed;
    inset: 0;
    z-index: 1;
    background:
      linear-gradient(to bottom, rgba(8,11,16,0.55) 0%, rgba(8,11,16,0.75) 60%, #080b10 100%),
      radial-gradient(ellipse at center, transparent 20%, rgba(8,11,16,0.5) 100%);
  }

  .login-card {
    position: relative;
    z-index: 10;
    background: rgba(8,11,16,0.6);
    border: 1px solid rgba(255,255,255,0.09);
    border-radius: 10px;
    padding: 48px 44px;
    backdrop-filter: blur(18px);
    text-align: center;
    max-width: 380px;
  }

  .login-writeup {
    font-size: 0.78rem;
    line-height: 1.6;
    color: #9ca3af;
    margin: 0 0 32px;
  }

  .login-logo {
    font-size: 1.6rem;
    margin-bottom: 18px;
  }

  .login-title {
    font-family: 'Syne', sans-serif;
    font-weight: 800;
    font-size: 1.6rem;
    letter-spacing: -0.02em;
    color: #fff;
    margin: 0 0 8px;
  }

  .login-subtitle {
    font-size: 0.75rem;
    color: #4a5568;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    margin-bottom: 18px;
  }

  .login-google-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    width: 100%;
    background: #fff;
    color: #1f2937;
    border: none;
    border-radius: 6px;
    padding: 12px 20px;
    cursor: pointer;
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.8rem;
    font-weight: 500;
    letter-spacing: 0.02em;
    transition: background 0.2s;
  }

  .login-google-btn:hover {
    background: #e5e7eb;
  }
`

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84c-.21 1.13-.84 2.08-1.8 2.72v2.26h2.9c1.7-1.56 2.7-3.87 2.7-6.62z" />
      <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.26c-.8.54-1.84.86-3.06.86-2.35 0-4.34-1.59-5.05-3.72H.95v2.33A9 9 0 0 0 9 18z" />
      <path fill="#FBBC05" d="M3.95 10.7A5.4 5.4 0 0 1 3.67 9c0-.59.1-1.17.28-1.7V4.97H.95A9 9 0 0 0 0 9c0 1.45.35 2.83.95 4.03z" />
      <path fill="#EA4335" d="M9 3.58c1.32 0 2.51.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .95 4.97L3.95 7.3C4.66 5.17 6.65 3.58 9 3.58z" />
    </svg>
  )
}

function Login() {
  const { login } = useAuth()

  return (
    <>
      <style>{styles}</style>
      <div className="login-root">
        <video
          className="login-video"
          src="/videos/login-background.mp4"
          autoPlay
          loop
          muted
          playsInline
        />
        <div className="login-video-overlay" />

        <div className="login-card">
          <div className="login-logo">✈</div>
          <h1 className="login-title">Flightlog</h1>
          <p className="login-subtitle">Your personal aviation passport</p>
          <p className="login-writeup">
            Log every flight you've ever taken — routes, airlines, aircraft —
            and watch your journeys come alive on the map.
          </p>
          <button className="login-google-btn" onClick={login}>
            <GoogleIcon />
            Sign in with Google
          </button>
        </div>
      </div>
    </>
  )
}

export default Login
