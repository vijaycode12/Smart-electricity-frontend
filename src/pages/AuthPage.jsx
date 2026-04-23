import { useState } from 'react'
import { api } from '../api'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import Btn from '../components/Btn'
import Icon from '../components/Icon'

const AuthPage = () => {
  const { login } = useAuth()
  const toast = useToast()
  const [mode, setMode]         = useState('login')
  const [loading, setLoading]   = useState(false)
  const [showPass, setShowPass] = useState(false)
  const [form, setForm]         = useState({ username: '', email: '', password: '' })

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const submit = async () => {
    if (!form.email || !form.password) return toast('Email and password required', 'error')
    if (mode === 'signup' && !form.username) return toast('Username required', 'error')
    setLoading(true)
    try {
      const res = mode === 'login'
        ? await api.post('api/v1/auth/log-in', { email: form.email, password: form.password })
        : await api.post('api/v1/auth/sign-up', form)
      if (res.success) {
        login(res.data.user, res.data.token)
        toast(`Welcome${mode === 'login' ? ' back' : ''}!`)
      } else {
        toast(res.error || res.message || 'Something went wrong', 'error')
      }
    } catch {
      toast('Network error — is the backend running?', 'error')
    }
    setLoading(false)
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg)', position: 'relative', overflow: 'hidden',
    }}>

      {/* Background blobs */}
      <div style={{
        position: 'absolute', top: '10%', left: '5%',
        width: 500, height: 500, borderRadius: '50%',
        background: 'var(--accent)', opacity: 0.03,
        filter: 'blur(100px)', pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: '10%', right: '5%',
        width: 400, height: 400, borderRadius: '50%',
        background: 'var(--accent3)', opacity: 0.04,
        filter: 'blur(80px)', pointerEvents: 'none',
      }} />

      <div className="fade-up" style={{ width: '100%', maxWidth: 420, padding: '0 20px' }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 64, height: 64,
            background: 'linear-gradient(135deg, #38bdf8 0%, #a78bfa 100%)',
            borderRadius: 20, marginBottom: 18,
            boxShadow: '0 0 40px rgba(56,189,248,0.2)',
          }}>
            <Icon name="bolt" size={32} color="#fff" />
          </div>
          <h1 style={{
            fontFamily: 'Georgia, serif', fontSize: 32,
            fontWeight: 800, letterSpacing: '-0.8px',
          }}>
            Watt<span style={{ color: 'var(--accent)' }}>Track</span>
          </h1>
          <p style={{ color: 'var(--text2)', fontSize: 14, marginTop: 6 }}>
            Smart electricity monitoring
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: 'var(--bg2)',
          border: '1px solid var(--border2)',
          borderRadius: 20, padding: 32,
          boxShadow: '0 24px 48px rgba(0,0,0,0.3)',
        }}>

          {/* Tabs */}
          <div style={{
            display: 'flex', background: 'var(--bg3)',
            borderRadius: 10, padding: 4, marginBottom: 26,
          }}>
            {['login', 'signup'].map(m => (
              <button
                key={m}
                onClick={() => setMode(m)}
                style={{
                  flex: 1, padding: '9px 0', borderRadius: 8,
                  fontSize: 14, fontWeight: 500,
                  background: mode === m ? 'var(--accent)' : 'transparent',
                  color: mode === m ? '#080c10' : 'var(--text2)',
                  border: 'none', transition: 'all 0.2s',
                }}
              >
                {m === 'login' ? 'Log In' : 'Sign Up'}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {mode === 'signup' && (
              <div>
                <label style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 6, display: 'block' }}>
                  Username
                </label>
                <input
                  placeholder="johndoe"
                  value={form.username}
                  onChange={e => set('username', e.target.value)}
                />
              </div>
            )}

            <div>
              <label style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 6, display: 'block' }}>
                Email
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={e => set('email', e.target.value)}
              />
            </div>

            <div>
              <label style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 6, display: 'block' }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPass ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => set('password', e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && submit()}
                  style={{ paddingRight: 44 }}
                />
                <button
                  onClick={() => setShowPass(!showPass)}
                  style={{
                    position: 'absolute', right: 12, top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none', color: 'var(--text3)',
                    display: 'flex', alignItems: 'center',
                  }}
                >
                  <Icon name="eye" size={15} />
                </button>
              </div>
            </div>

            <Btn
              onClick={submit}
              loading={loading}
              style={{ width: '100%', justifyContent: 'center', marginTop: 4 }}
            >
              {mode === 'login' ? 'Log In' : 'Create Account'}
            </Btn>

          </div>
        </div>

        <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text3)', marginTop: 20 }}>
          Track your electricity. Save money. Go green.
        </p>
      </div>
    </div>
  )
}

export default AuthPage