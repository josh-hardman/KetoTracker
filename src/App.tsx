import { useState, useEffect, useCallback } from 'react'
import { supabase } from './supabase'
import type { DailyLog } from './types'
import type { Food } from './types'
import Header from './components/Header'
import DateTabs from './components/DateTabs'
import MacroCards from './components/MacroCards'
import ProtocolPanel from './components/ProtocolPanel'
import DailyLogTable from './components/DailyLogTable'
import FoodGrid from './components/FoodGrid'
import TrendCharts from './components/TrendCharts'
import { todayMT, toMTDate, sumMacros } from './tz'
import './App.css'

const FOOD_FIELDS = 'name,fat,protein,net_carbs,calories,category,therapeutic_tier,therapeutic_note,therapeutic_tags,sensitivity_level'

export default function App() {
  const [foods, setFoods] = useState<Food[]>([])
  const [logs, setLogs] = useState<DailyLog[]>([])
  const [selectedDate, setSelectedDate] = useState(todayMT())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadAll = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const [{ data: foodsData, error: fe }, { data: logsData, error: le }] = await Promise.all([
        supabase.from('foods').select(`id,${FOOD_FIELDS},unit`).order('name'),
        supabase.from('daily_logs').select(`date,servings,logged_at,created_at,foods(${FOOD_FIELDS})`).order('created_at', { ascending: false })
      ])

      if (fe) throw fe
      if (le) throw le

      setFoods(foodsData || [])
      // Remap dates to Mountain time so evening logs don't land on the next UTC day
      const mapped = (logsData as unknown as DailyLog[] || []).map(l => ({
        ...l,
        date: l.created_at ? toMTDate(l.created_at) : l.date,
      }))
      setLogs(mapped)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : JSON.stringify(err)
      setError(message)
    }

    setLoading(false)
  }, [])

  useEffect(() => { loadAll() }, [loadAll])

  // Realtime: re-fetch whenever foods or daily_logs change in Supabase
  useEffect(() => {
    const channel = supabase
      .channel('db-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'foods' }, () => loadAll())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'daily_logs' }, () => loadAll())
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [loadAll])

  // Derived state
  const filteredLogs = logs.filter(l => l.date === selectedDate)
  const totals = sumMacros(filteredLogs)

  const dates = [...new Set(logs.map(l => l.date))].sort((a, b) => b.localeCompare(a))
  if (!dates.includes(todayMT())) dates.unshift(todayMT())

  return (
    <>
      <Header currentDate={todayMT()} onRefresh={loadAll} loading={loading} />
      <div className="main">
        <DateTabs dates={dates} selectedDate={selectedDate} onSelect={setSelectedDate} />
        <div className="slabel">macros</div>
        {error && <div className="err">Error: {error}</div>}
        <MacroCards totals={totals} />
        <div className="slabel">14-day trend</div>
        <TrendCharts logs={logs} />
        <div className="two-col">
          <ProtocolPanel />
          <DailyLogTable logs={filteredLogs} selectedDate={selectedDate} />
        </div>
        <div className="slabel">Food database</div>
        <FoodGrid foods={foods} />
      </div>
    </>
  )
}
