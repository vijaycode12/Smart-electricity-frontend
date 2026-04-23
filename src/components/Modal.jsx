import '../styles/components/Modal.css'
import Icon from './Icon'

// ── Modal ────────────────────────────────────────────────────────
// Centered popup overlay. Click backdrop or X to close.
const Modal = ({ title, onClose, children, maxWidth = 480 }) => (
  <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
    <div className="modal-card" style={{ maxWidth }}>
      <div className="modal-header">
        <h3 className="modal-title">{title}</h3>
        <button className="modal-close" onClick={onClose}>
          <Icon name="close" size={14} />
        </button>
      </div>
      {children}
    </div>
  </div>
)

export default Modal
