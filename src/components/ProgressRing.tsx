import { useEffect, useState } from 'react'

interface ProgressRingProps {
  percent: number
  color: string
  label: string
  size?: number
}

/** Кольцевая диаграмма прогресса; дуга дорастает до значения CSS-переходом */
export function ProgressRing({ percent, color, label, size = 56 }: ProgressRingProps) {
  const strokeWidth = 6
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const [offset, setOffset] = useState(circumference)

  useEffect(() => {
    const frame = requestAnimationFrame(() => setOffset(circumference * (1 - Math.min(100, Math.max(0, percent)) / 100)))
    return () => cancelAnimationFrame(frame)
  }, [percent, circumference])

  const center = size / 2
  return (
    <svg className="progress-ring" width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={label}>
      <circle cx={center} cy={center} r={radius} fill="none" stroke="var(--color-border)" strokeWidth={strokeWidth} />
      <circle
        className="progress-ring__fill"
        cx={center}
        cy={center}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        transform={`rotate(-90 ${center} ${center})`}
      />
      <text className="progress-ring__text" x={center} y={center} textAnchor="middle" dominantBaseline="central">
        {percent}%
      </text>
    </svg>
  )
}
