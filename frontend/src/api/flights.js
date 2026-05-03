import apiClient from '../utils/axios'
import { FLIGHT_API, AIRPORT_API, AIRLINES_API } from '../config/config'

export const flightsApi = {
  getAll: () => apiClient.get(FLIGHT_API.LIST),
  getOne: (id) => apiClient.get(FLIGHT_API.GET_BY_ID(id)),
  create: (data) => apiClient.post(FLIGHT_API.CREATE, data),
  delete: (id) => apiClient.delete(FLIGHT_API.DELETE(id)),
}

export const airportsApi = {
  search: (query) => apiClient.get(AIRPORT_API.SEARCH(query)),
  getOne: (iata) => apiClient.get(AIRPORT_API.GET_BY_IATA(iata)),
}

export const airlinesApi = {
  getAll: () => apiClient.get(AIRLINES_API.LIST)
}