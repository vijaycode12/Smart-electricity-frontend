import '../styles/components/Sidebar.css'
import Icon from './Icon'
import { useAuth }  from '../context/AuthContext'

const NAV_ITEMS = [
  { id: 'dashboard',  icon: 'dashboard', label: 'Dashboard'  },
  { id: 'bills',      icon: 'bills',     label: 'Bills'      },
  { id: 'appliances', icon: 'appliance', label: 'Appliances' },
  { id: 'analytics',  icon: 'analytics', label: 'Analytics'  },
  { id: 'profile',    icon: 'edit',      label: 'Profile'    },
]

// ── Sidebar ───────────────────────────────────────────────────────
// Left navigation panel with nav links, user info, logout.
const Sidebar = ({ active, setActive }) => {
  const { user, logout } = useAuth()

  return (
    <aside className="sidebar">

      {/* Brand */}
      <div className="sidebar__brand">
        <div className="sidebar__brand-name">WattTrack</div>
        <div className="sidebar__brand-sub">Energy Monitor</div>
      </div>

      {/* Nav links */}
      <nav className="sidebar__nav">
        {NAV_ITEMS.map(item => (
          <button
            key={item.id}
            onClick={() => setActive(item.id)}
            className={`sidebar__nav-btn${active === item.id ? ' sidebar__nav-btn--active' : ''}`}
          >
            <Icon name={item.icon} size={15} color={active === item.id ? 'var(--text)' : 'var(--text3)'} />
            {item.label}
          </button>
        ))}
      </nav>

      {/* Bottom: theme toggle, user, logout */}
      <div className="sidebar__bottom">

        {/* User info — click to go to profile */}
        <div className="sidebar__user" onClick={() => setActive('profile')}>
          <div className="sidebar__avatar">
            {user?.username?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="sidebar__user-info">
            <div className="sidebar__username">{user?.username}</div>
            <div className="sidebar__email">{user?.email}</div>
          </div>
        </div>

        {/* Sign out */}
        <button className="sidebar__logout" onClick={logout}>
          <Icon name="logout" size={14} />
          Sign Out
        </button>
      </div>
    </aside>
  )
}

export default Sidebar
