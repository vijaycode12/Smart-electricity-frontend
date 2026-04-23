import { createContext, useContext, useState, useCallback } from 'react'

// ── ToastContext ─────────────────────────────────────────────────
// Shows small popup notification messages at the bottom-right.
// Any component can call useToast() to get the toast() function:
//
//   const toast = useToast()
//   toast('Saved successfully!')           // green success toast
//   toast('Something went wrong', 'error') // red error toast

// eslint-disable-next-line react-refresh/only-export-components
export const ToastContext = createContext(null)

export const ToastProvider = ({ children }) => {
  // List of active toasts currently being shown
  const [toasts, setToasts] = useState([])

  // Add a new toast message, then auto-remove it after 3.5 seconds
  const toast = useCallback((msg, type = 'success') => {
    const id = Date.now() // unique ID based on timestamp
    setToasts(prev => [...prev, { id, msg, type }])
    setTimeout(() => removeToast(id), 3500)
  }, [])

  // Remove a specific toast by its ID
  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }

  return (
    <ToastContext.Provider value={toast}>
      {children}

      {/* Toast container — fixed to bottom-right of screen */}
      <div style={{
        position: 'fixed', bottom: 24, right: 24,
        zIndex: 9999,
        display: 'flex', flexDirection: 'column', gap: 8,
      }}>
        {toasts.map(t => (
          <div
            key={t.id}
            className="fade-up"
            style={{
              background: t.type === 'error' ? '#1a0000' : '#0a0a0a',
              border: `1px solid ${t.type === 'error' ? 'var(--danger)' : 'var(--border3)'}`,
              color: t.type === 'error' ? 'var(--danger)' : 'var(--text)',
              borderRadius: 8,
              padding: '10px 16px',
              fontSize: 13,
              display: 'flex', alignItems: 'center', gap: 10,
              minWidth: 260,
            }}
          >
            {/* Small indicator dot */}
            <span style={{
              width: 6, height: 6, borderRadius: '50%', flexShrink: 0,
              background: t.type === 'error' ? 'var(--danger)' : '#aaa',
            }} />

            <span style={{ flex: 1 }}>{t.msg}</span>

            {/* Close button */}
            <button
              onClick={() => removeToast(t.id)}
              style={{ background: 'none', color: 'inherit', fontSize: 16, lineHeight: 1 }}
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useToast = () => useContext(ToastContext)
