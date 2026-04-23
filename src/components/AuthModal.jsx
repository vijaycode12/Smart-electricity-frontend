import '../styles/components/AuthModal.css'
import { useState }  from 'react'
import { api }       from '../api'
import { useAuth }   from '../context/AuthContext'
import { useToast }  from '../context/ToastContext'
import Icon          from './Icon'

// ── AuthModal ─────────────────────────────────────────────────────
// Login/signup popup shown over the homepage.
// Props: mode ('login'|'signup'), onModeChange, onClose
const AuthModal = ({ mode, onModeChange, onClose }) => {
  const { login } = useAuth()
  const toast     = useToast()

  const [loading, setLoading]   = useState(false)
  const [showPass, setShowPass] = useState(false)
  const [form, setForm]         = useState({ username: '', email: '', password: '' })

  const setField = (key, val) => setForm(prev => ({ ...prev, [key]: val }))

  const handleSubmit = async () => {
    if (!form.email || !form.password) return toast('Email and password are required', 'error')
    if (mode === 'signup' && !form.username) return toast('Username is required', 'error')
    setLoading(true)
    try {
      const res = mode === 'login'
        ? await api.post('api/v1/auth/log-in',  { email: form.email, password: form.password })
        : await api.post('api/v1/auth/sign-up', form)
      if (res.success) {
        login(res.data.user, res.data.token)
        toast(mode === 'login' ? 'Welcome back!' : 'Account created!')
      } else {
        toast(res.error || res.message || 'Something went wrong', 'error')
      }
    } catch {
      toast('Network error — is the backend running?', 'error')
    }
    setLoading(false)
  }

  return (
    <div className="auth-modal__backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="auth-modal__card">

        {/* Header */}
        <div className="auth-modal__header">
          <h2 className="auth-modal__title">
            {mode === 'login' ? 'Welcome back' : 'Create account'}
          </h2>
          <button className="auth-modal__close" onClick={onClose}>
            <Icon name="close" size={14} />
          </button>
        </div>

        {/* Form fields */}
        <div className="auth-modal__fields">

          {mode === 'signup' && (
            <div className="auth-modal__field">
              <label>Username</label>
              <input
                placeholder="johndoe"
                value={form.username}
                onChange={e => setField('username', e.target.value)}
              />
            </div>
          )}

          <div className="auth-modal__field">
            <label>Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={e => setField('email', e.target.value)}
            />
          </div>

          <div className="auth-modal__field">
            <label>Password</label>
            <div className="auth-modal__password-wrap">
              <input
                type={showPass ? 'text' : 'password'}
                placeholder="Enter your password"
                value={form.password}
                onChange={e => setField('password', e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                style={{ paddingRight: 44 }}
              />
              <button className="auth-modal__eye-btn" onClick={() => setShowPass(!showPass)}>
                <Icon name="eye" size={15} color="#999" />
              </button>
            </div>
          </div>

          <button className="auth-modal__submit" onClick={handleSubmit} disabled={loading}>
            {loading
              ? <span className="auth-modal__submit-spinner" />
              : mode === 'login' ? 'Log in' : 'Create account'}
          </button>
        </div>

        {/* Switch mode */}
        <p className="auth-modal__switch">
          {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <button
            className="auth-modal__switch-btn"
            onClick={() => onModeChange(mode === 'login' ? 'signup' : 'login')}
          >
            {mode === 'login' ? 'Sign up' : 'Log in'}
          </button>
        </p>
      </div>
    </div>
  )
}

export default AuthModal
