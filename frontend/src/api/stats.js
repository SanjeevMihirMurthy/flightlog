import apiClient from '../utils/axios'
import { STATS_API } from '../config/config'

export const statsApi = {
  getMine: () => apiClient.get(STATS_API.ME),
}
