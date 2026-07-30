import apiClient from '../utils/axios'
import { PUBLIC_API } from '../config/config'

export const publicApi = {
  getProfile: (userId) => apiClient.get(PUBLIC_API.PROFILE(userId)),
  getFlights: (userId) => apiClient.get(PUBLIC_API.FLIGHTS(userId)),
  getStats: (userId) => apiClient.get(PUBLIC_API.STATS(userId)),
}
