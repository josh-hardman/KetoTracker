import { useState, useEffect, useCallback } from 'react'
import { supabase } from './supabase'
import type { Food, DailyLog } from './types'
import Header from './components/Header'
import DateTabs from './components/DateTabs'
import MacroCards from './components/MacroCards'
import ProtocolPanel from './components/ProtocolPanel'
import DailyLogTable from './components/DailyLogTable'
import FoodGrid from './components/FoodGrid'
import './App.css'

function today() {
  return new Date().toISOString().split('T')[0]
}

export default function App() {
  const [foods, setFoods] = useState<Food[]>([])
  const [logs, setLogs] = useState<DailyLog[]>([])
  const [selectedDate, setSelectedDate] = useState(today())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadAll = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const [{ data: foodsData, error: fe }, { data: logsData, error: le }] = await Promise.all([
        supabase.from('foods').select('id,name,unit,fat,protein,net_carbs,calories').order('name'),
        supabase.from('daily_logs').select('date,servings,logged_at,foods(name,fat,protein,net_carbs,calories)').order('date', { ascending: false }).order('logged_at', { ascending: true })
      ])

      if (fe) throw fe
      if (le) throw le

      setFoods(foodsData || [])
      setLogs(logsData as unknown as DailyLog[] || [])
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

  const totals = filteredLogs.reduce((a, l) => {
    const s = l.servings
    const f = l.foods
    a.cal += f.calories * s
    a.fat += f.fat * s
    a.pro += f.protein * s
    a.carb += f.net_carbs * s
    return a
  }, { cal: 0, fat: 0, pro: 0, carb: 0 })

  const dates = [...new Set(logs.map(l => l.date))].sort((a, b) => b.localeCompare(a))
  if (!dates.includes(today())) dates.unshift(today())
  const dateTabs = dates.slice(0, 7)

  return (
    <>
      <Header currentDate={today()} onRefresh={loadAll} loading={loading} />
      <div className="main">
        <DateTabs dates={dateTabs} selectedDate={selectedDate} onSelect={setSelectedDate} />
        <div className="slabel">macros</div>
        {error && <div className="err">Error: {error}</div>}
        <MacroCards totals={totals} />
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
