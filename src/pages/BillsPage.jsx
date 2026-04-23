import '../styles/pages/BillsPage.css'
import { useState, useEffect, useRef } from 'react'
import { api }      from '../api'
import { useToast } from '../context/ToastContext'
import Btn          from '../components/Btn'
import Modal        from '../components/Modal'
import Loader       from '../components/Loader'
import Icon         from '../components/Icon'

const EMPTY_FORM = { billStartDate: '', billEndDate: '', totalUnits: '', costPerUnit: '', totalAmount: '' }

// FormField must be outside BillsPage to avoid focus loss on re-render
const FormField = ({ label, children }) => (
  <div className="form-field">
    <label>{label}</label>
    {children}
  </div>
)

// ── BillsPage ─────────────────────────────────────────────────────
// View, add, upload and delete electricity bills.
const BillsPage = () => {
  const toast   = useToast()
  const fileRef = useRef()

  const [bills, setBills]             = useState([])
  const [loading, setLoading]         = useState(true)
  const [showAdd, setShowAdd]         = useState(false)
  const [showUpload, setShowUpload]   = useState(false)
  const [form, setForm]               = useState(EMPTY_FORM)
  const [saving, setSaving]           = useState(false)
  const [uploading, setUploading]     = useState(false)
  const [pickedFile, setPickedFile]   = useState('')

  const setField = (key, val) => setForm(prev => ({ ...prev, [key]: val }))

  const loadBills = async () => {
    setLoading(true)
    const res = await api.get('/bill/bills')
    if (res.success) setBills(res.data || [])
    setLoading(false)
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { loadBills() }, [])

  const handleAdd = async () => {
    if (!form.totalUnits) return toast('Total units is required', 'error')
    setSaving(true)
    const res = await api.post('/bill/bills', form)
    if (res.success) { toast('Bill added!'); setShowAdd(false); setForm(EMPTY_FORM); loadBills() }
    else toast(res.message || 'Failed to add bill', 'error')
    setSaving(false)
  }

  const handleUpload = async () => {
    const file = fileRef.current?.files?.[0]
    if (!file) return toast('Please select an image file', 'error')
    setUploading(true)
    const fd = new FormData()
    fd.append('bill', file)
    const res = await api.upload('/bill/upload', fd)
    if (res.success) { toast('Bill extracted and saved!'); setShowUpload(false); setPickedFile(''); loadBills() }
    else toast(res.message || 'Extraction failed — try a clearer image', 'error')
    setUploading(false)
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this bill?')) return
    const res = await api.delete(`/bill/bills/${id}`)
    if (res.message) { toast('Bill deleted'); loadBills() }
    else toast('Failed to delete', 'error')
  }

  return (
    <div className="bills">

      {/* Header */}
      <div className="bills__header">
        <div>
          <h2 className="bills__title">Bills</h2>
          <p className="bills__subtitle">{bills.length} bill{bills.length !== 1 ? 's' : ''} recorded</p>
        </div>
        <div className="bills__actions">
          <Btn variant="ghost" onClick={() => setShowUpload(true)}>
            <Icon name="upload" size={15} /> Upload Bill
          </Btn>
          <Btn onClick={() => setShowAdd(true)}>
            <Icon name="plus" size={15} /> Add Manually
          </Btn>
        </div>
      </div>

      {/* Bills list */}
      {loading ? <Loader /> : bills.length === 0 ? (
        <div className="bills__empty">
          <Icon name="file" size={40} color="var(--text3)" />
          <span className="bills__empty-text">No bills yet</span>
          <Btn onClick={() => setShowAdd(true)} style={{ marginTop: 6 }}>
            <Icon name="plus" size={15} /> Add First Bill
          </Btn>
        </div>
      ) : (
        <div className="bills__grid">
          {bills.map((b, i) => (
            <div key={b._id} className="bill-card" style={{ animationDelay: `${i * 0.04}s` }}>

              <div className="bill-card__header">
                <span className="bill-card__date-badge">
                  {b.billEndDate
                    ? new Date(b.billEndDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })
                    : 'No date'}
                </span>
                <button className="bill-card__delete" onClick={() => handleDelete(b._id)}>
                  <Icon name="trash" size={14} />
                </button>
              </div>

              <div className="bill-card__stats">
                {[
                  { label: 'Units',  value: `${b.totalUnits} kWh` },
                  { label: 'Amount', value: b.totalAmount ? `₹${b.totalAmount}` : '—' },
                  { label: 'Rate',   value: b.costPerUnit ? `₹${b.costPerUnit}/u` : '—' },
                  { label: 'Days',   value: b.totalDays || '—' },
                ].map(({ label, value }) => (
                  <div key={label} className="bill-card__stat">
                    <div className="bill-card__stat-label">{label}</div>
                    <div className="bill-card__stat-value">{value}</div>
                  </div>
                ))}
              </div>

              {b.billStartDate && b.billEndDate && (
                <div className="bill-card__dates">
                  <Icon name="calendar" size={11} color="var(--text3)" />
                  {new Date(b.billStartDate).toLocaleDateString('en-IN')}
                  {' — '}
                  {new Date(b.billEndDate).toLocaleDateString('en-IN')}
                </div>
              )}

              {b.billFile && (
                <div className="bill-card__file-note">
                  <Icon name="file" size={11} /> Scanned bill attached
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add Bill modal */}
      {showAdd && (
        <Modal title="Add Bill Manually" onClose={() => { setShowAdd(false); setForm(EMPTY_FORM) }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <FormField label="Bill Start Date">
                <input type="date" value={form.billStartDate} onChange={e => setField('billStartDate', e.target.value)} />
              </FormField>
              <FormField label="Bill End Date">
                <input type="date" value={form.billEndDate} onChange={e => setField('billEndDate', e.target.value)} />
              </FormField>
            </div>
            <FormField label="Total Units used (kWh) *">
              <input type="number" placeholder="e.g. 320" value={form.totalUnits} onChange={e => setField('totalUnits', e.target.value)} />
            </FormField>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <FormField label="Cost Per Unit (₹)">
                <input type="number" placeholder="e.g. 6.5" value={form.costPerUnit} onChange={e => setField('costPerUnit', e.target.value)} />
              </FormField>
              <FormField label="Total Amount (₹)">
                <input type="number" placeholder="e.g. 2080" value={form.totalAmount} onChange={e => setField('totalAmount', e.target.value)} />
              </FormField>
            </div>
            <div className="bills__hint">
              Tip: provide either Cost/Unit or Total Amount — the other gets auto-calculated.
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <Btn variant="ghost" onClick={() => { setShowAdd(false); setForm(EMPTY_FORM) }} style={{ flex: 1, justifyContent: 'center' }}>Cancel</Btn>
              <Btn onClick={handleAdd} loading={saving} style={{ flex: 1, justifyContent: 'center' }}>Add Bill</Btn>
            </div>
          </div>
        </Modal>
      )}

      {/* Upload Bill modal */}
      {showUpload && (
        <Modal title="Upload Bill — Auto Extract" onClose={() => { setShowUpload(false); setPickedFile('') }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="bills__dropzone" onClick={() => fileRef.current?.click()}>
              <Icon name="upload" size={28} color="var(--text3)" />
              <span className="bills__dropzone-text">{pickedFile || 'Click to select bill image'}</span>
              <span className="bills__dropzone-sub">JPG or PNG supported</span>
              <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }}
                onChange={e => setPickedFile(e.target.files?.[0]?.name || '')} />
            </div>
            <div className="bills__hint">
              OCR will automatically read units, amount and dates from your bill photo.
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <Btn variant="ghost" onClick={() => { setShowUpload(false); setPickedFile('') }} style={{ flex: 1, justifyContent: 'center' }}>Cancel</Btn>
              <Btn onClick={handleUpload} loading={uploading} style={{ flex: 1, justifyContent: 'center' }}>Extract and Save</Btn>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}

export default BillsPage
