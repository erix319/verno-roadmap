import { useEffect, useState } from 'react'
import { UNI_DATE } from '../data'
import { fmtDate, MONTHS_SHORT, parseISO, type Plan, type Settings } from '../schedule'

interface LoadChartProps {
  plan: Plan
  settings: Settings
}

/** Стековая диаграмма: сколько часов в неделю получает каждый трек */
export function LoadChart({ plan, settings }: LoadChartProps) {
  const weeks = plan.load
  const [grown, setGrown] = useState(false)

  useEffect(() => {
    const frame = requestAnimationFrame(() => setGrown(true))
    return () => cancelAnimationFrame(frame)
  }, [])

  if (weeks.length === 0) return null

  const max = Math.max(settings.hoursBefore, settings.hoursAfter, ...weeks.map((week) => week.hours.A + week.hours.B))
  const uni = parseISO(UNI_DATE)
  const uniIndex = weeks.findIndex((week) => week.start >= uni)

  return (
    <section className="page-section" aria-labelledby="load-title">
      <div className="page-section__header">
        <h2 id="load-title">Нагрузка по неделям</h2>
        <p className="section-lead">
          Сколько часов получает каждый трек при текущих настройках. Наведи на столбик — точные числа; пунктир — возвращение в вуз, темп падает до{' '}
          {settings.hoursAfter} ч/нед.
        </p>
      </div>
      <div className="load-chart">
        <div className="load-chart__bars" role="img" aria-label={`Диаграмма нагрузки: ${weeks.length} недель, до ${Math.round(max)} часов в неделю`}>
          {weeks.map((week, index) => {
            const hoursA = Math.round(week.hours.A)
            const hoursB = Math.round(week.hours.B)
            const delay = `${Math.min(index * 20, 600)}ms`
            return (
              <div
                key={week.start.getTime()}
                className={`load-chart__week${index === uniIndex ? ' load-chart__week--uni' : ''}`}
                title={`неделя с ${fmtDate(week.start)} · A ${hoursA} ч · B ${hoursB} ч`}
              >
                <span
                  className="load-chart__seg load-chart__seg--b"
                  style={{ height: grown ? `${(week.hours.B / max) * 100}%` : '0%', transitionDelay: delay }}
                />
                <span
                  className="load-chart__seg load-chart__seg--a"
                  style={{ height: grown ? `${(week.hours.A / max) * 100}%` : '0%', transitionDelay: delay }}
                />
              </div>
            )
          })}
        </div>
        <div className="load-chart__months" aria-hidden="true">
          {weeks.map((week, index) => {
            const previous = weeks[index - 1]
            const showMonth = index === 0 || (previous && previous.start.getMonth() !== week.start.getMonth())
            return (
              <span key={week.start.getTime()} className="load-chart__month">
                {showMonth ? MONTHS_SHORT[week.start.getMonth()] : ''}
              </span>
            )
          })}
        </div>
        <p className="load-chart__legend">
          <span className="load-chart__key load-chart__key--a">трек A</span>
          <span className="load-chart__key load-chart__key--b">трек B</span>
          {uniIndex >= 0 && <span className="load-chart__key">⌇ пунктир — вуз, 9 фев</span>}
        </p>
      </div>
    </section>
  )
}
