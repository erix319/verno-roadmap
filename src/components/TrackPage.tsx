import { TRACKS, type TrackId } from '../data'
import type { DoneMap, Plan, Settings, SkippedMap } from '../schedule'
import { ROUTE_META } from '../router'
import { TrackSection } from './TrackSection'

interface TrackPageProps {
  trackId: TrackId
  plan: Plan
  done: DoneMap
  skipped: SkippedMap
  settings: Settings
  onToggle: (id: string) => void
  onSkip: (id: string) => void
}

export function TrackPage({ trackId, plan, done, skipped, settings, onToggle, onSkip }: TrackPageProps) {
  const otherId: TrackId = trackId === 'A' ? 'B' : 'A'
  const other = TRACKS.find((candidate) => candidate.id === otherId)
  const share = trackId === 'A' ? settings.shareA : 100 - settings.shareA

  return (
    <main className="track-page">
      <p className="track-page__context">
        Этому треку — <strong>{share} % недели</strong> при {settings.hoursBefore} ч/нед (после 9 фев 2027 — {settings.hoursAfter} ч/нед). Кнопка «отложить» убирает шаг из
        расписания — даты сокращаются, «вернуть в план» возвращает. <a href={ROUTE_META.home.hash}>Темп и стартовый трек — на обзоре</a>.
      </p>
      <TrackSection trackPlan={plan.tracks[trackId]} done={done} settings={settings} skipped={skipped} onToggle={onToggle} onSkip={onSkip} headingLevel={1} />
      {other && (
        <p className="track-page__other">
          Второй трек: <a href={ROUTE_META[otherId].hash}>Трек {otherId} — {other.name}</a>
        </p>
      )}
    </main>
  )
}
