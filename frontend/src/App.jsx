import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import FlightLog from './pages/FlightLog'
import AddFlight from './pages/AddFlight'
import FlightMap from './pages/FlightMap'
import Dashboard from './pages/Dashboard'

function Layout() {
  const location = useLocation()
  const hideNavbar = location.pathname === '/map'

  return (
    <>
      {!hideNavbar && <Navbar />}
      <div style={{ paddingTop: hideNavbar ? '0' : '56px' }}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/my-flights" element={<FlightLog />} />
          <Route path="/add-flight" element={<AddFlight />} />
          <Route path="/map" element={<FlightMap />} />
        </Routes>
      </div>
    </>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Layout />
    </BrowserRouter>
  )
}

export default App