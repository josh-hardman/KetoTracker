import { useState, useEffect } from 'react'
import { fmtDate } from '../tz'

interface HeaderProps {
  currentDate: string
  onRefresh: () => void
  loading: boolean
}

type Theme = 'system' | 'light' | 'dark'

function getStoredTheme(): Theme {
  return (localStorage.getItem('theme') as Theme) || 'system'
}

function applyTheme(theme: Theme) {
  const root = document.documentElement
  if (theme === 'system') {
    root.removeAttribute('data-theme')
  } else {
    root.setAttribute('data-theme', theme)
  }
  localStorage.setItem('theme', theme)
}

function getIcon(theme: Theme): string {
  if (theme === 'dark') return '☽'
  if (theme === 'light') return '☀'
  return '◐'
}

export default function Header({ currentDate, onRefresh, loading }: HeaderProps) {
  const [theme, setTheme] = useState<Theme>(getStoredTheme)

  useEffect(() => { applyTheme(theme) }, [theme])

  const cycle = () => {
    setTheme(t => t === 'system' ? 'light' : t === 'light' ? 'dark' : 'system')
  }

  return (
    <header>
      <div className="logo">keto<em>log</em></div>
      <div className="datebadge">{fmtDate(currentDate)}</div>
      <div className="hdr-actions">
        <button className="theme-btn" onClick={cycle} title={`Theme: ${theme}`}>
          {getIcon(theme)}
        </button>
        <button className="refresh-btn" onClick={onRefresh} disabled={loading}>
          ↻ {loading ? 'loading...' : 'refresh'}
        </button>
      </div>
    </header>
  )
}
