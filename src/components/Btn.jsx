import '../styles/components/Btn.css'

// ── Btn ──────────────────────────────────────────────────────────
// Reusable button. Props: variant, size, loading, disabled, onClick
const Btn = ({ children, onClick, variant = 'primary', loading = false, disabled = false, style: s = {}, type = 'button', size = 'md' }) => (
  <button
    type={type}
    onClick={onClick}
    disabled={loading || disabled}
    className={`btn btn--${variant}${size === 'sm' ? ' btn--sm' : ''}`}
    style={s}
  >
    {loading ? <span className="btn__spinner" /> : children}
  </button>
)

export default Btn
