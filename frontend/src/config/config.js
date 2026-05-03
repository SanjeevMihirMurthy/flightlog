const API_BASE_URL = "http://localhost:8000";

export const FLIGHT_API = {
  LIST: `${API_BASE_URL}/flights/all-flights`,
  CREATE: `${API_BASE_URL}/flights/add-flight`,
  GET_BY_ID: (id) => `${API_BASE_URL}/flights/${id}`,
  DELETE: (id) => `${API_BASE_URL}/flights/${id}`,
}

export const AIRPORT_API = {
  SEARCH: (query) => `${API_BASE_URL}/airports/search?q=${query}`,
  GET_BY_IATA: (iata) => `${API_BASE_URL}/airports/${iata}`,
}

export const AIRLINES_API = {
  LIST: `${API_BASE_URL}/airlines/all-airlines`
}

export default API_BASE_URL