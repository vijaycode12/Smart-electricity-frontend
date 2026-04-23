import { createContext, useContext, useState, useEffect } from 'react'

// ── ThemeContext ─────────────────────────────────────────────────
// Controls dark/light mode across the entire app, including the homepage.
// Saves the user's preference in localStorage so it persists across visits.
//
// Use useTheme() in any component to get:
//   theme       - 'dark' or 'light'
//   toggleTheme - call this to switch between them

// eslint-disable-next-line react-refresh/only-export-components
export const ThemeContext = createContext(null)

export const ThemeProvider = ({ children }) => {
  // Read saved theme from localStorage, default to 'dark'
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('watttrack-theme') || 'dark'
  })

  useEffect(() => {
    localStorage.setItem('watttrack-theme', theme)
    // This one line makes all CSS variables switch automatically
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark')
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useTheme = () => useContext(ThemeContext)
