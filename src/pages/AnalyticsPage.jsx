import '../styles/pages/AnalyticsPage.css'
import { useState, useEffect } from 'react'
import { api }      from '../api'
import { useToast } from '../context/ToastContext'
import StatCard     from '../components/StatCard'
import Loader       from '../components/Loader'
import Icon         from '../components/Icon'

// ── AnalyticsPage ─────────────────────────────────────────────────
// Deep analytics: predictions, trends, breakdown, alerts, tips, gauge.
const AnalyticsPage = () => {
  const toast = useToast()
  const [data, setData]       = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [monthly, breakdown, pred, sug, alerts, eff] = await Promise.all([
          api.get('/analytics/analytics/monthly-usage'),
          api.get('/analytics/analytics/app-breakdown'),
          api.get('/analytics/analytics/predictions'),
          api.get('/analytics/analytics/suggestions'),
          api.get('/analytics/analytics/alerts'),
          api.get('/analytics/analytics/eff-score'),
        ])
        setData({
          monthly:   monthly.data   || [],
          breakdown: breakdown.data || [],
          pred,
          sug:    sug.data    || [],
          alerts: alerts.data || [],
          eff,
        })
      } catch { toast('Failed to load analytics', 'error') }
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return <Loader />

  const monthly   = data.monthly   || []
  const breakdown = data.breakdown || []
  const score     = data.eff?.efficiencyScore ?? 0
  const maxUnits  = Math.max(...monthly.map(m => m.totalUnits), 1)

  return (
    <div className="analytics">

      {/* Header */}
      <div>
        <h2 className="analytics__title">Analytics</h2>
        <p className="analytics__subtitle">Insights and predictions from your energy data</p>
      </div>

      {/* Stat cards */}
      <div className="analytics__stats">
        <StatCard icon="trend" label="Predicted Next Units" value={data.pred?.predictedUnits ? `${data.pred.predictedUnits} kWh` : '—'} sub="based on billing average" delay={0} />
        <StatCard icon="bolt"  label="Predicted Next Cost"  value={data.pred?.predictedCost  ? `₹${data.pred.predictedCost}` : '—'}          sub="based on billing average" delay={0.05} />
        <StatCard icon="star"  label="Efficiency Score"     value={`${score} / 100`}           sub={score >= 90 ? 'Excellent' : score >= 70 ? 'Good usage' : 'High usage'} delay={0.1} />
      </div>

      {/* Monthly trend + Appliance breakdown */}
      <div className="analytics__charts">

        {/* Monthly horizontal bars */}
        <div className="analytics__card">
          <div className="analytics__card-title">Monthly Usage Trend</div>
          {monthly.length === 0
            ? <div className="analytics__card-empty">No billing data yet</div>
            : (
              <div className="analytics__trend-rows">
                {[...monthly].slice(0, 6).map((m, i) => (
                  <div key={i} className="analytics__trend-row">
                    <span className="analytics__trend-month">{m.month?.slice(0, 7)}</span>
                    <div className="analytics__trend-bar-track">
                      <div
                        className={`analytics__trend-bar-fill ${i === 0 ? 'analytics__trend-bar-fill--latest' : 'analytics__trend-bar-fill--old'}`}
                        style={{ width: `${(m.totalUnits / maxUnits) * 100}%` }}
                      >
                        <span className={`analytics__trend-bar-text ${i === 0 ? 'analytics__trend-bar-text--latest' : 'analytics__trend-bar-text--old'}`}>
                          {m.totalUnits}
                        </span>
                      </div>
                    </div>
                    <span className="analytics__trend-amount">₹{m.totalAmount}</span>
                  </div>
                ))}
              </div>
            )}
        </div>

        {/* Appliance breakdown */}
        <div className="analytics__card">
          <div className="analytics__card-title">Appliance Breakdown</div>
          {breakdown.length === 0
            ? <div className="analytics__card-empty">Add appliances to see breakdown</div>
            : (
              <div className="analytics__breakdown-rows">
                {breakdown.map((a, i) => (
                  <div key={i}>
                    <div className="analytics__breakdown-row-header">
                      <span className="analytics__breakdown-name">{a.name}</span>
                      <span className="analytics__breakdown-stats">{a.units?.toFixed(1)} kWh · {a.percentage}%</span>
                    </div>
                    <div className="analytics__breakdown-bar-track">
                      <div
                        className="analytics__breakdown-bar-fill"
                        style={{ width: `${a.percentage}%`, background: i % 2 === 0 ? 'var(--chart-active)' : 'var(--chart-inactive)' }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
        </div>
      </div>

      {/* Alerts + Tips */}
      <div className="analytics__bottom">

        <div className="analytics__card">
          <div className="analytics__card-title">Usage Alerts</div>
          <div className="analytics__alerts">
            {(data.alerts || []).map((alert, i) => {
              const isNormal = alert.includes('No unusual') || alert.includes('Not enough')
              return (
                <div key={i} className="analytics__alert-item">
                  <Icon name="alert" size={14} color={isNormal ? 'var(--text3)' : 'var(--text2)'} />
                  <span className="analytics__alert-text" style={{ color: isNormal ? 'var(--text3)' : 'var(--text2)' }}>
                    {alert}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        <div className="analytics__card">
          <div className="analytics__card-title">Energy Saving Tips</div>
          <div className="analytics__tips">
            {(data.sug || []).map((tip, i) => (
              <div key={i} className="analytics__tip-item">
                <Icon name="activity" size={13} color="var(--text3)" />
                <span className="analytics__tip-text">{tip}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Large gauge */}
      <div className="analytics__gauge-card">
        <span className="analytics__gauge-title">Overall Efficiency Score</span>

        <div className="analytics__gauge-wrap">
          <svg width="240" height="130" viewBox="0 0 240 130">
            <path d="M 20 120 A 100 100 0 0 1 220 120" fill="none" stroke="var(--bg4)" strokeWidth="14" strokeLinecap="round" />
            <path d="M 20 120 A 100 100 0 0 1 220 120" fill="none"
              stroke={score >= 70 ? 'var(--chart-active)' : 'var(--danger)'}
              strokeWidth="14" strokeLinecap="round"
              strokeDasharray={`${(score / 100) * 314} 314`}
            />
          </svg>
          <div className="analytics__gauge-center">
            <div className="analytics__gauge-score" style={{ color: score >= 70 ? 'var(--chart-active)' : 'var(--danger)' }}>
              {score}
            </div>
            <div className="analytics__gauge-sub">out of 100</div>
          </div>
        </div>

        <div className="analytics__gauge-legend">
          {[{ label: 'Excellent', range: '90–100' }, { label: 'Good', range: '70–89' }, { label: 'High Usage', range: '0–69' }].map(({ label, range }) => (
            <div key={label} className="analytics__gauge-legend-item">
              <div className="analytics__gauge-dot" />
              <span className="analytics__gauge-label">{label}</span>
              <span className="analytics__gauge-range">{range}</span>
            </div>
          ))}
        </div>

        <div className="analytics__gauge-message">
          {score >= 90 ? 'Excellent — your energy usage is very efficient!'
            : score >= 70 ? 'Good — a few improvements could save more energy'
            : 'High consumption — consider reducing appliance usage'}
        </div>
      </div>
    </div>
  )
}

export default AnalyticsPage
