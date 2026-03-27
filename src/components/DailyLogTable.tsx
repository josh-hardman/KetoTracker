import { useState } from 'react'
import type { DailyLog } from '../types'

interface DailyLogTableProps {
  logs: DailyLog[]
  selectedDate: string
}

function today() {
  return new Date().toISOString().split('T')[0]
}

function fmt(d: string) {
  return new Date(d + 'T12:00:00').toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric'
  })
}

function tierClass(tier: number | null | undefined): string {
  if (!tier || tier < 3) return ''
  return `tier-${tier}`
}

function tierBadge(tier: number | null | undefined): string | null {
  if (tier === 5) return '✦'
  if (tier === 4) return '·'
  return null
}

const CAT_COLORS: Record<string, string> = {
  protein:    '#a07070',
  fat:        '#a08c5a',
  vegetable:  '#6a9a7a',
  fruit:      '#8a7098',
  spice:      '#a07850',
  cheese:     '#9a9060',
  supplement: '#6878a0',
  beverage:   '#5a8a8a',
}

export default function DailyLogTable({ logs, selectedDate }: DailyLogTableProps) {
  const t = today()
  const title = selectedDate === t ? 'Logged today' : `Logged · ${fmt(selectedDate)}`
  const [tooltipIdx, setTooltipIdx] = useState<number | null>(null)

  return (
    <div className="panel">
      <div className="phdr">{title}</div>
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
                  <td className="tc">{l.logged_at ? l.logged_at.slice(0, 5) : '—'}</td>
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
