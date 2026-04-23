import { createContext, useContext, useState, useEffect } from 'react'
import { api } from '../api'

// ── AuthContext ──────────────────────────────────────────────────
// This context stores who is currently logged in.
// Auth is now fully cookie-based — no localStorage involved.
// The cookie is set by the backend on login and sent automatically
// with every request via credentials: 'include' in the API helper.
//
// Any component in the app can call useAuth() to get:
//   user    - the logged-in user object (or null if not logged in)
//   login   - function to log the user in
//   logout  - function to log the user out
//   checked - true once we've verified the session on first load

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null)   // logged-in user or null
  const [checked, setChecked] = useState(false)  // have we verified the session yet?

  // On first load, ask the server if the cookie is still valid.
  // No localStorage check needed — the browser sends the cookie automatically.
  useEffect(() => {
    api.get('api/v1/auth/me')
      .then(res => { if (res.success) setUser(res.user) })
      .finally(() => setChecked(true))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Called after successful login or signup.
  // Token is in the cookie set by the backend — we just store the user object.
  const login = (userData) => {
    setUser(userData)
  }

  // Called when user clicks logout.
  // Backend clears the cookie, we clear the user from state.
  const logout = async () => {
    await api.post('api/v1/auth/sign-out', {})
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