import '../styles/components/Layout.css'
import { useState }    from 'react'
import Sidebar         from './Sidebar'
import Dashboard       from '../pages/Dashboard'
import BillsPage       from '../pages/BillsPage'
import AppliancesPage  from '../pages/AppliancesPage'
import AnalyticsPage   from '../pages/AnalyticsPage'
import ProfilePage     from '../pages/ProfilePage'
import { useTheme }    from '../context/ThemeContext'

const SunIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5"/>
    <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
  </svg>
)
const MoonIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
  </svg>
)

// ── Layout ───────────────────────────────────────────────────────
// Main shell after login: sidebar left, page content right.
// Theme toggle lives at top-right of the main content area.
const Layout = () => {
  const [activePage, setActivePage] = useState('dashboard')
  const [refreshKey, setRefreshKey] = useState(0)
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  const handleNav = (page) => {
    setActivePage(page)
    setRefreshKey(k => k + 1)
  }

  return (
    <div className="layout">
      <Sidebar active={activePage} setActive={handleNav} />
      <main className="layout__main">
        <div className="layout__topbar">
          <button
            className="layout__theme-btn"
            onClick={toggleTheme}
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDark ? <SunIcon /> : <MoonIcon />}
          </button>
        </div>
        {activePage === 'dashboard'  && <Dashboard     key={refreshKey} />}
        {activePage === 'bills'      && <BillsPage      key={refreshKey} />}
        {activePage === 'appliances' && <AppliancesPage key={refreshKey} />}
        {activePage === 'analytics'  && <AnalyticsPage  key={refreshKey} />}
        {activePage === 'profile'    && <ProfilePage    key={refreshKey} />}
      </main>
    </div>
  )
}

export default Layout
