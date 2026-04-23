import { createContext, useContext, useState, useEffect } from 'react'
import { api } from '../api'

// ── AuthContext ──────────────────────────────────────────────────
// This context stores who is currently logged in.
// Any component in the app can call useAuth() to get:
//   user    - the logged-in user object (or null if not logged in)
//   login   - function to log the user in
//   logout  - function to log the user out
//   checked - true once we've verified the saved token (prevents flash)

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null)   // logged-in user or null
  const [checked, setChecked] = useState(false)  // have we checked localStorage yet?

  // On first load, check if a token was saved from a previous session
  useEffect(() => {
    const savedToken = localStorage.getItem('token')
    if (savedToken) {
      // Token exists — verify it's still valid with the server
      api.get('/auth/me', {})
        .then(res => { if (res.success) setUser(res.user) })
        .finally(() => setChecked(true))
    } else {
      // No token saved — user is not logged in
      setChecked(true)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Called when user successfully logs in or signs up
  const login = (userData, token) => {
    localStorage.setItem('token', token) // save token so they stay logged in
    setUser(userData)
  }

  // Called when user clicks logout
  const logout = async () => {
    await api.post('/auth/sign-out', {})
    localStorage.removeItem('token') // remove saved token
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
