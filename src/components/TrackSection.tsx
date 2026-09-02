import type { ReactNode } from 'react'
import { HABITS, TRACKS, type Item } from '../data'
import {
  fmtDate,
  fmtDateYear,
  fmtHours,
  isDone,
  isScheduled,
  toISO,
  type DoneMap,
  type ItemPlan,
  type Settings,
  type SkippedMap,
  type TrackPlan,
} from '../schedule'
import { AnimatedNumber } from './AnimatedNumber'
import { PauseIcon } from './icons'
import { ProgressRing } from './ProgressRing'

interface TrackSectionProps {
  trackPlan: TrackPlan
  done: DoneMap
  settings: Settings
  skipped: SkippedMap
  onToggle: (id: string) => void
  onSkip: (id: string) => void
  /** 1 — на странице трека (заголовок страницы), 2 — в общем списке */
  headingLevel?: 1 | 2
  /** Контент между шапкой трека и списком шагов (календарь на странице трека) */
  afterHeader?: ReactNode
}

function formatNumber(value: number): string {
  return String(value).replace('.', ',')
}

export function TrackSection({ trackPlan, done, settings, skipped, onToggle, onSkip, headingLevel = 2, afterHeader }: TrackSectionProps) {
  const track = TRACKS.find((candidate) => candidate.id === trackPlan.track)
  if (!track) return null

  const Heading: 'h1' | 'h2' = headingLevel === 1 ? 'h1' : 'h2'
  const modifier = track.id === 'A' ? 'track--a' : 'track--b'
  const percent = trackPlan.total ? Math.round((trackPlan.done / trackPlan.total) * 100) : 0
  const habits = HABITS.filter((habit) => habit.track === track.id)
  const titleId = `track-${track.id.toLowerCase()}-title`
  const skippedSteps = trackPlan.items.filter((step) => step.item.kind !== 'milestone' && skipped[step.item.id] && !isDone(step.item, done))
  const skippedHours = skippedSteps.reduce((sum, step) => sum + step.item.hours, 0)

  return (
    <section className={`track ${modifier}`} aria-labelledby={titleId}>
      <header className="track__header">
        <div className="track__header-main">
          <p className="eyebrow">Трек {track.id}</p>
          <Heading id={titleId} className="track__title">{track.name}</Heading>
          <p className="track__goal">{track.goal}</p>
          <p className="track__meta">
            <span>
              <AnimatedNumber value={trackPlan.done} format={fmtHours} /> / {fmtHours(trackPlan.total)} ч · {percent} %
            </span>
            {skippedSteps.length > 0 && (
              <span>
                отложено · {skippedSteps.length} ш. · {fmtHours(skippedHours)} ч
              </span>
            )}
            <span>финиш · {fmtDateYear(trackPlan.finish)}</span>
          </p>
        </div>
        <ProgressRing
          percent={percent}
          color={track.id === 'A' ? 'var(--color-track-a)' : 'var(--color-track-b)'}
          label={`Прогресс трека ${track.id}: ${percent} %`}
          size={72}
        />
      </header>

      {afterHeader}

      <ol className="track__steps">
        {trackPlan.items.map((step) =>
          step.item.kind === 'milestone' ? (
            <MilestoneItem key={step.item.id} step={step} checked={isDone(step.item, done)} />
          ) : (
            <StepItem
              key={step.item.id}
              step={step}
              checked={isDone(step.item, done)}
              scheduled={isScheduled(step.item, settings, skipped)}
              isSkipped={!!skipped[step.item.id]}
              onToggle={onToggle}
              onSkip={onSkip}
            />
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
  isSkipped: boolean
  onToggle: (id: string) => void
  onSkip: (id: string) => void
}

function StepItem({ step, checked, scheduled, isSkipped, onToggle, onSkip }: StepItemProps) {
  const item: Item = step.item
  const locked = Boolean(item.done)

  if (isSkipped && !checked) {
    return (
      <li className="step step--skipped">
        <span className="step__pause" aria-hidden="true">
          <PauseIcon />
        </span>
        <p className="step__title step__title--plain">
          {item.title}
          {item.meta && <span className="step__meta"> · {item.meta}</span>}
          <span className="badge badge--skipped">отложено</span>
        </p>
        <p className="step__hours">
          <span className="step__hours-value">{fmtHours(item.hours)} ч</span>
          <button type="button" className="link-button step__defer" onClick={() => onSkip(item.id)}>
            вернуть в план
          </button>
        </p>
      </li>
    )
  }

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
      <details className="step__details">
        <summary className="step__details-summary">что именно проходить</summary>
        <p className="step__note" id={noteId}>{item.note}</p>
      </details>
      <p className="step__hours">
        <span className="step__hours-value">{locked ? 'готово' : checked ? 'отмечено' : `${fmtHours(item.hours)} ч`}</span>
        {!locked && !checked && (
          <>
            {item.video ? `${formatNumber(item.video)} ч видео${item.factor ? ` · ×${formatNumber(item.factor)}` : ''}` : 'вне Udemy'}
            <br />
            {parked ? 'не в расписании' : step.finish ? `к ${fmtDate(step.finish)}` : ''}
          </>
        )}
        {!locked && !checked && !parked && (
          <button type="button" className="link-button step__defer" onClick={() => onSkip(item.id)}>
            отложить
          </button>
        )}
      </p>
    </li>
  )
}
