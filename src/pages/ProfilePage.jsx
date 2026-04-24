import '../styles/pages/ProfilePage.css'
import { useState, useEffect } from 'react'
import { api }       from '../api'
import { useAuth }   from '../context/AuthContext'
import { useToast }  from '../context/ToastContext'
import { useTheme }  from '../context/ThemeContext'
import Btn           from '../components/Btn'
import Loader        from '../components/Loader'
import Icon          from '../components/Icon'

// FormField — outside component to avoid focus loss
const F = ({ label, children }) => (
  <div className="form-field"><label>{label}</label>{children}</div>
)

const { user, login, logout, checked } = useAuth();

const TABS = [
  { id: 'overview', label: 'Overview'     },
  { id: 'edit',     label: 'Edit Profile' },
  { id: 'security', label: 'Security'     },
  { id: 'settings', label: 'Settings'     },
]

// ── ProfilePage ───────────────────────────────────────────────────
const ProfilePage = () => {
  const { user, login }        = useAuth()
  const toast                  = useToast()
  const { theme, toggleTheme } = useTheme()
  const isDark                 = theme === 'dark'

  const [stats, setStats]               = useState(null)
  const [loadingStats, setLoadingStats] = useState(true)
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingPass, setSavingPass]     = useState(false)
  const [activeTab, setActiveTab]       = useState('overview')

  const [profile, setProfile] = useState({ username: user?.username || '', email: user?.email || '' })
  const [pass, setPass]       = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })

  const setP  = (k, v) => setProfile(f => ({ ...f, [k]: v }))
  const setP2 = (k, v) => setPass(f => ({ ...f, [k]: v }))

  useEffect(() => {
    const load = async () => {
      setLoadingStats(true)
      try {
        const [bills, appliances, eff, monthly] = await Promise.all([
          api.get('api/v1/bill/bills'),
          api.get('api/v1/appliance/appliances'),
          api.get('api/v1/analytics/analytics/eff-score'),
          api.get('api/v1/analytics/analytics/monthly-usage'),
        ])
        const bd = bills.data || [], ad = appliances.data || [], md = monthly.data || []
        const totalSpend = bd.reduce((s, b) => s + (b.totalAmount || 0), 0)
        const totalUnits = bd.reduce((s, b) => s + (b.totalUnits  || 0), 0)
        setStats({
          totalBills:       bd.length,
          totalAppliances:  ad.length,
          totalUnits:       totalUnits.toFixed(1),
          totalSpend:       totalSpend.toFixed(0),
          avgBill:          bd.length ? (totalSpend / bd.length).toFixed(0) : 0,
          totalKwh:         ad.reduce((s, a) => s + (a.unitsConsumed || 0), 0).toFixed(1),
          efficiencyScore:  eff?.efficiencyScore ?? 0,
          effLabel:         eff?.label ?? 'N/A',
          bestMonth:        [...md].sort((a, b) => a.totalUnits - b.totalUnits)[0],
          worstMonth:       [...md].sort((a, b) => b.totalUnits - a.totalUnits)[0],
          highestApp:       [...ad].sort((a, b) => b.unitsConsumed - a.unitsConsumed)[0],
        })
      } catch { toast('Failed to load stats', 'error') }
      setLoadingStats(false)
    }
    load()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const saveProfile = async () => {
    if (!profile.username || !profile.email) return toast('All fields required', 'error')
    setSavingProfile(true)
    const res = await api.put('/auth/profile', profile)
    if (res.success) {
      toast('Profile updated!')
      login({ ...user, username: profile.username, email: profile.email }, localStorage.getItem('token'))
      setActiveTab('overview')
    } else toast(res.message || 'Failed', 'error')
    setSavingProfile(false)
  }

  const savePassword = async () => {
    if (!pass.currentPassword || !pass.newPassword) return toast('All fields required', 'error')
    if (pass.newPassword !== pass.confirmPassword)   return toast('Passwords do not match', 'error')
    if (pass.newPassword.length < 6)                 return toast('Min 6 characters', 'error')
    setSavingPass(true)
    const res = await api.put('/auth/profile', { currentPassword: pass.currentPassword, newPassword: pass.newPassword })
    if (res.success) { toast('Password changed!'); setPass({ currentPassword: '', newPassword: '', confirmPassword: '' }) }
    else toast(res.message || 'Failed', 'error')
    setSavingPass(false)
  }

  const strengthColor = (score) => score >= 90 ? 'var(--text)' : score >= 70 ? 'var(--text2)' : 'var(--danger)'

  return (
    <div className="profile">

      {/* ── Hero banner ── */}
      <div className="profile__hero">
        <div className="profile__hero-bg" />
        <div className="profile__hero-content">

          {/* Avatar */}
          <div className="profile__avatar">
            {user?.username?.[0]?.toUpperCase() || 'U'}
            <div className="profile__avatar-dot" />
          </div>

          {/* Name + badges */}
          <div className="profile__hero-info">
            <div className="profile__name">{user?.username}</div>
            <div className="profile__email">{user?.email}</div>
            <div className="profile__badges">
              <span className="profile__badge">Active Account</span>
              {stats && <span className="profile__badge">{stats.effLabel} Energy User</span>}
              <span className="profile__badge">{isDark ? 'Dark Mode' : 'Light Mode'}</span>
            </div>
          </div>

          {/* Quick stats */}
          {stats && !loadingStats && (
            <div className="profile__quick-stats">
              {[
                { label: 'Bills',    value: stats.totalBills },
                { label: 'kWh Used', value: stats.totalUnits },
                { label: 'Score',    value: `${stats.efficiencyScore}/100` },
              ].map(({ label, value }) => (
                <div key={label} className="profile__quick-stat">
                  <div className="profile__quick-stat-value">{value}</div>
                  <div className="profile__quick-stat-label">{label}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tab bar */}
        <div className="profile__tabs">
          {TABS.map(tab => (
            <button
              key={tab.id}
              className={`profile__tab${activeTab === tab.id ? ' profile__tab--active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Overview tab ── */}
      {activeTab === 'overview' && (
        <div className="profile__tab-content">
          {loadingStats ? <Loader /> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

              {/* 6 stat cards */}
              <div className="profile__stats-grid">
                {[
                  { label: 'Total Bills Uploaded',  value: stats?.totalBills || 0,          sub: 'electricity bills',         icon: 'bills'     },
                  { label: 'Total Appliances',       value: stats?.totalAppliances || 0,     sub: 'tracked devices',           icon: 'appliance' },
                  { label: 'Efficiency Score',       value: `${stats?.efficiencyScore}/100`, sub: stats?.effLabel,             icon: 'star'      },
                  { label: 'Total Units Consumed',   value: `${stats?.totalUnits}`,          sub: 'kWh across all bills',      icon: 'bolt'      },
                  { label: 'Total Amount Spent',     value: `₹${stats?.totalSpend}`,         sub: 'lifetime electricity cost', icon: 'trend'     },
                  { label: 'Average Monthly Bill',   value: `₹${stats?.avgBill}`,            sub: 'per billing cycle',         icon: 'calendar'  },
                ].map(({ label, value, sub, icon }) => (
                  <div key={label} className="profile__stat-card">
                    <div className="profile__stat-icon">
                      <Icon name={icon} size={18} color="var(--text3)" />
                    </div>
                    <div>
                      <div className="profile__stat-label">{label}</div>
                      <div className="profile__stat-value">{value}</div>
                      <div className="profile__stat-sub">{sub}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Best / Worst / Top consumer */}
              <div className="profile__highlights">
                {[
                  {
                    badge: 'Best Month', dot: 'var(--text3)',
                    main:  stats?.bestMonth?.month,
                    value: stats?.bestMonth ? `${stats.bestMonth.totalUnits} kWh · ₹${stats.bestMonth.totalAmount}` : null,
                    note:  'Your lowest energy consumption month',
                    empty: 'Add bills to see',
                  },
                  {
                    badge: 'Highest Month', dot: 'var(--danger)',
                    main:  stats?.worstMonth?.month,
                    value: stats?.worstMonth ? `${stats.worstMonth.totalUnits} kWh · ₹${stats.worstMonth.totalAmount}` : null,
                    note:  'Your highest energy consumption month',
                    empty: 'Add bills to see',
                  },
                  {
                    badge: 'Top Consumer', dot: 'var(--text3)',
                    main:  stats?.highestApp?.name,
                    value: stats?.highestApp ? `${(stats.highestApp.unitsConsumed || 0).toFixed(1)} kWh consumed` : null,
                    note:  stats?.highestApp ? `${stats.highestApp.voltage}W · ${stats.highestApp.hoursPerDay}h/day` : '',
                    empty: 'Add appliances to see',
                  },
                ].map(({ badge, dot, main, value, note, empty }) => (
                  <div key={badge} className="profile__highlight-card">
                    <div className="profile__highlight-header">
                      <div className="profile__highlight-dot" style={{ background: dot }} />
                      <span className="profile__highlight-badge">{badge}</span>
                    </div>
                    {main ? (
                      <>
                        <div className="profile__highlight-main">{main}</div>
                        <div className="profile__highlight-value">{value}</div>
                        <div className="profile__highlight-note">{note}</div>
                      </>
                    ) : (
                      <div className="profile__highlight-empty">{empty}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Edit Profile tab ── */}
      {activeTab === 'edit' && (
        <div className="profile__tab-content profile__panel">
          <div className="profile__form-card">
            <div className="profile__form-card-header">
              <div className="profile__form-card-title">Edit Profile Details</div>
              <div className="profile__form-card-sub">Update your username and email address</div>
            </div>
            <div className="profile__form-card-body">
              {/* Avatar preview */}
              <div className="profile__avatar-preview">
                <div className="profile__preview-avatar">
                  {(profile.username?.[0] || user?.username?.[0] || 'U').toUpperCase()}
                </div>
                <div>
                  <div className="profile__preview-name">{profile.username || user?.username}</div>
                  <div className="profile__preview-email">{profile.email || user?.email}</div>
                </div>
              </div>
              <F label="Username"><input placeholder="e.g. vijay" value={profile.username} onChange={e => setP('username', e.target.value)} /></F>
              <F label="Email Address"><input type="email" placeholder="e.g. vijay@gmail.com" value={profile.email} onChange={e => setP('email', e.target.value)} /></F>
              <div style={{ display: 'flex', gap: 10 }}>
                <Btn variant="ghost" onClick={() => { setProfile({ username: user?.username || '', email: user?.email || '' }); setActiveTab('overview') }} style={{ flex: 1, justifyContent: 'center' }}>Cancel</Btn>
                <Btn onClick={saveProfile} loading={savingProfile} style={{ flex: 1, justifyContent: 'center' }}>Save Changes</Btn>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Security tab ── */}
      {activeTab === 'security' && (
        <div className="profile__tab-content profile__panel">
          <div className="profile__form-card">
            <div className="profile__form-card-header">
              <div className="profile__form-card-title">Change Password</div>
              <div className="profile__form-card-sub">Keep your account secure with a strong password</div>
            </div>
            <div className="profile__form-card-body">
              <F label="Current Password">
                <input type="password" placeholder="Enter your current password" value={pass.currentPassword} onChange={e => setP2('currentPassword', e.target.value)} />
              </F>
              <div className="profile__divider" />
              <F label="New Password">
                <input type="password" placeholder="At least 6 characters" value={pass.newPassword} onChange={e => setP2('newPassword', e.target.value)} />
              </F>
              <F label="Confirm New Password">
                <input type="password" placeholder="Repeat new password" value={pass.confirmPassword} onChange={e => setP2('confirmPassword', e.target.value)} />
              </F>

              {/* Strength bar */}
              {pass.newPassword && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div className="profile__strength-bars">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className="profile__strength-bar" style={{
                        background: pass.newPassword.length >= i * 3
                          ? (i <= 1 ? 'var(--danger)' : i <= 2 ? 'var(--text3)' : i <= 3 ? 'var(--text2)' : 'var(--text)')
                          : 'var(--bg4)',
                      }} />
                    ))}
                  </div>
                  <div className="profile__strength-text">
                    {pass.newPassword.length < 6 ? 'Too short — min 6 characters' : pass.newPassword.length < 9 ? 'Could be stronger' : 'Strong password'}
                  </div>
                </div>
              )}

              {/* Match indicator */}
              {pass.newPassword && pass.confirmPassword && (
                <div className="profile__match-row" style={{ color: pass.newPassword === pass.confirmPassword ? 'var(--text2)' : 'var(--danger)' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    {pass.newPassword === pass.confirmPassword
                      ? <path d="M20 6L9 17l-5-5"/>
                      : <><path d="M18 6L6 18"/><path d="M6 6l12 12"/></>}
                  </svg>
                  {pass.newPassword === pass.confirmPassword ? 'Passwords match' : 'Passwords do not match'}
                </div>
              )}

              <Btn onClick={savePassword} loading={savingPass} variant="ghost" style={{ justifyContent: 'center', color: 'var(--danger)', borderColor: 'rgba(200,0,0,0.3)' }}>
                Update Password
              </Btn>
            </div>
          </div>

          {/* Sign out card */}
          <div className="profile__form-card" style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: '18px 24px', display: 'flex' }}>
            <div>
              <div className="profile__form-card-title">Sign out</div>
              <div className="profile__form-card-sub">Sign out of your WattTrack account</div>
            </div>
            <Btn variant="danger" onClick={logout}>
                    <Icon name="logout" size={14} /> Sign Out
            </Btn>
          </div>
        </div>
      )}

      {/* ── Settings tab ── */}
      {activeTab === 'settings' && (
        <div className="profile__tab-content profile__panel">
          <div className="profile__form-card">
            <div className="profile__form-card-header">
              <div className="profile__form-card-title">Preferences</div>
              <div className="profile__form-card-sub">Manage your app settings</div>
            </div>
            <div className="profile__form-card-body">

              {/* Theme toggle row */}
              <div className="profile__settings-row">
                <div className="profile__settings-row-left">
                  <div className="profile__settings-icon">
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="var(--text2)" strokeWidth="2" strokeLinecap="round">
                      {isDark
                        ? <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
                        : <><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></>}
                    </svg>
                  </div>
                  <div>
                    <div className="profile__settings-label">App Theme</div>
                    <div className="profile__settings-sub">{isDark ? 'Currently using dark mode' : 'Currently using light mode'}</div>
                  </div>
                </div>
                <button className="profile__theme-toggle-btn" onClick={toggleTheme}>
                  {isDark ? 'Switch to Light' : 'Switch to Dark'}
                </button>
              </div>

              {/* Account info rows */}
              {[
                { label: 'Username',       value: user?.username },
                { label: 'Email',          value: user?.email    },
                { label: 'Account Status', value: 'Active'       },
              ].map(({ label, value }, i, arr) => (
                <div key={label} className="profile__info-row" style={{ borderBottom: i < arr.length - 1 ? '1px solid var(--border)' : 'none' }}>
                  <span className="profile__info-label">{label}</span>
                  <span className="profile__info-value">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProfilePage
