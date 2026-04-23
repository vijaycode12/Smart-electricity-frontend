import '../styles/components/StatCard.css'
import Icon from './Icon'

// ── StatCard ─────────────────────────────────────────────────────
// Shows a single stat with icon, label, value, optional sub-text and trend badge.
const StatCard = ({ icon, label, value, sub, color = 'var(--accent)', trend, delay = 0 }) => (
  <div className="stat-card" style={{ animationDelay: `${delay}s` }}>
    {/* Decorative circle in top-right */}
    <div className="stat-card__decoration" style={{ background: color }} />

    <div className="stat-card__top">
      <div className="stat-card__icon-box">
        <Icon name={icon} size={17} color="var(--text2)" />
      </div>
      {trend !== undefined && (
        <span className={`stat-card__trend ${trend >= 0 ? 'stat-card__trend--up' : 'stat-card__trend--down'}`}>
          {trend >= 0 ? '+' : ''}{trend}%
        </span>
      )}
    </div>

    <div>
      <div className="stat-card__label">{label}</div>
      <div className="stat-card__value">{value}</div>
      {sub && <div className="stat-card__sub">{sub}</div>}
    </div>
  </div>
)

export default StatCard
