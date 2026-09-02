import { HABITS, TRACKS, type Item } from '../data'
import { fmtDate, fmtDateYear, fmtHours, isDone, isScheduled, toISO, type DoneMap, type ItemPlan, type Settings, type TrackPlan } from '../schedule'

interface TrackSectionProps {
  trackPlan: TrackPlan
  done: DoneMap
  settings: Settings
  onToggle: (id: string) => void
}

function formatNumber(value: number): string {
  return String(value).replace('.', ',')
}

export function TrackSection({ trackPlan, done, settings, onToggle }: TrackSectionProps) {
  const track = TRACKS.find((candidate) => candidate.id === trackPlan.track)
  if (!track) return null

  const modifier = track.id === 'A' ? 'track--a' : 'track--b'
  const percent = trackPlan.total ? Math.round((trackPlan.done / trackPlan.total) * 100) : 0
  const habits = HABITS.filter((habit) => habit.track === track.id)
  const titleId = `track-${track.id.toLowerCase()}-title`

  return (
    <section className={`track ${modifier}`} aria-labelledby={titleId}>
      <header className="track__header">
        <p className="eyebrow">Трек {track.id}</p>
        <h2 id={titleId}>{track.name}</h2>
        <p className="track__goal">{track.goal}</p>
        <p className="track__meta">
          <span>
            {fmtHours(trackPlan.done)} / {fmtHours(trackPlan.total)} ч · {percent} %
          </span>
          <span>финиш · {fmtDateYear(trackPlan.finish)}</span>
        </p>
        <span className="progress-bar" role="progressbar" aria-label={`Прогресс трека ${track.id}`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent}>
          <span className={`progress-bar__fill progress-bar__fill--${track.id === 'A' ? 'track-a' : 'track-b'}`} style={{ width: `${percent}%` }} />
        </span>
      </header>

      <ol className="track__steps">
        {trackPlan.items.map((step) =>
          step.item.kind === 'milestone' ? (
            <MilestoneItem key={step.item.id} step={step} checked={isDone(step.item, done)} />
          ) : (
            <StepItem key={step.item.id} step={step} checked={isDone(step.item, done)} scheduled={isScheduled(step.item, settings)} onToggle={onToggle} />
          ),
        )}
      </ol>

      <div className="habits">
        <p className="eyebrow">Привычки трека — не в часах, а каждый день</p>
        <ul className="habit-list">
          {habits.map((habit) => (
            <li className="habit-list__item" key={habit.text}>
              <span className="habit-list__time">{habit.time}</span>
              <span>{habit.text}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

interface MilestoneItemProps {
  step: ItemPlan
  checked: boolean
}

function MilestoneItem({ step, checked }: MilestoneItemProps) {
  const dateLabel = checked ? 'готово' : step.finish ? `≈ ${fmtDate(step.finish)}` : '—'
  return (
    <li className="milestone">
      {step.finish && !checked ? (
        <time className="milestone__date" dateTime={toISO(step.finish)}>{dateLabel}</time>
      ) : (
        <span className="milestone__date">{dateLabel}</span>
      )}
      <p className="milestone__title">{step.item.title}</p>
      <p className="milestone__note">{step.item.note}</p>
    </li>
  )
}

interface StepItemProps {
  step: ItemPlan
  checked: boolean
  scheduled: boolean
  onToggle: (id: string) => void
}

function StepItem({ step, checked, scheduled, onToggle }: StepItemProps) {
  const item: Item = step.item
  const locked = Boolean(item.done)
  const parked = !scheduled && !checked
  const noteId = `${item.id}-note`
  const className = ['step', checked ? 'step--done' : '', parked ? 'step--parked' : ''].filter(Boolean).join(' ')

  return (
    <li className={className}>
      <input
        className="step__checkbox"
        type="checkbox"
        id={item.id}
        checked={checked}
        disabled={locked}
        aria-describedby={noteId}
        onChange={() => onToggle(item.id)}
      />
      <label className="step__title" htmlFor={item.id}>
        {item.title}
        {item.meta && <span className="step__meta"> · {item.meta}</span>}
        {item.kind === 'free' && <span className="badge badge--free">бесплатно</span>}
        {item.kind === 'practice' && <span className="badge badge--practice">практика</span>}
        {item.optional && <span className="badge badge--optional">по желанию</span>}
      </label>
      <p className="step__note" id={noteId}>{item.note}</p>
      <p className="step__hours">
        <span className="step__hours-value">{locked ? 'готово' : checked ? 'отмечено' : `${fmtHours(item.hours)} ч`}</span>
        {!locked && !checked && (
          <>
            {item.video ? `${formatNumber(item.video)} ч видео${item.factor ? ` · ×${formatNumber(item.factor)}` : ''}` : 'вне Udemy'}
            <br />
            {parked ? 'не в расписании' : step.finish ? `к ${fmtDate(step.finish)}` : ''}
          </>
        )}
      </p>
    </li>
  )
}
