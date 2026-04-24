import { BrowserRouter, Routes, Route } from 'react-router-dom'
import FlightLog from './pages/FlightLog'
import AddFlight from './pages/AddFlight'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<FlightLog />} />
        <Route path="/add-flight" element={<AddFlight />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App