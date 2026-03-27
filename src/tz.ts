import type { DailyLog } from './types'
import type { MacroTotals } from './constants'

export const TZ = 'America/Denver'

/** Current date in Mountain time as YYYY-MM-DD */
export function todayMT(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: TZ })
}

/** Convert a UTC ISO timestamp to Mountain time date (YYYY-MM-DD) */
export function toMTDate(utc: string): string {
  return new Date(utc).toLocaleDateString('en-CA', { timeZone: TZ })
}

/** Convert a UTC ISO timestamp to Mountain time HH:MM */
export function toMTTime(utc: string): string {
  return new Date(utc).toLocaleTimeString('en-US', {
    timeZone: TZ,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}

/** Format YYYY-MM-DD → "Fri, Mar 27" */
export function fmtDate(d: string): string {
  return new Date(d + 'T12:00:00').toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric',
  })
}

/** Format YYYY-MM-DD → "Mar 27" (short, no weekday) */
export function fmtDateShort(d: string): string {
  return new Date(d + 'T12:00:00').toLocaleDateString('en-US', {
    month: 'short', day: 'numeric',
  })
}

/** Format a macro value for display */
export function fmtMacroVal(key: string, v: number): string {
  return key === 'carb' ? v.toFixed(1) : String(Math.round(v))
}

/** Sum macro totals from an array of daily logs */
export function sumMacros(logs: DailyLog[]): MacroTotals {
  return logs.reduce((a, l) => {
    const s = l.servings
    const f = l.foods
    a.cal += f.calories * s
    a.fat += f.fat * s
    a.pro += f.protein * s
    a.carb += f.net_carbs * s
    return a
  }, { cal: 0, fat: 0, pro: 0, carb: 0 })
}

/** Get display time for a log entry (Mountain time from created_at, fallback to logged_at) */
export function fmtLogTime(log: DailyLog): string {
  if (log.created_at) return toMTTime(log.created_at)
  if (log.logged_at) return log.logged_at.slice(0, 5)
  return '—'
}
