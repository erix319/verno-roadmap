import { TRACKS } from '../data'
import { fmtDate, fmtDateYear, fmtHours, isDone, isScheduled, type DoneMap, type Settings, type SkippedMap, type TrackPlan } from '../schedule'
import { ROUTE_META } from '../router'

interface TrackCardProps {
  trackPlan: TrackPlan
  done: DoneMap
  skipped: SkippedMap
  settings: Settings
}

export function TrackCard({ trackPlan, done, skipped, settings }: TrackCardProps) {
  const track = TRACKS.find((candidate) => candidate.id === trackPlan.track)
  if (!track) return null

  const modifier = track.id === 'A' ? 'track-card--a' : 'track-card--b'
  const percent = trackPlan.total ? Math.round((trackPlan.done / trackPlan.total) * 100) : 0
  const share = track.id === 'A' ? settings.shareA : 100 - settings.shareA
  const hash = ROUTE_META[track.id].hash
  const next = trackPlan.items.find(
    (step) => step.item.kind !== 'milestone' && !isDone(step.item, done) && isScheduled(step.item, settings, skipped),
  )

  return (
    <article className={`track-card ${modifier}`}>
      <p className="eyebrow">Трек {track.id} · {share} % недели</p>
      <h3 className="track-card__title">
        <a href={hash}>{track.name}</a>
      </h3>
      <p className="track-card__goal">{track.goal}</p>
      <p className="track-card__meta">
        <span>
          {fmtHours(trackPlan.done)} / {fmtHours(trackPlan.total)} ч · {percent} %
        </span>
        <span>финиш · {fmtDateYear(trackPlan.finish)}</span>
      </p>
      <span className="progress-bar" role="progressbar" aria-label={`Прогресс трека ${track.id}`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent}>
        <span className={`progress-bar__fill progress-bar__fill--${track.id === 'A' ? 'track-a' : 'track-b'}`} style={{ width: `${percent}%` }} />
      </span>
      {next ? (
        <p className="track-card__next">
          <span className="track-card__next-label">следующий шаг</span>
          {next.item.title} · {fmtHours(next.item.hours)} ч{next.finish ? ` · к ${fmtDate(next.finish)}` : ''}
        </p>
      ) : (
        <p className="track-card__next">
          <span className="track-card__next-label">статус</span>
          Все шаги трека закрыты
        </p>
      )}
      <a className="button track-card__cta" href={hash}>
        Открыть трек {track.id}
      </a>
    </article>
  )
}
