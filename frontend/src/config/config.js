const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || `http://${window.location.hostname}:8000`;

export const FLIGHT_API = {
  LIST: `${API_BASE_URL}/flights/all-flights`,
  CREATE: `${API_BASE_URL}/flights/add-flight`,
  GET_BY_ID: (id) => `${API_BASE_URL}/flights/${id}`,
  UPDATE: (id) => `${API_BASE_URL}/flights/${id}`,
  DELETE: (id) => `${API_BASE_URL}/flights/${id}`,
  EXTRACT: `${API_BASE_URL}/flights/extract`,
  IMPORT_CSV: `${API_BASE_URL}/flights/import-csv`,
}

export const AIRPORT_API = {
  SEARCH: (query) => `${API_BASE_URL}/airports/search?q=${query}`,
  GET_BY_IATA: (iata) => `${API_BASE_URL}/airports/${iata}`,
}

export const AIRLINES_API = {
  LIST: `${API_BASE_URL}/airlines/all-airlines`,
  FOR_ROUTE: (origin, destination) => `${API_BASE_URL}/airlines/for-route?origin_iata=${origin}&destination_iata=${destination}`,
}

export const AUTH_API = {
  LOGIN: `${API_BASE_URL}/auth/login`,
  ME: `${API_BASE_URL}/auth/me`,
}

export const STATS_API = {
  ME: `${API_BASE_URL}/stats/me`,
}

export const PUBLIC_API = {
  PROFILE: (userId) => `${API_BASE_URL}/public/${userId}/profile`,
  FLIGHTS: (userId) => `${API_BASE_URL}/public/${userId}/flights`,
  STATS: (userId) => `${API_BASE_URL}/public/${userId}/stats`,
}

export const TRACKING_API = {
  STATUS: (flightNumber, date) => {
    const params = new URLSearchParams({ flight_number: flightNumber })
    if (date) params.set('flight_date', date)
    return `${API_BASE_URL}/tracking/status?${params.toString()}`
  },
  LIVE: (flightNumber) => `${API_BASE_URL}/tracking/live?${new URLSearchParams({ flight_number: flightNumber }).toString()}`,
}

export default API_BASE_URL