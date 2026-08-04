import apiClient from '../utils/axios'
import { FLIGHT_API, AIRPORT_API, AIRLINES_API } from '../config/config'

const asFormData = (file) => {
  const formData = new FormData()
  formData.append("file", file)
  return formData
}

export const flightsApi = {
  getAll: () => apiClient.get(FLIGHT_API.LIST),
  getOne: (id) => apiClient.get(FLIGHT_API.GET_BY_ID(id)),
  create: (data) => apiClient.post(FLIGHT_API.CREATE, data),
  update: (id, data) => apiClient.put(FLIGHT_API.UPDATE(id), data),
  delete: (id) => apiClient.delete(FLIGHT_API.DELETE(id)),
  extractFromImage: (file) => apiClient.post(FLIGHT_API.EXTRACT, asFormData(file), {
    headers: { "Content-Type": "multipart/form-data" },
  }),
  importCsv: (file) => apiClient.post(FLIGHT_API.IMPORT_CSV, asFormData(file), {
    headers: { "Content-Type": "multipart/form-data" },
  }),
}

export const airportsApi = {
  search: (query) => apiClient.get(AIRPORT_API.SEARCH(query)),
  getOne: (iata) => apiClient.get(AIRPORT_API.GET_BY_IATA(iata)),
}

export const airlinesApi = {
  getAll: () => apiClient.get(AIRLINES_API.LIST),
  forRoute: (origin, destination) => apiClient.get(AIRLINES_API.FOR_ROUTE(origin, destination)),
}