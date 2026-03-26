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

export default function DailyLogTable({ logs, selectedDate }: DailyLogTableProps) {
  const t = today()
  const title = selectedDate === t ? 'Logged today' : `Logged · ${fmt(selectedDate)}`

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
              return (
                <tr key={i}>
                  <td>
                    {f.name}
                    {s !== 1 && <span className="sbadge">×{s}</span>}
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
