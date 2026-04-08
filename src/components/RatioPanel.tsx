import type { MacroTotals } from '../constants'

const THRESHOLDS = [
  { min: 3.0,        label: 'Deep Therapeutic', cls: 'ratio-deep', check: true  },
  { min: 2.5,        label: 'Therapeutic',      cls: 'ratio-ok',   check: true  },
  { min: 2.0,        label: 'Borderline',       cls: 'ratio-warn', check: false },
  { min: -Infinity,  label: 'Below Threshold',  cls: 'ratio-low',  check: false },
]

function getRatioStatus(ratio: number) {
  return THRESHOLDS.find(t => ratio >= t.min) ?? THRESHOLDS[THRESHOLDS.length - 1]
}

const SCALE_MAX = 4.0

// Fixed zone widths as % of 0–4.0 scale
const ZONES = [
  { cls: 'rz-low',  pct: (2.0 / SCALE_MAX) * 100 },  // 0 – 2.0
  { cls: 'rz-warn', pct: (0.5 / SCALE_MAX) * 100 },  // 2.0 – 2.5
  { cls: 'rz-ok',   pct: (0.5 / SCALE_MAX) * 100 },  // 2.5 – 3.0
  { cls: 'rz-deep', pct: (1.0 / SCALE_MAX) * 100 },  // 3.0 – 4.0
]

// Label positions on the scale
const SCALE_LABELS = [
  { value: 2.0, top: '2.0',   sub: ''        },
  { value: 2.5, top: '2.5:1', sub: 'therap.' },
  { value: 3.0, top: '3.0:1', sub: 'deep'    },
]

export default function RatioPanel({ totals, embedded = false }: { totals: MacroTotals; embedded?: boolean }) {
  const denominator = totals.pro + totals.carb
  const ratio = denominator > 0 ? totals.fat / denominator : 0
  const status = getRatioStatus(ratio)

  const target25 = 2.5 * denominator
  const gap = Math.max(0, target25 - totals.fat)
  const hasGap = denominator > 0 && gap > 0.5

  const markerPct = denominator > 0 ? Math.min(ratio / SCALE_MAX, 1) * 100 : null

  return (
    <div className={embedded ? `rp-embedded ${status.cls}` : `ratio-panel ${status.cls}`}>
      <div className="rp-row">
        <div className="rp-meta">
          <div className="rp-title">Therapeutic Ratio</div>
          <div className="rp-sub">fat ÷ (protein + net carbs)</div>
        </div>
        <div className="rp-center">
          <div className="rp-num">
            {denominator > 0 ? ratio.toFixed(2) : '—'}
            {status.check && <span className="rp-check">✓</span>}
          </div>
          <div className="rp-status">{status.label}</div>
        </div>
        <div className="rp-gap">
          {denominator === 0 ? (
            <div className="rp-gap-empty">no data logged</div>
          ) : hasGap ? (
            <>
              <div className="rp-gap-num">+{Math.ceil(gap)}g fat</div>
              <div className="rp-gap-label">to reach 2.5:1</div>
            </>
          ) : (
            <>
              <div className="rp-gap-num rp-on-target">above 2.5:1</div>
              <div className="rp-gap-label">gap closed</div>
            </>
          )}
        </div>
      </div>

      {/* Goal scale bar */}
      <div className="rp-scale">
        <div className="rp-scale-track">
          {ZONES.map((z, i) => (
            <div key={i} className={`rp-zone ${z.cls}`} style={{ width: `${z.pct}%` }} />
          ))}
          {markerPct !== null && (
            <div className="rp-marker" style={{ left: `${markerPct}%` }} />
          )}
        </div>
        <div className="rp-scale-labels">
          {SCALE_LABELS.map(l => (
            <span key={l.value} style={{ left: `${(l.value / SCALE_MAX) * 100}%` }}>
              {l.top}{l.sub && <><br /><em>{l.sub}</em></>}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
