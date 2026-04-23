import { AuthProvider, useAuth } from './context/AuthContext'
import { ToastProvider }         from './context/ToastContext'
import { ThemeProvider }         from './context/ThemeContext'
import Layout                    from './components/Layout'
import HomePage                  from './pages/HomePage'
import Loader                    from './components/Loader'

// ── AppInner ────────────────────────────────────────────────────
// This component decides what to show based on whether the user
// is logged in or not.
//
//   checked = false  →  still loading (checking if token is valid)
//   checked = true, no user  →  show HomePage (with login/signup in navbar)
//   checked = true, user exists  →  show the main app (Layout)
const AppInner = () => {
  const { user, checked } = useAuth()

  // Still checking the saved token — show a loading spinner
  if (!checked) return <Loader fullPage />

  // Not logged in — show homepage with login/signup buttons in top-right
  if (!user) return <HomePage />

  // Logged in — show the full app
  return <Layout />
}

// ── App ─────────────────────────────────────────────────────────
// Wraps everything with providers so all child components can
// access theme, auth, and toast notifications.
const App = () => (
  <ThemeProvider>
    <AuthProvider>
      <ToastProvider>
        <AppInner />
      </ToastProvider>
    </AuthProvider>
  </ThemeProvider>
)

export default App
