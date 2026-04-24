import { createContext, useContext, useState, useEffect } from 'react'
import { api } from '../api'

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null)
  const [checked, setChecked] = useState(false)

  // On first load, check if a token exists and verify it with the server
  useEffect(() => {
    const savedToken = localStorage.getItem('token')
    if (savedToken) {
      api.get('api/v1/auth/me')
        .then(res => { if (res.success) setUser(res.user) })
        .finally(() => setChecked(true))
    } else {
      setChecked(true)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Save token to localStorage and store user in state
  const login = (userData, token) => {
    localStorage.setItem('token', token)
    setUser(userData)
  }

  // Clear token and user
  const logout = async () => {
    await api.post('api/v1/auth/sign-out', {})
    localStorage.removeItem('token')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, checked }}>
      {children}
    </AuthContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext)