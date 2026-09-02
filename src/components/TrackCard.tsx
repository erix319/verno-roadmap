import { TRACKS } from '../data'
import { fmtDate, fmtDateYear, fmtHours, isDone, isScheduled, type DoneMap, type Settings, type SkippedMap, type TrackPlan } from '../schedule'
import { ROUTE_META } from '../router'
import { ProgressRing } from './ProgressRing'

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
      <div className="track-card__head">
        <div className="track-card__heading">
          <p className="eyebrow">Трек {track.id} · {share} % недели</p>
          <h3 className="track-card__title">
            <a href={hash}>{track.name}</a>
          </h3>
          <p className="track-card__goal">{track.goal}</p>
        </div>
        <ProgressRing
          percent={percent}
          color={track.id === 'A' ? 'var(--color-track-a)' : 'var(--color-track-b)'}
          label={`Прогресс трека ${track.id}: ${percent} %`}
        />
      </div>
      <p className="track-card__meta">
        <span>
          {fmtHours(trackPlan.done)} / {fmtHours(trackPlan.total)} ч · {percent} %
        </span>
        <span>финиш · {fmtDateYear(trackPlan.finish)}</span>
      </p>
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
