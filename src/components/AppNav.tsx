import type { TrackId } from '../data'
import type { Plan } from '../schedule'
import { ROUTE_META, type Route } from '../router'

interface AppNavProps {
  route: Route
  plan: Plan
}

export function AppNav({ route, plan }: AppNavProps) {
  const percentOf = (trackId: TrackId) => {
    const track = plan.tracks[trackId]
    return track.total ? Math.round((track.done / track.total) * 100) : 0
  }

  const links: { route: Route; label: string; percent?: number }[] = [
    { route: 'home', label: 'Обзор' },
    { route: 'A', label: 'Трек A · фриланс', percent: percentOf('A') },
    { route: 'B', label: 'Трек B · fullstack', percent: percentOf('B') },
  ]

  return (
    <nav className="app-nav" aria-label="Разделы плана">
      <ul className="app-nav__list">
        {links.map((link) => (
          <li key={link.route}>
            <a className="app-nav__link" aria-current={route === link.route ? 'page' : undefined} href={ROUTE_META[link.route].hash}>
              {link.label}
              {link.percent !== undefined && <span className="app-nav__percent">{link.percent} %</span>}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
