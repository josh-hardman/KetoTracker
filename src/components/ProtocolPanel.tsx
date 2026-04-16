import type { MacroTotals } from '../constants'
import type { DailyLog } from '../types'
import RatioPanel from './RatioPanel'
import RatioTrendChart from './RatioTrendChart'

interface Props {
  totals: MacroTotals
  logs: DailyLog[]
}

export default function ProtocolPanel({ totals, logs }: Props) {
  return (
    <div className="panel">
      <div className="phdr">Protocol targets</div>
      <div className="proto-targets">
        <div className="trow"><span className="tk">Fat</span><span>270–280g</span></div>
        <div className="trow"><span className="tk">Protein</span><span>≤ 135g</span></div>
        <div className="trow"><span className="tk">Net carbs</span><span>≤ 20g</span></div>
        <div className="trow"><span className="tk">Calories</span><span>3,000–3,200 kcal</span></div>
        <div className="trow"><span className="tk">Fat:(P+C) ratio</span><span>≥ 3:1 · 4:1 optimal</span></div>
      </div>
      <div className="proto-divider" />
      <div className="proto-targets">
        <div className="trow"><span className="tk">GKI</span><span>&lt; 6 therapeutic · &lt; 3 deep</span></div>
        <div className="trow"><span className="tk">Ketones</span><span>1.5–3.5 mmol/L</span></div>
      </div>
      <div className="proto-divider" />
      <RatioPanel totals={totals} embedded />
      <div className="proto-divider" />
      <RatioTrendChart logs={logs} embedded />
    </div>
  )
}
