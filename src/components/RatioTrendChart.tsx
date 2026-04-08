import { useMemo, useState, useRef, useCallback } from 'react'
import type { DailyLog } from '../types'
import { fmtDateShort, fmtDate, todayMT } from '../tz'

interface DayRatio {
  date: string
  ratio: number | null
  fat: number
  pro: number
  carb: number
}

const CHART_W = 600
const CHART_H = 140
const REF_LINES = [
  { value: 2.5, label: '2.5:1  therapeutic',      cls: 'rtref-ok'   },
  { value: 3.0, label: '3.0:1  deep therapeutic', cls: 'rtref-deep' },
]

function buildDateRange(numDays: number): string[] {
  const today = todayMT()
  const [y, m, d] = today.split('-').map(Number)
  const base = new Date(y, m - 1, d)
  const result: string[] = []
  for (let i = numDays - 1; i >= 0; i--) {
    const dt = new Date(base)
    dt.setDate(base.getDate() - i)
    result.push(
      dt.getFullYear() + '-' +
      String(dt.getMonth() + 1).padStart(2, '0') + '-' +
      String(dt.getDate()).padStart(2, '0')
    )
  }
  return result
}

function aggregateRatios(logs: DailyLog[]): DayRatio[] {
  const map = new Map<string, { fat: number; pro: number; carb: number }>()
  for (const l of logs) {
    const entry = map.get(l.date) ?? { fat: 0, pro: 0, carb: 0 }
    entry.fat += l.foods.fat * l.servings
    entry.pro += l.foods.protein * l.servings
    entry.carb += l.foods.net_carbs * l.servings
    map.set(l.date, entry)
  }

  return buildDateRange(30).map(date => {
    const entry = map.get(date)
    if (!entry) return { date, ratio: null, fat: 0, pro: 0, carb: 0 }
    const denom = entry.pro + entry.carb
    return { date, ratio: denom > 0 ? entry.fat / denom : null, ...entry }
  })
}

export default function RatioTrendChart({ logs, embedded = false }: { logs: DailyLog[]; embedded?: boolean }) {
  const days = useMemo(() => aggregateRatios(logs), [logs])
  const [activeIdx, setActiveIdx] = useState<number | null>(null)
  const plotRef = useRef<HTMLDivElement>(null)

  const dataValues = days.filter(d => d.ratio !== null).map(d => d.ratio as number)

  const yMin = dataValues.length > 0
    ? Math.min(Math.min(...dataValues) - 0.3, 1.8)
    : 0
  const yMax = dataValues.length > 0
    ? Math.max(Math.max(...dataValues) + 0.3, 3.3)
    : 4

  const toY = (v: number) => CHART_H - ((v - yMin) / (yMax - yMin)) * CHART_H

  const pts = days.map((d, i) => {
    if (d.ratio === null) return null
    const x = days.length === 1 ? CHART_W / 2 : (i / (days.length - 1)) * CHART_W
    return { x, y: toY(d.ratio) }
  })

  // Build polyline segments (skip null gaps)
  const segments: string[] = []
  let seg: string[] = []
  pts.forEach((pt, i) => {
    if (pt === null) {
      if (seg.length > 1) segments.push(seg.join(' '))
      seg = []
    } else {
      seg.push(`${pt.x},${pt.y}`)
    }
    if (i === pts.length - 1 && seg.length > 1) segments.push(seg.join(' '))
  })

  const getIdxFromX = useCallback((clientX: number) => {
    const el = plotRef.current
    if (!el) return null
    const rect = el.getBoundingClientRect()
    const frac = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
    return Math.round(frac * (days.length - 1))
  }, [days.length])

  const onPointerMove = useCallback((e: React.PointerEvent) => setActiveIdx(getIdxFromX(e.clientX)), [getIdxFromX])
  const onPointerLeave = useCallback(() => setActiveIdx(null), [])
  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length > 0) setActiveIdx(getIdxFromX(e.touches[0].clientX))
  }, [getIdxFromX])

  const activePt = activeIdx !== null ? pts[activeIdx] : null
  const activeDay = activeIdx !== null ? days[activeIdx] : null
  const latestDay = [...days].reverse().find(d => d.ratio !== null)

  const refLines = REF_LINES.map(r => ({ ...r, y: toY(r.value), inRange: r.value >= yMin && r.value <= yMax }))

  // Colored zone fills for SVG — clamp to chart bounds
  const cl = (v: number) => Math.max(0, Math.min(CHART_H, v))
  const zones = [
    { y1: 0,              y2: cl(toY(3.0)),          cls: 'rtz-deep' },
    { y1: cl(toY(3.0)),   y2: cl(toY(2.5)),          cls: 'rtz-ok'   },
    { y1: cl(toY(2.5)),   y2: cl(toY(2.0)),          cls: 'rtz-warn' },
    { y1: cl(toY(2.0)),   y2: CHART_H,               cls: 'rtz-low'  },
  ]

  if (dataValues.length === 0) return null

  const header = (
    <div className={embedded ? 'rtchart-inset-hdr' : 'phdr'}>
      <span>30-day ratio trend</span>
      {latestDay?.ratio != null && (
        <span className="rt-latest">{embedded ? '' : 'today: '}{latestDay.ratio.toFixed(2)}</span>
      )}
    </div>
  )

  const chartBody = (
    <div className="rtchart-body">
        <div className="rtchart-yaxis">
          <span>{yMax.toFixed(1)}</span>
          <span>{yMin.toFixed(1)}</span>
        </div>
        <div className="rtchart-plot" ref={plotRef}>
          <div
            className="tchart-hover-zone"
            onPointerMove={onPointerMove}
            onPointerLeave={onPointerLeave}
            onTouchMove={onTouchMove}
            onTouchEnd={onPointerLeave}
          />
          <svg viewBox={`0 0 ${CHART_W} ${CHART_H}`} preserveAspectRatio="none">
            {/* Zone fills */}
            {zones.map((z, i) => (
              <rect key={i} x="0" y={z.y1} width={CHART_W} height={Math.max(0, z.y2 - z.y1)} className={z.cls} />
            ))}
            {refLines.filter(r => r.inRange).map(r => (
              <g key={r.value}>
                <line x1={0} y1={r.y} x2={CHART_W} y2={r.y} className={`rtref-line ${r.cls}`} />
              </g>
            ))}
            {segments.map((s, i) => (
              <polyline key={i} points={s} className="rtline" />
            ))}
            {activePt && (
              <line x1={activePt.x} y1={0} x2={activePt.x} y2={CHART_H} className="tcrosshair" />
            )}
            {pts.map((pt, i) => pt && (
              <circle key={i} cx={pt.x} cy={pt.y} r="2.5" className="rtdot" opacity={activeIdx === i ? 1 : 0.45} />
            ))}
          </svg>
          {/* Reference line labels overlay (outside svg to avoid scaling) */}
          {refLines.filter(r => r.inRange).map(r => (
            <div
              key={r.value}
              className={`rtref-label ${r.cls}`}
              style={{ top: `${(r.y / CHART_H) * 100}%` }}
            >
              {r.label}
            </div>
          ))}
          {activePt && activeDay?.ratio != null && (
            <div className="tchart-tooltip" style={{ left: `${(activePt.x / CHART_W) * 100}%` }}>
              <span className="tt-date">{fmtDate(activeDay.date)}</span>
              <span className="tt-val rt">{activeDay.ratio.toFixed(2)}</span>
              <span className="tt-sub">{activeDay.fat.toFixed(0)}g ÷ ({activeDay.pro.toFixed(0)}+{activeDay.carb.toFixed(1)})</span>
            </div>
          )}
          <div className="tchart-xaxis">
            <span>{fmtDateShort(days[0].date)}</span>
            <span>{fmtDateShort(days[days.length - 1].date)}</span>
          </div>
        </div>
      </div>
  )

  return embedded
    ? <div className="rtchart-inset">{header}{chartBody}</div>
    : <div className="panel ratio-trend-panel">{header}{chartBody}</div>
}
