import { useState, useMemo } from 'react'
import type { Food } from '../types'
import { CAT_COLORS, foodRatio } from '../constants'

export default function FoodGrid({ foods }: { foods: Food[] }) {
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    if (!query.trim()) return foods
    const q = query.toLowerCase()
    return foods.filter(f => f.name.toLowerCase().includes(q))
  }, [foods, query])

  return (
    <div className="panel" style={{ marginBottom: 24 }}>
      <div className="phdr">Food database · {filtered.length} items</div>
      <div style={{ padding: '8px 14px 0' }}>
        <input
          type="text"
          className="food-search"
          placeholder="Search foods…"
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
      </div>
      {filtered.length === 0 ? (
        <div className="empty">{query ? 'No matches.' : 'No foods yet.'}</div>
      ) : (
        <div className="foods-grid">
          {filtered.map(f => {
            const { display, cls } = foodRatio(f.fat, f.protein, f.net_carbs)
            return (
              <div key={f.id} className="fcard">
                <div className="fcard-top">
                  {f.category && CAT_COLORS[f.category] ? (
                    <span
                      className="cat-dot"
                      style={{ background: CAT_COLORS[f.category] }}
                      title={f.category}
                    />
                  ) : null}
                  <div className="fname" title={f.name}>{f.name}</div>
                  <span className={`fratio ${cls}${display === '∞' ? ' fratio-inf' : ''}`}>{display}</span>
                </div>
                <div className="funit">{f.unit}</div>
                <div className="pills">
                  <span className="pill p-cal">{Math.round(f.calories)} cal</span>
                  <span className="pill p-fat">{f.fat}g fat</span>
                  <span className="pill p-pro">{f.protein}g pro</span>
                  <span className="pill p-carb">{f.net_carbs}g carb</span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
