import { MACRO_TARGETS, MACRO_META, WIN_THRESHOLD, CARB_WIN_THRESHOLD } from '../constants'
import type { MacroKey, MacroTotals } from '../constants'

function isWin(key: MacroKey, pct: number): boolean {
  const t = key === 'carb' ? CARB_WIN_THRESHOLD : WIN_THRESHOLD
  return pct >= t.min && pct <= t.max
}

export default function MacroCards({ totals }: { totals: MacroTotals }) {
  return (
    <div className="macro-row">
      {MACRO_META.map(m => {
        const val = totals[m.key]
        const pct = val / MACRO_TARGETS[m.key]
        const win = isWin(m.key, pct)
        const display = m.key === 'carb' ? val.toFixed(1) : String(Math.round(val))

        return (
          <div key={m.key} className={`mcard ${m.key}${win ? ' mcard-win' : ''}`}>
            <div className="mlabel">
              {m.label}
              {win && <span className="win-check">✓</span>}
            </div>
            <div className="mval">{display}</div>
            <div className="munit">{m.unit}</div>
            <div className="mbar-track">
              <div className="mbar" style={{ width: `${Math.min(100, pct * 100)}%` }} />
            </div>
            <div className="mpct">{Math.round(pct * 100)}% of {m.targetLabel}</div>
          </div>
        )
      })}
    </div>
  )
}
