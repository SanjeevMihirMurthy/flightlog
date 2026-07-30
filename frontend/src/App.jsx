import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import FlightLog from './pages/Flightlog'
import AddFlight from './pages/AddFlight'
import FlightMap from './pages/FlightMap'
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'
import AuthCallback from './pages/AuthCallback'
import TrackFlight from './pages/TrackFlight'
import { AuthProvider } from './context/AuthContext'

function Layout() {
  const location = useLocation()
  const hideNavbar = location.pathname === '/map' || location.pathname === '/login'

  return (
    <>
      {!hideNavbar && <Navbar />}
      <div style={{ paddingTop: hideNavbar ? '0' : '56px' }}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/my-flights" element={<ProtectedRoute><FlightLog /></ProtectedRoute>} />
          <Route path="/add-flight" element={<ProtectedRoute><AddFlight /></ProtectedRoute>} />
          <Route path="/map" element={<ProtectedRoute><FlightMap /></ProtectedRoute>} />
          <Route path="/track" element={<ProtectedRoute><TrackFlight /></ProtectedRoute>} />
        </Routes>
      </div>
    </>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Layout />
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App