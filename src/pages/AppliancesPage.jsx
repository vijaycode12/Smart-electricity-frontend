import '../styles/pages/AppliancesPage.css'
import { useState, useEffect } from 'react'
import { api }      from '../api'
import { useToast } from '../context/ToastContext'
import Btn          from '../components/Btn'
import Modal        from '../components/Modal'
import Loader       from '../components/Loader'
import Icon         from '../components/Icon'

const EMPTY = { voltage: '', hoursPerDay: '', days: '' }

const POWER_REF = [
  { appliance: 'Ceiling Fan',           power: '50 – 80 W'     },
  { appliance: 'LED Bulb',              power: '7 – 15 W'      },
  { appliance: 'Tube Light (CFL)',       power: '20 – 40 W'     },
  { appliance: 'Refrigerator',          power: '100 – 200 W'   },
  { appliance: 'AC (1 Ton)',            power: '900 – 1100 W'  },
  { appliance: 'AC (1.5 Ton)',          power: '1200 – 1600 W' },
  { appliance: 'AC (2 Ton)',            power: '1800 – 2200 W' },
  { appliance: 'Water Heater (Geyser)', power: '1500 – 3000 W' },
  { appliance: 'Washing Machine',       power: '500 – 800 W'   },
  { appliance: 'Television (LED)',      power: '50 – 150 W'    },
  { appliance: 'Laptop',                power: '40 – 70 W'     },
  { appliance: 'Desktop Computer',      power: '150 – 300 W'   },
  { appliance: 'Microwave Oven',        power: '800 – 1200 W'  },
  { appliance: 'Electric Iron',         power: '1000 – 2000 W' },
  { appliance: 'Mixer / Grinder',       power: '400 – 750 W'   },
  { appliance: 'Induction Cooktop',     power: '1000 – 2000 W' },
  { appliance: 'Water Pump (0.5 HP)',   power: '370 W'         },
  { appliance: 'Water Pump (1 HP)',     power: '750 W'         },
  { appliance: 'Mobile Charger',        power: '5 – 25 W'      },
  { appliance: 'WiFi Router',           power: '5 – 20 W'      },
]

// ── PowerRefPopup ─────────────────────────────────────────────────
const PowerRefPopup = ({ onClose }) => (
  <div className="power-ref-popup" onClick={e => e.target === e.currentTarget && onClose()}>
    <div className="power-ref-card">
      <div className="power-ref-card__header">
        <div>
          <div className="power-ref-card__title">Appliance Power Reference</div>
          <div className="power-ref-card__sub">Typical wattage of common household appliances</div>
        </div>
        <button className="modal-close" onClick={onClose}><Icon name="close" size={14} /></button>
      </div>
      <div className="power-ref-card__cols">
        <span className="power-ref-card__col-head">Appliance</span>
        <span className="power-ref-card__col-head">Power Consumption</span>
      </div>
      <div className="power-ref-card__rows">
        {POWER_REF.map((item, i) => (
          <div key={i} className="power-ref-card__row">
            <span className="power-ref-card__appliance">{item.appliance}</span>
            <span className="power-ref-card__power">{item.power}</span>
          </div>
        ))}
      </div>
      <div className="power-ref-card__footer">
        Values are approximate. Check the label on your device for exact wattage.
      </div>
    </div>
  </div>
)

// ── FormField — must be outside component to avoid focus loss ─────
const F = ({ label, children }) => (
  <div className="form-field">
    <label>{label}</label>
    {children}
  </div>
)

// ── DaysWarning ───────────────────────────────────────────────────
const DaysWarning = () => (
  <div className="bills__hint" style={{ marginTop: 6 }}>
    Days is required — enter it manually, or upload a bill first so days can be auto-filled.
  </div>
)

// ── SubForm (used when quantity >= 2) ─────────────────────────────
const SubForm = ({ index, name, data, onChange }) => {
  const preview = () => {
    const w = parseFloat(data.voltage), h = parseFloat(data.hoursPerDay), d = parseFloat(data.days)
    return (w && h && d) ? ((w * h * d) / 1000).toFixed(2) : null
  }
  return (
    <div className="sub-form">
      <div className="sub-form__heading">
        <span className="sub-form__num">{index + 1}</span>
        {name ? `${name} ${index + 1}` : `Appliance ${index + 1}`}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <F label="Power (Watts) *">
          <input type="number" placeholder="e.g. 75" value={data.voltage} onChange={e => onChange(index, 'voltage', e.target.value)} />
        </F>
        <F label="Hours Per Day *">
          <input type="number" placeholder="e.g. 8" value={data.hoursPerDay} onChange={e => onChange(index, 'hoursPerDay', e.target.value)} />
        </F>
      </div>
      <F label="Days (optional — auto from latest bill)">
        <input type="number" placeholder="e.g. 31" value={data.days} onChange={e => onChange(index, 'days', e.target.value)} />
      </F>
      {!data.days && <DaysWarning />}
      {preview() && (
        <div className="sub-form__preview">
          <span style={{ color: 'var(--text3)' }}>Estimated usage</span>
          <span style={{ fontWeight: 600 }}>~{preview()} kWh</span>
        </div>
      )}
    </div>
  )
}

// ── groupAppliances ───────────────────────────────────────────────
const groupAppliances = (appliances) => {
  const groups = {}
  appliances.forEach(a => {
    const match = a.name.match(/^(.+?)\s+(\d+)$/)
    const base  = match ? match[1].trim() : a.name.trim()
    if (!groups[base]) groups[base] = []
    groups[base].push(a)
  })
  return groups
}

// ── GroupCard ─────────────────────────────────────────────────────
const GroupCard = ({ baseName, items, totalAllUnits, onEdit, onDelete, deletingId }) => {
  const [expanded, setExpanded] = useState(false)
  const totalKwh = items.reduce((s, a) => s + (a.unitsConsumed || 0), 0)
  const count    = items.length
  const isGroup  = count > 1
  const pct      = totalAllUnits ? +((totalKwh / totalAllUnits) * 100).toFixed(1) : 0

  return (
    <div className="group-card">
      <div className="group-card__body" style={{ cursor: isGroup ? 'pointer' : 'default' }} onClick={() => isGroup && setExpanded(e => !e)}>

        <div className="group-card__header">
          <div className="group-card__name-row">
            <div className="group-card__icon"><Icon name="appliance" size={16} color="var(--text3)" /></div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className="group-card__name">{baseName}</span>
                {isGroup && <span className="group-card__count-badge">x{count}</span>}
              </div>
              <div className="group-card__sub">
                {isGroup ? `${count} units · ${totalKwh.toFixed(1)} kWh total` : `${items[0].voltage}W · ${items[0].hoursPerDay}h/day`}
              </div>
            </div>
          </div>
          <div className="group-card__actions">
            {!isGroup && (
              <>
                <button className="group-card__action-btn" onClick={e => { e.stopPropagation(); onEdit(items[0]) }} disabled={deletingId === items[0]._id}>
                  <Icon name="edit" size={13} />
                </button>
                <button className="group-card__action-btn group-card__action-btn--delete" onClick={e => { e.stopPropagation(); onDelete(items[0]._id) }} disabled={deletingId === items[0]._id}>
                  {deletingId === items[0]._id
                    ? <div className="btn__spinner" style={{ width: 13, height: 13 }} />
                    : <Icon name="trash" size={13} />}
                </button>
              </>
            )}
            {isGroup && (
              <div className="group-card__chevron" style={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </div>
            )}
          </div>
        </div>

        {/* Usage bar */}
        <div className="group-card__bar-label">
          <span>Share of total usage</span>
          <span className="group-card__bar-pct">{pct}%</span>
        </div>
        <div className="group-card__bar-track">
          <div className="group-card__bar-fill" style={{ width: `${pct}%` }} />
        </div>

        {/* Stats */}
        <div className="group-card__stats" style={{ gridTemplateColumns: isGroup ? 'repeat(3,1fr)' : '1fr 1fr' }}>
          {(isGroup
            ? [{ label: 'Total kWh', value: `${totalKwh.toFixed(1)} kWh` }, { label: 'Quantity', value: `x${count}` }, { label: 'Days', value: items[0].days || '—' }]
            : [{ label: 'Usage', value: `${(items[0].unitsConsumed || 0).toFixed(1)} kWh` }, { label: 'Days', value: items[0].days || '—' }]
          ).map(({ label, value }) => (
            <div key={label} className="group-card__stat">
              <div className="group-card__stat-label">{label}</div>
              <div className="group-card__stat-value">{value}</div>
            </div>
          ))}
        </div>

        {isGroup && !expanded && <div className="group-card__expand-hint">Click to see individual details</div>}
      </div>

      {/* Expanded rows */}
      {expanded && isGroup && (
        <div className="group-card__expanded">
          {items.map((a, i) => (
            <div key={a._id} className="group-card__item-row" style={{ opacity: deletingId === a._id ? 0.4 : 1 }}>
              <div className="group-card__item-num">{i + 1}</div>
              <div style={{ flex: 1 }}>
                <div className="group-card__item-name">{a.name}</div>
                <div className="group-card__item-sub">{a.voltage}W · {a.hoursPerDay}h/day · {a.days || '—'} days</div>
              </div>
              <div className="group-card__item-kwh">{(a.unitsConsumed || 0).toFixed(1)} kWh</div>
              <div style={{ display: 'flex', gap: 2 }}>
                <button className="group-card__action-btn" onClick={() => onEdit(a)} disabled={deletingId === a._id}><Icon name="edit" size={13} /></button>
                <button className="group-card__action-btn group-card__action-btn--delete" onClick={() => onDelete(a._id)} disabled={deletingId === a._id}>
                  {deletingId === a._id ? <div className="btn__spinner" style={{ width: 13, height: 13 }} /> : <Icon name="trash" size={13} />}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── AppliancesPage ────────────────────────────────────────────────
const AppliancesPage = () => {
  const toast = useToast()
  const [appliances, setAppliances] = useState([])
  const [loading, setLoading]       = useState(true)
  const [showModal, setShowModal]   = useState(false)
  const [showPowerRef, setShowPowerRef] = useState(false)
  const [editItem, setEditItem]     = useState(null)
  const [saving, setSaving]         = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const [name, setName]             = useState('')
  const [quantity, setQuantity]     = useState(1)
  const [single, setSingle]         = useState({ ...EMPTY })
  const [subForms, setSubForms]     = useState([])
  const [editForm, setEditForm]     = useState({ name: '', voltage: '', hoursPerDay: '', days: '' })

  const load = async () => {
    setLoading(true)
    try {
      const res = await api.get('/appliance/appliances')
      setAppliances(res.success ? (res.data || []) : [])
    } catch { toast('Failed to load appliances', 'error'); setAppliances([]) }
    setLoading(false)
  }

  useEffect(() => { load() }, []) // eslint-disable-line

  const changeQty = (delta) => {
    const newQty = Math.max(1, Math.min(10, quantity + delta))
    setQuantity(newQty)
    if (newQty >= 2) {
      setSubForms(prev => {
        const updated = [...prev]
        while (updated.length < newQty) updated.push({ voltage: updated[0]?.voltage || single.voltage || '', hoursPerDay: updated[0]?.hoursPerDay || single.hoursPerDay || '', days: updated[0]?.days || single.days || '' })
        return updated.slice(0, newQty)
      })
    }
  }

  const updateSubForm = (index, key, val) => setSubForms(prev => prev.map((f, i) => i === index ? { ...f, [key]: val } : f))

  const openAdd = () => { setName(''); setQuantity(1); setSingle({ ...EMPTY }); setSubForms([]); setEditItem(null); setShowModal(true) }
  const openEdit = (a) => { setEditForm({ name: a.name, voltage: a.voltage, hoursPerDay: a.hoursPerDay, days: a.days || '' }); setEditItem(a); setShowModal(true) }
  const closeModal = () => { setShowModal(false); setEditItem(null); setName(''); setQuantity(1); setSingle({ ...EMPTY }); setSubForms([]); setEditForm({ name: '', voltage: '', hoursPerDay: '', days: '' }) }

  const showError = (res) => {
    toast(res.message || 'Failed', 'error')
    if (res.cause)  setTimeout(() => toast(res.cause, 'error'), 600)
    if (res.action) setTimeout(() => toast(res.action, 'error'), 1200)
  }

  const save = async () => {
    if (editItem) {
      if (!editForm.name || !editForm.voltage || !editForm.hoursPerDay) return toast('Name, power and hours are required', 'error')
      setSaving(true)
      try {
        const res = await api.put(`/appliance/appliances/${editItem._id}`, editForm)
        if (res.success) { toast('Appliance updated!'); closeModal(); await load() } else showError(res)
      } catch { toast('Network error', 'error') }
      setSaving(false); return
    }
    if (quantity === 1) {
      if (!name || !single.voltage || !single.hoursPerDay) return toast('Name, power and hours are required', 'error')
      setSaving(true)
      try {
        const res = await api.post('/appliance/appliances', { name, voltage: single.voltage, hoursPerDay: single.hoursPerDay, days: single.days || undefined })
        if (res.success) { toast(res.daysSource === 'bill' ? 'Added! Days auto-filled from latest bill.' : 'Appliance added!'); closeModal(); await load() } else showError(res)
      } catch { toast('Network error', 'error') }
      setSaving(false); return
    }
    for (let i = 0; i < subForms.length; i++) if (!subForms[i].voltage || !subForms[i].hoursPerDay) return toast(`${name || 'Appliance'} ${i + 1}: power and hours are required`, 'error')
    setSaving(true)
    try {
      const results = await Promise.all(subForms.map((f, i) => api.post('/appliance/appliances', { name: `${name || 'Appliance'} ${i + 1}`, voltage: f.voltage, hoursPerDay: f.hoursPerDay, days: f.days || undefined })))
      const failed = results.filter(r => !r.success), success = results.filter(r => r.success)
      if (failed.length === 0) { toast(`${quantity} appliances added!`); closeModal(); await load() }
      else if (success.length === 0) showError(failed[0])
      else { toast(`${success.length} saved, ${failed.length} failed`, 'error'); if (failed[0].cause) setTimeout(() => toast(failed[0].cause, 'error'), 600); closeModal(); await load() }
    } catch { toast('Network error', 'error') }
    setSaving(false)
  }

  const remove = async (id) => {
    if (!confirm('Delete this appliance?')) return
    setDeletingId(id)
    try {
      const res = await api.delete(`/appliance/appliances/${id}`)
      if (res.success || res.message) { setAppliances(prev => prev.filter(a => a._id !== id)); toast('Appliance deleted!') }
      else toast(res.message || 'Failed to delete', 'error')
    } catch (err) { toast('Network error: ' + err.message, 'error') }
    setDeletingId(null)
  }

  const totalUnits = appliances.reduce((s, a) => s + (a.unitsConsumed || 0), 0)
  const grouped    = groupAppliances(appliances)
  const groupKeys  = Object.keys(grouped)

  const singlePreview = () => { const w = parseFloat(single.voltage), h = parseFloat(single.hoursPerDay), d = parseFloat(single.days); return (w && h && d) ? ((w * h * d) / 1000).toFixed(2) : null }
  const editPreview   = () => { const w = parseFloat(editForm.voltage), h = parseFloat(editForm.hoursPerDay), d = parseFloat(editForm.days); return (w && h && d) ? ((w * h * d) / 1000).toFixed(2) : null }

  return (
    <div className="appliances">

      <div className="appliances__header">
        <div>
          <h2 className="appliances__title">Appliances</h2>
          <p className="appliances__subtitle">{totalUnits.toFixed(1)} kWh total · {appliances.length} appliance{appliances.length !== 1 ? 's' : ''} · {groupKeys.length} group{groupKeys.length !== 1 ? 's' : ''}</p>
        </div>
        <Btn onClick={openAdd}><Icon name="plus" size={15} /> Add Appliance</Btn>
      </div>

      <div className="appliances__info-bar">
        <span className="appliances__info-text">Not sure about your appliance's wattage?</span>
        <button className="appliances__power-link" onClick={() => setShowPowerRef(true)}>View power reference chart</button>
      </div>

      {loading ? <Loader /> : appliances.length === 0 ? (
        <div className="appliances__empty">
          <Icon name="appliance" size={40} color="var(--text3)" />
          <div style={{ fontSize: 16 }}>No appliances added yet</div>
          <div style={{ fontSize: 13 }}>Track your AC, fridge, fans and more</div>
          <Btn onClick={openAdd} style={{ marginTop: 6 }}><Icon name="plus" size={15} /> Add First Appliance</Btn>
        </div>
      ) : (
        <div className="appliances__grid">
          {groupKeys.map((baseName) => (
            <GroupCard key={baseName} baseName={baseName} items={grouped[baseName]} totalAllUnits={totalUnits} onEdit={openEdit} onDelete={remove} deletingId={deletingId} />
          ))}
        </div>
      )}

      {/* Add modal */}
      {showModal && !editItem && (
        <Modal title="Add Appliance" onClose={closeModal} maxWidth={500}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 12, alignItems: 'flex-end' }}>
              <F label="Appliance Name *">
                <input placeholder="e.g. Fan" value={name} onChange={e => setName(e.target.value)} />
              </F>
              <div>
                <label style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 6, display: 'block' }}>Quantity</label>
                <div className="qty-stepper">
                  <button className="qty-stepper__btn" onClick={() => changeQty(-1)}>−</button>
                  <div className="qty-stepper__val">{quantity}</div>
                  <button className="qty-stepper__btn" onClick={() => changeQty(1)}>+</button>
                </div>
              </div>
            </div>

            {quantity === 1 && (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <F label="Power (Watts) *"><input type="number" placeholder="e.g. 75" value={single.voltage} onChange={e => setSingle(f => ({ ...f, voltage: e.target.value }))} /></F>
                  <F label="Hours Per Day *"><input type="number" placeholder="e.g. 8" value={single.hoursPerDay} onChange={e => setSingle(f => ({ ...f, hoursPerDay: e.target.value }))} /></F>
                </div>
                <div>
                  <F label="Days (optional — auto from latest bill)"><input type="number" placeholder="e.g. 31" value={single.days} onChange={e => setSingle(f => ({ ...f, days: e.target.value }))} /></F>
                  {!single.days && <DaysWarning />}
                </div>
                <div className="bills__hint" style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text3)' }}>kWh = (Watts × Hours × Days) ÷ 1000</span>
                  {singlePreview() && <span style={{ fontWeight: 600 }}>~{singlePreview()} kWh</span>}
                </div>
              </>
            )}

            {quantity >= 2 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxHeight: 380, overflowY: 'auto', paddingRight: 2 }}>
                {subForms.map((f, i) => <SubForm key={i} index={i} name={name} data={f} onChange={updateSubForm} />)}
              </div>
            )}

            <div className="bills__hint">
              <span style={{ color: 'var(--text3)' }}>Don't know the watts? </span>
              <button className="appliances__power-link" onClick={() => setShowPowerRef(true)}>View power reference chart</button>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <Btn variant="ghost" onClick={closeModal} style={{ flex: 1, justifyContent: 'center' }}>Cancel</Btn>
              <Btn onClick={save} loading={saving} style={{ flex: 1, justifyContent: 'center' }}>
                {quantity > 1 ? `Add ${quantity} Appliances` : 'Add Appliance'}
              </Btn>
            </div>
          </div>
        </Modal>
      )}

      {/* Edit modal */}
      {showModal && editItem && (
        <Modal title={`Edit — ${editItem.name}`} onClose={closeModal}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <F label="Appliance Name *"><input placeholder="e.g. Fan" value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} /></F>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <F label="Power (Watts) *"><input type="number" placeholder="e.g. 75" value={editForm.voltage} onChange={e => setEditForm(f => ({ ...f, voltage: e.target.value }))} /></F>
              <F label="Hours Per Day *"><input type="number" placeholder="e.g. 8" value={editForm.hoursPerDay} onChange={e => setEditForm(f => ({ ...f, hoursPerDay: e.target.value }))} /></F>
            </div>
            <div>
              <F label="Days (optional — auto from latest bill)"><input type="number" placeholder="e.g. 31" value={editForm.days} onChange={e => setEditForm(f => ({ ...f, days: e.target.value }))} /></F>
              {!editForm.days && <DaysWarning />}
            </div>
            <div className="bills__hint" style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text3)' }}>kWh = (Watts × Hours × Days) ÷ 1000</span>
              {editPreview() && <span style={{ fontWeight: 600 }}>~{editPreview()} kWh</span>}
            </div>
            <div className="bills__hint">
              <span style={{ color: 'var(--text3)' }}>Don't know the watts? </span>
              <button className="appliances__power-link" onClick={() => setShowPowerRef(true)}>View power reference chart</button>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <Btn variant="ghost" onClick={closeModal} style={{ flex: 1, justifyContent: 'center' }}>Cancel</Btn>
              <Btn onClick={save} loading={saving} style={{ flex: 1, justifyContent: 'center' }}>Update</Btn>
            </div>
          </div>
        </Modal>
      )}

      {showPowerRef && <PowerRefPopup onClose={() => setShowPowerRef(false)} />}
    </div>
  )
}

export default AppliancesPage
