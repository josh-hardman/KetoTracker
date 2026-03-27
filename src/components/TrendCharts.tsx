import { useMemo, useState, useRef, useCallback } from 'react'
import type { DailyLog } from '../types'

interface DayTotals {
  date: string
  cal: number
  fat: number
  pro: number
  carb: number
}

type MacroKey = 'cal' | 'fat' | 'pro' | 'carb'

const CHARTS: { key: MacroKey; label: string; unit: string }[] = [
  { key: 'cal', label: 'Calories', unit: 'kcal' },
  { key: 'fat', label: 'Fat', unit: 'g' },
  { key: 'pro', label: 'Protein', unit: 'g' },
  { key: 'carb', label: 'Net carbs', unit: 'g' },
]

const W = 200
const H = 60

function formatVal(key: MacroKey, v: number) {
  return key === 'carb' ? v.toFixed(1) : String(Math.round(v))
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr + 'T12:00:00')
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function formatDateFull(dateStr: string) {
  const d = new Date(dateStr + 'T12:00:00')
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

interface PointData {
  x: number  // 0–1 fraction across the chart
  y: number  // SVG y coordinate
}

function buildPoints(values: number[]) {
  if (values.length === 0) return { line: '', area: '', pts: [] as PointData[], yMin: 0, yMax: 0 }

  const rawMin = Math.min(...values)
  const rawMax = Math.max(...values)
  const range = rawMax - rawMin || 1
  const pad = range * 0.1
  const yMin = rawMin - pad
  const yMax = rawMax + pad

  const pts = values.map((v, i) => {
    const frac = values.length === 1 ? 0.5 : i / (values.length - 1)
    const svgY = H - ((v - yMin) / (yMax - yMin)) * H
    return { x: frac, y: svgY }
  })

  const line = pts.map(p => `${p.x * W},${p.y}`).join(' ')
  const area = `0,${H} ${line} ${W},${H}`

  return { line, area, pts, yMin, yMax }
}

function ChartCard({ chartDef, days }: { chartDef: typeof CHARTS[number]; days: DayTotals[] }) {
  const c = chartDef
  const [activeIdx, setActiveIdx] = useState<number | null>(null)
  const plotRef = useRef<HTMLDivElement>(null)

  const values = days.map(d => d[c.key])
  const latest = values.length > 0 ? values[values.length - 1] : null
  const { line, area, pts, yMin, yMax } = useMemo(() => buildPoints(values), [values])

  const firstDate = days.length > 0 ? formatDate(days[0].date) : ''
  const lastDate = days.length > 0 ? formatDate(days[days.length - 1].date) : ''

  const getIndexFromX = useCallback((clientX: number) => {
    const el = plotRef.current
    if (!el || days.length === 0) return null
    const rect = el.getBoundingClientRect()
    const frac = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
    const idx = Math.round(frac * (days.length - 1))
    return idx
  }, [days.length])

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    setActiveIdx(getIndexFromX(e.clientX))
  }, [getIndexFromX])

  const onPointerLeave = useCallback(() => {
    setActiveIdx(null)
  }, [])

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length > 0) {
      setActiveIdx(getIndexFromX(e.touches[0].clientX))
    }
  }, [getIndexFromX])

  const activePt = activeIdx !== null ? pts[activeIdx] : null
  const activeDay = activeIdx !== null ? days[activeIdx] : null

  return (
    <div key={c.key} className={`tchart ${c.key}`}>
      <div className="tchart-label">{c.label} · 14d</div>
      {values.length === 0 ? (
        <div className="empty">No data yet</div>
      ) : (
        <div className="tchart-body">
          <div className="tchart-yaxis">
            <span>{formatVal(c.key, yMax)}</span>
            <span>{formatVal(c.key, yMin)}</span>
          </div>
          <div className="tchart-plot" ref={plotRef}>
            <div
              className="tchart-hover-zone"
              onPointerMove={onPointerMove}
              onPointerLeave={onPointerLeave}
              onTouchMove={onTouchMove}
              onTouchEnd={onPointerLeave}
            />
            <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
              <polygon points={area} className={`tfill ${c.key}`} />
              {values.length > 1 && (
                <polyline points={line} className={`tline ${c.key}`} />
              )}
              {activePt && (
                <line
                  x1={activePt.x * W} y1={0}
                  x2={activePt.x * W} y2={H}
                  className="tcrosshair"
                />
              )}
              {activePt ? (
                <circle cx={activePt.x * W} cy={activePt.y} r="3" className={`tdot ${c.key}`} />
              ) : (
                <circle cx={pts[pts.length - 1].x * W} cy={pts[pts.length - 1].y} r="3" className={`tdot ${c.key}`} />
              )}
            </svg>
            {activePt && activeDay && (
              <div
                className="tchart-tooltip"
                style={{ left: `${activePt.x * 100}%` }}
              >
                <span className="tt-date">{formatDateFull(activeDay.date)}</span>
                <span className={`tt-val ${c.key}`}>{formatVal(c.key, activeDay[c.key])} {c.unit}</span>
              </div>
            )}
            <div className="tchart-xaxis">
              <span>{firstDate}</span>
              <span>{lastDate}</span>
            </div>
          </div>
        </div>
      )}
      {latest !== null && (
        <div className={`tchart-val ${c.key}`}>
          {activeIdx === null
            ? `${formatVal(c.key, latest)} ${c.unit}`
            : `${formatVal(c.key, latest)} ${c.unit}`
          }
        </div>
      )}
    </div>
  )
}

export default function TrendCharts({ logs }: { logs: DailyLog[] }) {
  const days = useMemo(() => {
    const map = new Map<string, DayTotals>()

    for (const l of logs) {
      const d = map.get(l.date) || { date: l.date, cal: 0, fat: 0, pro: 0, carb: 0 }
      const s = l.servings
      const f = l.foods
      d.cal += f.calories * s
      d.fat += f.fat * s
      d.pro += f.protein * s
      d.carb += f.net_carbs * s
      map.set(l.date, d)
    }

    return [...map.values()].sort((a, b) => a.date.localeCompare(b.date)).slice(-14)
  }, [logs])

  return (
    <div className="trend-row">
      {CHARTS.map(c => (
        <ChartCard key={c.key} chartDef={c} days={days} />
      ))}
    </div>
  )
}
