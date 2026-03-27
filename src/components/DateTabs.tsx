import { todayMT, fmtDate } from '../tz'

interface DateNavProps {
  dates: string[]
  selectedDate: string
  onSelect: (date: string) => void
}

export default function DateTabs({ dates, selectedDate, onSelect }: DateNavProps) {
  const t = todayMT()
  const sorted = [...dates].sort((a, b) => a.localeCompare(b))
  const idx = sorted.indexOf(selectedDate)
  const hasPrev = idx > 0
  const hasNext = idx < sorted.length - 1
  const isToday = selectedDate === t

  return (
    <div className="date-nav">
      <button
        className="date-arrow"
        disabled={!hasPrev}
        onClick={() => hasPrev && onSelect(sorted[idx - 1])}
        aria-label="Previous day"
      >
        &#8249;
      </button>
      <button
        className={`date-current${isToday ? ' is-today' : ''}`}
        onClick={() => onSelect(t)}
        title="Jump to today"
      >
        {fmtDate(selectedDate)}
        {isToday && <span className="today-badge">today</span>}
      </button>
      <button
        className="date-arrow"
        disabled={!hasNext}
        onClick={() => hasNext && onSelect(sorted[idx + 1])}
        aria-label="Next day"
      >
        &#8250;
      </button>
    </div>
  )
}
