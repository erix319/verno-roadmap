import { useEffect, useState } from 'react'
import type { TrackId } from './data'

export type Route = 'home' | TrackId

export const ROUTE_META: Record<Route, { hash: string; title: string }> = {
  home: { hash: '#/', title: 'Маршрут verno/dev' },
  A: { hash: '#/track-a', title: 'Трек A — фриланс · Маршрут verno/dev' },
  B: { hash: '#/track-b', title: 'Трек B — fullstack · Маршрут verno/dev' },
}

function parseHash(hash: string): Route {
  if (hash.startsWith(ROUTE_META.A.hash)) return 'A'
  if (hash.startsWith(ROUTE_META.B.hash)) return 'B'
  return 'home'
}

export function useRoute(): Route {
  const [route, setRoute] = useState<Route>(() => parseHash(window.location.hash))

  useEffect(() => {
    const onHashChange = () => setRoute(parseHash(window.location.hash))
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  return route
}
