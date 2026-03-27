import { fmtDate } from '../tz'

interface HeaderProps {
  currentDate: string
  onRefresh: () => void
  loading: boolean
}

export default function Header({ currentDate, onRefresh, loading }: HeaderProps) {
  return (
    <header>
      <div className="logo">keto<em>log</em></div>
      <div className="datebadge">{fmtDate(currentDate)}</div>
      <button className="refresh-btn" onClick={onRefresh} disabled={loading}>
        ↻ {loading ? 'loading...' : 'refresh'}
      </button>
    </header>
  )
}
