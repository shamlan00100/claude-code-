interface Point {
  date: string
  value: number
}

export function TrendChart({
  points,
  unit,
  accent = 'primary',
}: {
  points: Point[]
  unit: string
  accent?: 'primary' | 'accent'
}) {
  const width = 320
  const height = 120
  const padY = 16
  const values = points.map((p) => p.value)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const span = max - min || 1

  const stepX = width / (points.length - 1)
  const coords = points.map((p, i) => {
    const x = i * stepX
    const y = padY + (1 - (p.value - min) / span) * (height - padY * 2)
    return { x, y, ...p }
  })

  const linePath = coords.map((c, i) => `${i === 0 ? 'M' : 'L'} ${c.x.toFixed(1)} ${c.y.toFixed(1)}`).join(' ')
  const areaPath = `${linePath} L ${coords[coords.length - 1].x} ${height} L 0 ${height} Z`

  const colorVar = accent === 'primary' ? '--primary' : '--accent'
  const last = coords[coords.length - 1]
  const first = coords[0]
  const delta = +(last.value - first.value).toFixed(1)

  return (
    <div>
      <div className="mb-1 flex items-end justify-between">
        <p className="tabular font-display text-display-sm">
          {last.value}
          <span className="ms-1 text-heading-sm font-semibold text-ink-soft">{unit}</span>
        </p>
        <p className={`text-body-sm font-semibold ${delta <= 0 ? 'text-success' : 'text-ink-soft'}`}>
          {delta > 0 ? '+' : ''}
          {delta}
          {unit} since {first.date}
        </p>
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full overflow-visible" preserveAspectRatio="none" role="img" aria-label={`Trend from ${first.value}${unit} to ${last.value}${unit}`}>
        <path d={areaPath} fill={`hsl(var(${colorVar}) / 0.10)`} stroke="none" />
        <path d={linePath} fill="none" stroke={`hsl(var(${colorVar}))`} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
        {coords.map((c, i) => (
          <circle
            key={i}
            cx={c.x}
            cy={c.y}
            r={i === coords.length - 1 ? 4.5 : 2.5}
            fill={i === coords.length - 1 ? `hsl(var(${colorVar}))` : 'hsl(var(--surface))'}
            stroke={`hsl(var(${colorVar}))`}
            strokeWidth={2}
          />
        ))}
      </svg>
      <div className="mt-1 flex justify-between text-body-sm text-ink-faint">
        <span>{first.date}</span>
        <span>{last.date}</span>
      </div>
    </div>
  )
}
