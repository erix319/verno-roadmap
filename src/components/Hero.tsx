import { fmtDateYear, fmtHours, type Plan } from '../schedule'
import { AnimatedNumber } from './AnimatedNumber'

interface HeroProps {
  plan: Plan
}

export function Hero({ plan }: HeroProps) {
  const total = plan.tracks.A.total + plan.tracks.B.total
  const done = plan.tracks.A.done + plan.tracks.B.done
  const percent = total ? Math.round((done / total) * 100) : 0

  const stats = [
    { value: plan.tracks.A.remaining, format: fmtHours, unit: 'ч', label: `осталось в треке A · финиш ${fmtDateYear(plan.tracks.A.finish)}` },
    { value: plan.tracks.B.remaining, format: fmtHours, unit: 'ч', label: `осталось в треке B · финиш ${fmtDateYear(plan.tracks.B.finish)}` },
    { value: plan.weeks, format: undefined, unit: 'нед', label: 'до закрытия обоих треков при текущих настройках' },
    { value: percent, format: undefined, unit: '%', label: `отмечено · ${fmtHours(done)} из ${fmtHours(total)} ч` },
  ]

  return (
    <header className="hero">
      <p className="eyebrow">Учебный план · два трека · verno-dev.com</p>
      <h1>Маршрут verno/dev</h1>
      <p className="hero__lead">
        Два независимых трека: <strong>A — фриланс как можно быстрее</strong> (всё, что продаётся по стеку сайта) и{' '}
        <strong>B — рост как программиста</strong> (fullstack-путь из чек-листов Google AI и DeepSeek). Здесь, на обзоре, —
        рекомендация с чего начать, настройки темпа и календарь; списки курсов с галочками — на страницах треков.
      </p>
      <ul className="hero__stats">
        {stats.map((stat) => (
          <li className="stat-card" key={stat.label}>
            <p className="stat-card__value">
              <AnimatedNumber value={stat.value} format={stat.format} />
              <span className="stat-card__unit">{stat.unit}</span>
            </p>
            <p className="stat-card__label">{stat.label}</p>
          </li>
        ))}
      </ul>
      <span className="progress-bar" role="progressbar" aria-label="Отмечено часов" aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent}>
        <span className="progress-bar__fill" style={{ width: `${percent}%` }} />
      </span>
    </header>
  )
}
