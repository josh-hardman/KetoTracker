interface DateTabsProps {
  dates: string[]
  selectedDate: string
  onSelect: (date: string) => void
}

function today() {
  return new Date().toISOString().split('T')[0]
}

function fmt(d: string) {
  return new Date(d + 'T12:00:00').toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric'
  })
}

export default function DateTabs({ dates, selectedDate, onSelect }: DateTabsProps) {
  const t = today()
  return (
    <div className="date-tabs">
      {dates.map(d => (
        <button
          key={d}
          className={`tab${d === selectedDate ? ' active' : ''}`}
          onClick={() => onSelect(d)}
        >
          {d === t ? 'today' : fmt(d)}
        </button>
      ))}
    </div>
  )
}
