import { useCallback, useEffect, useState } from 'react'
import apiClient from '../utils/axios'
import { AUTH_API } from '../config/config'
import { getToken, removeToken } from '../utils/auth'
import { AuthContext } from './authContextInstance'

function fetchCurrentUser() {
  return apiClient.get(AUTH_API.ME).then((res) => res.data)
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(() => !!getToken())

  const refreshUser = useCallback(() => {
    return fetchCurrentUser()
      .then(setUser)
      .catch(() => {
        removeToken()
        setUser(null)
      })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!getToken()) return

    fetchCurrentUser()
      .then(setUser)
      .catch(() => {
        removeToken()
        setUser(null)
      })
      .finally(() => setLoading(false))
  }, [])

  const login = () => {
    window.location.href = AUTH_API.LOGIN
  }

  const logout = () => {
    removeToken()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}
