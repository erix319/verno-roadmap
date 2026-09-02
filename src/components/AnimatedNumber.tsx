import { useEffect, useRef, useState } from 'react'

interface AnimatedNumberProps {
  value: number
  format?: (value: number) => string
}

/** Число, доезжающее до значения за ~0.6 с; с prefers-reduced-motion — сразу */
export function AnimatedNumber({ value, format }: AnimatedNumberProps) {
  const [display, setDisplay] = useState(0)
  const previous = useRef(0)

  useEffect(() => {
    const from = previous.current
    previous.current = value
    if (from === value) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setDisplay(value)
      return
    }
    const startedAt = performance.now()
    const duration = 600
    let frame = 0
    const tick = (now: number) => {
      const progress = Math.min(1, (now - startedAt) / duration)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(from + (value - from) * eased)
      if (progress < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [value])

  const rounded = Math.round(display)
  return <>{format ? format(rounded) : String(rounded)}</>
}
