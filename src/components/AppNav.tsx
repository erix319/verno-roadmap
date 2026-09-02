import type { TrackId } from '../data'
import type { Plan } from '../schedule'
import { ROUTE_META, type Route } from '../router'

interface AppNavProps {
  route: Route
  plan: Plan
  /** Сколько напоминаний наступило и не скрыто */
  dueReminders: number
  onBellClick: () => void
}

export function AppNav({ route, plan, dueReminders, onBellClick }: AppNavProps) {
  const percentOf = (trackId: TrackId) => {
    const track = plan.tracks[trackId]
    return track.total ? Math.round((track.done / track.total) * 100) : 0
  }

  const links: { route: Route; label: string; suffix?: string; percent?: number }[] = [
    { route: 'home', label: 'Обзор' },
    { route: 'A', label: 'Трек A', suffix: '· фриланс', percent: percentOf('A') },
    { route: 'B', label: 'Трек B', suffix: '· fullstack', percent: percentOf('B') },
  ]

  return (
    <nav className="app-nav" aria-label="Разделы плана">
      <ul className="app-nav__list">
        {links.map((link) => (
          <li key={link.route}>
            <a className="app-nav__link" aria-current={route === link.route ? 'page' : undefined} href={ROUTE_META[link.route].hash}>
              {link.label}
              {link.suffix && <span className="app-nav__suffix">{link.suffix}</span>}
              {link.percent !== undefined && <span className="app-nav__percent">{link.percent} %</span>}
            </a>
          </li>
        ))}
        <li className="app-nav__bell-item">
          <button
            type="button"
            className="app-nav__link app-nav__bell"
            onClick={onBellClick}
            aria-label={dueReminders > 0 ? `Напоминания: ${dueReminders} наступило` : 'Напоминания'}
          >
            <span aria-hidden="true">🔔</span>
            {dueReminders > 0 && <span className="app-nav__bell-count">{dueReminders}</span>}
          </button>
        </li>
      </ul>
    </nav>
  )
}
