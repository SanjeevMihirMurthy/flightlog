import apiClient from '../utils/axios'
import { TRACKING_API } from '../config/config'

export const trackingApi = {
  getStatus: (flightNumber, date) => apiClient.get(TRACKING_API.STATUS(flightNumber, date)),
  getLive: (flightNumber) => apiClient.get(TRACKING_API.LIVE(flightNumber)),
}
