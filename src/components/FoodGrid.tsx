import type { Food } from '../types'

export default function FoodGrid({ foods }: { foods: Food[] }) {
  return (
    <div className="panel" style={{ marginBottom: 24 }}>
      <div className="phdr">All foods · {foods.length} items</div>
      {foods.length === 0 ? (
        <div className="empty">No foods yet.</div>
      ) : (
        <div className="foods-grid">
          {foods.map(f => (
            <div key={f.id} className="fcard">
              <div className="fname" title={f.name}>{f.name}</div>
              <div className="funit">{f.unit}</div>
              <div className="pills">
                <span className="pill p-cal">{Math.round(f.calories)} cal</span>
                <span className="pill p-fat">{f.fat}g fat</span>
                <span className="pill p-pro">{f.protein}g pro</span>
                <span className="pill p-carb">{f.net_carbs}g carb</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
