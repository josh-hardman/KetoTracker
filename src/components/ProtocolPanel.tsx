export default function ProtocolPanel() {
  return (
    <div className="panel">
      <div className="phdr">Protocol targets</div>
      <div style={{ padding: 14 }}>
        <div className="trow"><span className="tk">Calories</span><span>3,000–3,200 kcal</span></div>
        <div className="trow"><span className="tk">Fat</span><span>270–280g</span></div>
        <div className="trow"><span className="tk">Protein</span><span>≤ 135g</span></div>
        <div className="trow"><span className="tk">Net carbs</span><span>≤ 20g</span></div>
        <div className="divider" />
        <div className="trow"><span className="tk">GKI target</span><span>&lt; 6 (therapeutic)</span></div>
        <div className="trow"><span className="tk">Fasting window</span><span>16–17 hrs</span></div>
        <div className="trow"><span className="tk">Meal 1</span><span>~9am · ~1,400 kcal</span></div>
        <div className="trow"><span className="tk">Meal 2</span><span>~3:30pm · ~1,600 kcal</span></div>
      </div>
    </div>
  )
}
