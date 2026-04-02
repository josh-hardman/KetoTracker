import { useState } from 'react'
import type { DailyLog } from '../types'
import { todayMT, fmtDate, fmtLogTime } from '../tz'
import { tierClass, tierBadge } from '../therapeutic'
import { CAT_COLORS } from '../constants'

interface DailyLogTableProps {
  logs: DailyLog[]
  selectedDate: string
}

const SENSITIVITY: Record<string, { label: string; cls: string; tip: string }> = {
  severe:   { label: 'Avoid',   cls: 'sens-severe',   tip: 'Severe: eliminate for 6+ months per ALCAT results' },
  moderate: { label: 'Moderate', cls: 'sens-moderate', tip: 'Moderate: limit intake, rotate every 4+ days' },
  mild:     { label: 'Rotate',  cls: 'sens-mild',     tip: 'Mild: rotate every 3–4 days per ALCAT results' },
}

export default function DailyLogTable({ logs, selectedDate }: DailyLogTableProps) {
  const isToday = selectedDate === todayMT()
  const title = isToday ? 'Logged today' : `Logged · ${fmtDate(selectedDate)}`
  const [tooltipIdx, setTooltipIdx] = useState<number | null>(null)
  const [bannerDismissed, setBannerDismissed] = useState(false)

  const hasSevere = logs.some(l => l.foods.sensitivity_level === 'severe')

  return (
    <div className="panel">
      <div className="phdr">{title}</div>
      {hasSevere && !bannerDismissed && (
        <div className="sens-banner">
          <span>Your log contains foods flagged as severe sensitivities. Consider swapping these out.</span>
          <button className="sens-banner-close" onClick={() => setBannerDismissed(true)}>×</button>
        </div>
      )}
      {logs.length === 0 ? (
        <div className="empty">Nothing logged for this day.</div>
      ) : (
        <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Food</th>
              <th>Time</th>
              <th className="r">Cal</th>
              <th className="r">Fat</th>
              <th className="r">Prot</th>
              <th className="r">Carbs</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((l, i) => {
              const s = l.servings
              const f = l.foods
              const tc = tierClass(f.therapeutic_tier)
              const badge = tierBadge(f.therapeutic_tier)
              const hasTooltip = !!f.therapeutic_note
              const sens = f.sensitivity_level ? SENSITIVITY[f.sensitivity_level] : null

              return (
                <tr key={i} className={tc}>
                  <td className="food-cell">
                    <span
                      className={`food-name${hasTooltip ? ' has-note' : ''}`}
                      onMouseEnter={() => hasTooltip && setTooltipIdx(i)}
                      onMouseLeave={() => setTooltipIdx(null)}
                      onTouchStart={() => hasTooltip && setTooltipIdx(tooltipIdx === i ? null : i)}
                    >
                      {badge ? (
                        <span
                          className={`tier-badge ${tc}`}
                          style={f.category && CAT_COLORS[f.category] ? { color: CAT_COLORS[f.category] } : undefined}
                        >{badge}</span>
                      ) : f.category && CAT_COLORS[f.category] ? (
                        <span
                          className="cat-dot"
                          style={{ background: CAT_COLORS[f.category] }}
                          title={f.category}
                        />
                      ) : null}
                      {f.name}
                      {s !== 1 && <span className="sbadge">×{s}</span>}
                      {sens && <span className={`sens-pill ${sens.cls}`} title={sens.tip}>{sens.label}</span>}
                    </span>
                    {tooltipIdx === i && f.therapeutic_note && (
                      <div className="th-tooltip">
                        <div className="th-tooltip-note">{f.therapeutic_note}</div>
                        {f.therapeutic_tags && f.therapeutic_tags.length > 0 && (
                          <div className="th-tooltip-tags">
                            {f.therapeutic_tags.map(tag => (
                              <span key={tag} className="th-tag">{tag}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="tc">{fmtLogTime(l)}</td>
                  <td className="r">{Math.round(f.calories * s)}</td>
                  <td className="r">{Math.round(f.fat * s)}g</td>
                  <td className="r">{Math.round(f.protein * s)}g</td>
                  <td className="r">{(f.net_carbs * s).toFixed(1)}g</td>
                </tr>
              )
            })}
          </tbody>
        </table>
        </div>
      )}
    </div>
  )
}
