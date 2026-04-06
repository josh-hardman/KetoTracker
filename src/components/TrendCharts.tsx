import { useMemo, useState, useRef, useCallback } from 'react'
import type { DailyLog } from '../types'
import type { MacroKey, MacroTotals } from '../constants'
import { MACRO_META } from '../constants'
import { fmtDateShort, fmtDate, fmtMacroVal } from '../tz'

interface DayTotals extends MacroTotals {
  date: string
}

const CHART_W = 200
const CHART_H = 60

interface PointData {
  x: number
  y: number
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
    const svgY = CHART_H - ((v - yMin) / (yMax - yMin)) * CHART_H
    return { x: frac, y: svgY }
  })

  const line = pts.map(p => `${p.x * CHART_W},${p.y}`).join(' ')
  const area = `0,${CHART_H} ${line} ${CHART_W},${CHART_H}`

  return { line, area, pts, yMin, yMax }
}

function aggregateByDate(logs: DailyLog[]): DayTotals[] {
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

  // Build a full 14-day window ending today, filling gaps with zeros
  const result: DayTotals[] = []
  const today = new Date()
  for (let i = 13; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const key = d.toISOString().slice(0, 10)
    result.push(map.get(key) || { date: key, cal: 0, fat: 0, pro: 0, carb: 0 })
  }

  return result
}

function ChartCard({ macroKey, label, unit, days }: { macroKey: MacroKey; label: string; unit: string; days: DayTotals[] }) {
  const [activeIdx, setActiveIdx] = useState<number | null>(null)
  const plotRef = useRef<HTMLDivElement>(null)

  const values = days.map(d => d[macroKey])
  const latest = values.length > 0 ? values[values.length - 1] : null
  const { line, area, pts, yMin, yMax } = buildPoints(values)

  const firstDate = days.length > 0 ? fmtDateShort(days[0].date) : ''
  const lastDate = days.length > 0 ? fmtDateShort(days[days.length - 1].date) : ''

  const getIndexFromX = useCallback((clientX: number) => {
    const el = plotRef.current
    if (!el || days.length === 0) return null
    const rect = el.getBoundingClientRect()
    const frac = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
    return Math.round(frac * (days.length - 1))
  }, [days.length])

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    setActiveIdx(getIndexFromX(e.clientX))
  }, [getIndexFromX])

  const onPointerLeave = useCallback(() => setActiveIdx(null), [])

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length > 0) {
      setActiveIdx(getIndexFromX(e.touches[0].clientX))
    }
  }, [getIndexFromX])

  const activePt = activeIdx !== null ? pts[activeIdx] : null
  const activeDay = activeIdx !== null ? days[activeIdx] : null

  return (
    <div className={`tchart ${macroKey}`}>
      <div className="tchart-label">{label} · 14d</div>
      {values.length === 0 ? (
        <div className="empty">No data yet</div>
      ) : (
        <div className="tchart-body">
          <div className="tchart-yaxis">
            <span>{fmtMacroVal(macroKey, yMax)}</span>
            <span>{fmtMacroVal(macroKey, yMin)}</span>
          </div>
          <div className="tchart-plot" ref={plotRef}>
            <div
              className="tchart-hover-zone"
              onPointerMove={onPointerMove}
              onPointerLeave={onPointerLeave}
              onTouchMove={onTouchMove}
              onTouchEnd={onPointerLeave}
            />
            <svg viewBox={`0 0 ${CHART_W} ${CHART_H}`} preserveAspectRatio="none">
              <polygon points={area} className={`tfill ${macroKey}`} />
              {values.length > 1 && (
                <polyline points={line} className={`tline ${macroKey}`} />
              )}
              {activePt && (
                <line
                  x1={activePt.x * CHART_W} y1={0}
                  x2={activePt.x * CHART_W} y2={CHART_H}
                  className="tcrosshair"
                />
              )}
              {activePt ? (
                <circle cx={activePt.x * CHART_W} cy={activePt.y} r="3" className={`tdot ${macroKey}`} />
              ) : (
                <circle cx={pts[pts.length - 1].x * CHART_W} cy={pts[pts.length - 1].y} r="3" className={`tdot ${macroKey}`} />
              )}
            </svg>
            {activePt && activeDay && (
              <div
                className="tchart-tooltip"
                style={{ left: `${activePt.x * 100}%` }}
              >
                <span className="tt-date">{fmtDate(activeDay.date)}</span>
                <span className={`tt-val ${macroKey}`}>{fmtMacroVal(macroKey, activeDay[macroKey])} {unit}</span>
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
        <div className={`tchart-val ${macroKey}`}>
          {fmtMacroVal(macroKey, latest)} {unit}
        </div>
      )}
    </div>
  )
}

export default function TrendCharts({ logs }: { logs: DailyLog[] }) {
  const days = useMemo(() => aggregateByDate(logs), [logs])

  return (
    <div className="trend-row">
      {MACRO_META.map(m => (
        <ChartCard key={m.key} macroKey={m.key} label={m.label} unit={m.shortUnit} days={days} />
      ))}
    </div>
  )
}
