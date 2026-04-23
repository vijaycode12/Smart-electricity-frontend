import '../styles/pages/Dashboard.css'
import { useState, useEffect } from 'react'
import { api }      from '../api'
import { useToast } from '../context/ToastContext'
import StatCard     from '../components/StatCard'
import Loader       from '../components/Loader'
import Icon         from '../components/Icon'

// ── Dashboard ─────────────────────────────────────────────────────
// Main overview page: stat cards, bar chart, tips, gauge, recent bills.
const Dashboard = () => {
  const toast = useToast()
  const [data, setData]       = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        // Fetch all 6 endpoints in parallel for speed
        const [bills, monthly, pred, eff, alerts, suggestions] = await Promise.all([
          api.get('/bill/bills'),
          api.get('/analytics/analytics/monthly-usage'),
          api.get('/analytics/analytics/predictions'),
          api.get('/analytics/analytics/eff-score'),
          api.get('/analytics/analytics/alerts'),
          api.get('/analytics/analytics/suggestions'),
        ])
        setData({
          bills:       bills.data   || [],
          monthly:     monthly.data || [],
          pred, eff,
          alerts:      alerts.data  || [],
          suggestions: suggestions.data || [],
        })
      } catch { toast('Failed to load dashboard', 'error') }
      setLoading(false)
    }
    load()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (loading) return <Loader />

  const latestBill    = data.bills?.[0]
  const chartData     = [...(data.monthly || [])].slice(0, 6).reverse()
  const maxUnits      = Math.max(...chartData.map(m => m.totalUnits), 1)
  const activeAlerts  = (data.alerts || []).filter(a => !a.includes('No unusual') && !a.includes('Not enough'))
  const score         = data.eff?.efficiencyScore ?? 0

  return (
    <div className="dashboard">

      {/* Header */}
      <div className="dashboard__header">
        <div>
          <h2 className="dashboard__title">Dashboard</h2>
          <p className="dashboard__subtitle">Your energy overview</p>
        </div>
        <div className="dashboard__date">
          {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      {/* Alert banner */}
      {activeAlerts.length > 0 && (
        <div className="dashboard__alert">
          <Icon name="alert" size={16} color="var(--text3)" />
          <div>
            <div className="dashboard__alert-title">Usage Alerts</div>
            {activeAlerts.map((a, i) => (
              <div key={i} className="dashboard__alert-item">— {a}</div>
            ))}
          </div>
        </div>
      )}

      {/* 4 stat cards */}
      <div className="dashboard__stats">
        <StatCard icon="bills"  label="Total Bills"      value={data.bills?.length || 0}                                       sub="uploaded bills"     delay={0}    />
        <StatCard icon="bolt"   label="Latest Usage"     value={latestBill ? `${latestBill.totalUnits} kWh` : '—'}            sub={latestBill ? `₹${latestBill.totalAmount}` : 'No bills yet'} delay={0.05} />
        <StatCard icon="trend"  label="Predicted Units"  value={data.pred?.predictedUnits ? `${data.pred.predictedUnits} kWh` : '—'} sub={data.pred?.predictedCost ? `~₹${data.pred.predictedCost}` : ''} delay={0.1} />
        <StatCard icon="star"   label="Efficiency Score" value={`${score}/100`}                                                sub={score >= 90 ? 'Excellent' : score >= 70 ? 'Good usage' : 'Needs improvement'} delay={0.15} />
      </div>

      {/* Chart + Tips */}
      <div className="dashboard__middle">

        {/* Monthly bar chart */}
        <div className="dashboard__chart-card">
          <div className="dashboard__chart-header">
            <span className="dashboard__chart-label">Monthly Consumption</span>
            <span className="dashboard__chart-unit">kWh / month</span>
          </div>
          {chartData.length === 0
            ? <div className="dashboard__chart-empty">Add bills to see this chart</div>
            : (
              <div className="dashboard__chart-bars">
                {chartData.map((m, i) => {
                  const isLatest = i === chartData.length - 1
                  const h = Math.max((m.totalUnits / maxUnits) * 140, 4)
                  return (
                    <div key={i} className="dashboard__chart-col">
                      <span className="dashboard__chart-val">{m.totalUnits}</span>
                      <div
                        className={`dashboard__chart-bar ${isLatest ? 'dashboard__chart-bar--active' : 'dashboard__chart-bar--inactive'}`}
                        style={{ height: h }}
                      />
                      <span className="dashboard__chart-month">{m.month?.slice(5)}</span>
                    </div>
                  )
                })}
              </div>
            )}
        </div>

        {/* Energy tips */}
        <div className="dashboard__tips-card">
          <div className="dashboard__tips-title">Energy Tips</div>
          {(data.suggestions || []).length === 0
            ? <div className="dashboard__tips-empty">Add appliances to get tips</div>
            : (data.suggestions || []).map((tip, i) => (
                <div key={i} className="dashboard__tip">
                  <Icon name="activity" size={13} color="var(--text3)" />
                  <span className="dashboard__tip-text">{tip}</span>
                </div>
              ))}
        </div>
      </div>

      {/* Gauge + Recent bills */}
      <div className="dashboard__bottom">

        {/* Efficiency gauge */}
        <div className="dashboard__gauge-card">
          <span className="dashboard__gauge-title">Efficiency</span>
          <svg width="150" height="85" viewBox="0 0 160 90">
            <path d="M 15 80 A 65 65 0 0 1 145 80" fill="none" stroke="var(--bg4)" strokeWidth="10" strokeLinecap="round" />
            <path d="M 15 80 A 65 65 0 0 1 145 80" fill="none"
              stroke={score >= 70 ? 'var(--chart-active)' : 'var(--danger)'}
              strokeWidth="10" strokeLinecap="round"
              strokeDasharray={`${(score / 100) * 204} 204`}
            />
          </svg>
          <div className="dashboard__gauge-score" style={{ color: score >= 70 ? 'var(--chart-active)' : 'var(--danger)' }}>
            {score}
          </div>
          <span className="dashboard__gauge-label">
            {score >= 90 ? 'Excellent' : score >= 70 ? 'Good' : 'High usage'}
          </span>
        </div>

        {/* Recent bills */}
        <div className="dashboard__bills-card">
          <div className="dashboard__bills-title">Recent Bills</div>
          {(data.bills || []).length === 0
            ? <div className="dashboard__bills-empty">No bills added yet</div>
            : (
              <div className="dashboard__bills-list">
                {(data.bills || []).slice(0, 4).map((b, i) => (
                  <div key={i} className="dashboard__bill-row">
                    <div className="dashboard__bill-icon">
                      <Icon name="file" size={15} color="var(--text3)" />
                    </div>
                    <div className="dashboard__bill-info">
                      <div className="dashboard__bill-date">
                        {b.billEndDate
                          ? new Date(b.billEndDate).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
                          : 'Bill'}
                      </div>
                      <div className="dashboard__bill-days">{b.totalDays || '—'} days</div>
                    </div>
                    <div className="dashboard__bill-amounts">
                      <div className="dashboard__bill-kwh">{b.totalUnits} kWh</div>
                      <div className="dashboard__bill-price">₹{b.totalAmount || '—'}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard
