interface HeaderProps {
  currentDate: string
  onRefresh: () => void
  loading: boolean
}

function fmt(d: string) {
  return new Date(d + 'T12:00:00').toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric'
  })
}

export default function Header({ currentDate, onRefresh, loading }: HeaderProps) {
  return (
    <header>
      <div className="logo">keto<em>log</em></div>
      <div className="datebadge">{fmt(currentDate)}</div>
      <button className="refresh-btn" onClick={onRefresh} disabled={loading}>
        ↻ {loading ? 'loading...' : 'refresh'}
      </button>
    </header>
  )
}
