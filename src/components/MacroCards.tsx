interface Totals {
  cal: number
  fat: number
  pro: number
  carb: number
}

const T = { cal: 3100, fat: 275, pro: 135, carb: 20 }

export default function MacroCards({ totals }: { totals: Totals }) {
  const { cal, fat, pro, carb } = totals

  const cards = [
    { key: 'cal', label: 'Calories', value: Math.round(cal), unit: 'kcal', pct: cal / T.cal, target: '3,100 target' },
    { key: 'fat', label: 'Fat', value: Math.round(fat), unit: 'grams', pct: fat / T.fat, target: '275g target' },
    { key: 'pro', label: 'Protein', value: Math.round(pro), unit: 'grams', pct: pro / T.pro, target: '135g target' },
    { key: 'carb', label: 'Net carbs', value: carb.toFixed(1), unit: 'grams', pct: carb / T.carb, target: '20g limit' },
  ]

  return (
    <div className="macro-row">
      {cards.map(c => (
        <div key={c.key} className={`mcard ${c.key}`}>
          <div className="mlabel">{c.label}</div>
          <div className="mval">{c.value}</div>
          <div className="munit">{c.unit}</div>
          <div className="mbar-track">
            <div className="mbar" style={{ width: `${Math.min(100, c.pct * 100)}%` }} />
          </div>
          <div className="mpct">{Math.round(c.pct * 100)}% of {c.target}</div>
        </div>
      ))}
    </div>
  )
}
