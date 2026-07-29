import { useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { setToken } from '../utils/auth'
import { useAuth } from '../context/useAuth'

function AuthCallback() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { refreshUser } = useAuth()
  const ran = useRef(false)

  useEffect(() => {
    if (ran.current) return
    ran.current = true

    const token = searchParams.get('token')
    if (!token) {
      navigate('/login', { replace: true })
      return
    }

    setToken(token)
    refreshUser().then(() => navigate('/', { replace: true }))
  }, [searchParams, navigate, refreshUser])

  return null
}

export default AuthCallback
