import '../styles/pages/HomePage.css'
import { useState }  from 'react'
import AuthModal     from '../components/AuthModal'
import Icon          from '../components/Icon'
import { useTheme }  from '../context/ThemeContext'

const FEATURES = [
  { icon: 'bills',     title: 'Upload bills',      desc: 'Add your electricity bills — type the numbers in or just take a photo.' },
  { icon: 'appliance', title: 'Track appliances',  desc: 'Add your fan, fridge, AC and other devices to see what uses the most.' },
  { icon: 'analytics', title: 'See your usage',    desc: 'A simple chart shows how your units and amount change month by month.' },
  { icon: 'trend',     title: 'Next bill guess',   desc: 'Based on past bills, we give you a rough idea of what to expect next.' },
]

const SunIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5"/>
    <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
  </svg>
)
const MoonIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
  </svg>
)

const HomePage = () => {
  const [authOpen, setAuthOpen] = useState(false)
  const [authMode, setAuthMode] = useState('login')
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  const openAuth = (mode) => { setAuthMode(mode); setAuthOpen(true) }

  return (
    <div className="home">

      {/* Navbar — logo left, theme toggle + login/signup right */}
      <nav className="home__nav">
        <div className="home__logo">WattTrack</div>
        <div className="home__nav-actions">
          {/* Theme toggle button */}
          <button
            className="home__theme-btn"
            onClick={toggleTheme}
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDark ? <SunIcon /> : <MoonIcon />}
          </button>
          <button className="home__btn-outline" onClick={() => openAuth('login')}>Log in</button>
          <button className="home__btn-filled"  onClick={() => openAuth('signup')}>Sign up</button>
        </div>
      </nav>

      {/* Hero */}
      <section className="home__hero fade-up">
        <div className="home__hero-content">
          <p className="home__hero-tag">Electricity bill tracker</p>
          <h1 className="home__hero-title">Stop guessing your electricity bill</h1>
          <p className="home__hero-sub">
            Upload your bills, add your appliances, and see where the units are going.
            No setup, no complexity — just your data.
          </p>
          <div className="home__hero-actions">
            <button className="home__hero-cta"       onClick={() => openAuth('signup')}>Create free account</button>
            <button className="home__hero-secondary" onClick={() => openAuth('login')}>I already have an account</button>
          </div>
        </div>
        <div className="home__hero-visual">
          <div className="home__hero-img-wrap">
            <svg className="home__hero-svg" viewBox="0 0 340 280" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Background card */}
              <rect x="20" y="20" width="300" height="240" rx="16" fill="var(--bg2)" stroke="var(--border2)" strokeWidth="1"/>
              {/* Top label */}
              <text x="44" y="56" fontFamily="Georgia, serif" fontSize="13" fontWeight="700" fill="var(--text)">Monthly Usage</text>
              <text x="44" y="72" fontFamily="sans-serif" fontSize="10" fill="var(--text3)">Last 6 months</text>
              {/* Big number */}
              <text x="44" y="112" fontFamily="Georgia, serif" fontSize="34" fontWeight="700" fill="var(--text)">₹ 1,840</text>
              <text x="44" y="130" fontFamily="sans-serif" fontSize="10" fill="var(--text3)">estimated next bill</text>
              {/* Trend chip */}
              <rect x="44" y="142" width="72" height="20" rx="5" fill="var(--bg4)"/>
              <text x="56" y="156" fontFamily="sans-serif" fontSize="10" fill="var(--text2)">↓ 12% lower</text>
              {/* Bar chart */}
              <rect x="44"  y="215" width="28" height="30" rx="3" fill="var(--border2)"/>
              <rect x="84"  y="200" width="28" height="45" rx="3" fill="var(--border2)"/>
              <rect x="124" y="190" width="28" height="55" rx="3" fill="var(--border2)"/>
              <rect x="164" y="205" width="28" height="40" rx="3" fill="var(--border2)"/>
              <rect x="204" y="185" width="28" height="60" rx="3" fill="var(--chart-active)" opacity="0.7"/>
              <rect x="244" y="175" width="28" height="70" rx="3" fill="var(--chart-active)"/>
              {/* X axis labels */}
              <text x="52"  y="252" fontFamily="sans-serif" fontSize="9" fill="var(--text3)" textAnchor="middle">Aug</text>
              <text x="98"  y="252" fontFamily="sans-serif" fontSize="9" fill="var(--text3)" textAnchor="middle">Sep</text>
              <text x="138" y="252" fontFamily="sans-serif" fontSize="9" fill="var(--text3)" textAnchor="middle">Oct</text>
              <text x="178" y="252" fontFamily="sans-serif" fontSize="9" fill="var(--text3)" textAnchor="middle">Nov</text>
              <text x="218" y="252" fontFamily="sans-serif" fontSize="9" fill="var(--text3)" textAnchor="middle">Dec</text>
              <text x="258" y="252" fontFamily="sans-serif" fontSize="9" fill="var(--text2)" fontWeight="600" textAnchor="middle">Jan</text>
            </svg>
          </div>
        </div>
      </section>

      <div className="home__divider" />

      {/* Features */}
      <section className="home__features">
        <h2 className="home__features-title">What it does</h2>
        <div className="home__features-grid">
          {FEATURES.map(f => (
            <div key={f.title} className="home__feature">
              <div className="home__feature-icon">
                <Icon name={f.icon} size={17} color="currentColor" />
              </div>
              <h3 className="home__feature-title">{f.title}</h3>
              <p className="home__feature-desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="home__cta">
        <h2 className="home__cta-title">Give it a try</h2>
        <p className="home__cta-sub">Takes about two minutes to set up. Free to use.</p>
        <button className="home__cta-btn" onClick={() => openAuth('signup')}>Get started</button>
      </section>

      {/* Footer */}
      <footer className="home__footer">
        <span>WattTrack</span>
        <span>Electricity bill tracker</span>
      </footer>

      {authOpen && (
        <AuthModal
          mode={authMode}
          onModeChange={setAuthMode}
          onClose={() => setAuthOpen(false)}
        />
      )}
    </div>
  )
}

export default HomePage
