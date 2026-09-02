import { useState, type FormEvent } from 'react'
import { REMINDERS } from '../data'
import { fmtDateYear, parseISO, todayISO } from '../schedule'
import type { CustomReminder } from '../storage'

export interface ReminderView {
  id: string
  date: string
  title: string
  text?: string
  link?: { hash: string; label: string }
  custom: boolean
}

export function buildReminderViews(custom: CustomReminder[]): ReminderView[] {
  const builtin: ReminderView[] = REMINDERS.map((reminder) => ({ ...reminder, custom: false }))
  const own: ReminderView[] = custom.map((reminder) => ({ id: reminder.id, date: reminder.date, title: reminder.text, custom: true }))
  return [...builtin, ...own].sort((a, b) => a.date.localeCompare(b.date))
}

interface ReminderBannerProps {
  reminders: ReminderView[]
  dismissed: Record<string, boolean>
  onDismiss: (id: string) => void
}

/** Баннер под навигацией: напоминания, чья дата наступила и которые не скрыты */
export function ReminderBanner({ reminders, dismissed, onDismiss }: ReminderBannerProps) {
  const today = todayISO()
  const due = reminders.filter((reminder) => reminder.date <= today && !dismissed[reminder.id])
  if (due.length === 0) return null

  return (
    <div className="reminder-banner" role="status" aria-label="Напоминания">
      {due.map((reminder) => (
        <div className="reminder-banner__item" key={reminder.id}>
          <p className="reminder-banner__title">
            <span aria-hidden="true">🔔 </span>
            {reminder.title}
          </p>
          {reminder.text && <p className="reminder-banner__text">{reminder.text}</p>}
          <p className="reminder-banner__actions">
            {reminder.link && <a href={reminder.link.hash}>{reminder.link.label}</a>}
            <button type="button" className="reminder-banner__dismiss" onClick={() => onDismiss(reminder.id)}>
              скрыть
            </button>
          </p>
        </div>
      ))}
    </div>
  )
}

interface RemindersSectionProps {
  reminders: ReminderView[]
  dismissed: Record<string, boolean>
  onToggleDismiss: (id: string) => void
  onAdd: (date: string, text: string) => void
  onDelete: (id: string) => void
}

export function RemindersSection({ reminders, dismissed, onToggleDismiss, onAdd, onDelete }: RemindersSectionProps) {
  const [date, setDate] = useState('')
  const [text, setText] = useState('')
  const today = todayISO()

  const submit = (event: FormEvent) => {
    event.preventDefault()
    if (!date || !text.trim()) return
    onAdd(date, text.trim())
    setDate('')
    setText('')
  }

  return (
    <section className="page-section" aria-labelledby="reminders-title">
      <div className="page-section__header">
        <h2 id="reminders-title">Напоминалки</h2>
        <p className="section-lead">
          Когда дата наступает, напоминание всплывает баннером на любой странице плана. Хранятся здесь же, в localStorage.
        </p>
      </div>

      <ul className="reminder-list">
        {reminders.map((reminder) => {
          const isDue = reminder.date <= today
          const isHidden = !!dismissed[reminder.id]
          const status = isHidden ? 'скрыто' : isDue ? 'наступило' : 'ждёт'
          return (
            <li className={`reminder-list__item${isHidden ? ' reminder-list__item--hidden' : ''}`} key={reminder.id}>
              <time className="reminder-list__date" dateTime={reminder.date}>
                {fmtDateYear(parseISO(reminder.date))}
              </time>
              <p className="reminder-list__title">
                {reminder.title}
                <span className={`badge${isDue && !isHidden ? ' badge--due' : ' badge--optional'}`}>{status}</span>
              </p>
              <p className="reminder-list__actions">
                {(isDue || isHidden) && (
                  <button type="button" className="reminder-list__control" onClick={() => onToggleDismiss(reminder.id)}>
                    {isHidden ? 'показать снова' : 'скрыть'}
                  </button>
                )}
                {reminder.custom && (
                  <button type="button" className="reminder-list__control" onClick={() => onDelete(reminder.id)}>
                    удалить
                  </button>
                )}
              </p>
            </li>
          )
        })}
      </ul>

      <form className="reminder-form" onSubmit={submit}>
        <p className="reminder-form__field">
          <label className="reminder-form__label" htmlFor="reminder-date">Дата</label>
          <input
            id="reminder-date"
            className="reminder-form__input"
            type="date"
            required
            value={date}
            onChange={(event) => setDate(event.target.value)}
          />
        </p>
        <p className="reminder-form__field reminder-form__field--grow">
          <label className="reminder-form__label" htmlFor="reminder-text">О чём напомнить</label>
          <input
            id="reminder-text"
            className="reminder-form__input"
            type="text"
            required
            maxLength={200}
            placeholder="Например: проверить длительность плейлиста NextPizza"
            value={text}
            onChange={(event) => setText(event.target.value)}
          />
        </p>
        <button type="submit" className="button reminder-form__submit">Добавить</button>
      </form>
    </section>
  )
}
