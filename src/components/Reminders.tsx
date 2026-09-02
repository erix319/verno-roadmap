import { useState, type FormEvent } from 'react'
import { REMINDERS } from '../data'
import { fmtDateYear, parseISO, todayISO } from '../schedule'
import type { CustomReminder } from '../storage'
import { BellIcon } from './icons'

export interface ReminderView {
  id: string
  date?: string
  repeat?: 'weekly' | 'monthly'
  weekday?: number
  day?: number
  title: string
  text?: string
  link?: { hash: string; label: string }
  custom: boolean
}

const WEEKDAYS_SHORT = ['пн', 'вт', 'ср', 'чт', 'пт', 'сб', 'вс']

/** День недели по ISO: 1 = понедельник … 7 = воскресенье */
function isoWeekday(date: Date): number {
  return ((date.getDay() + 6) % 7) + 1
}

export function buildReminderViews(custom: CustomReminder[]): ReminderView[] {
  const builtin: ReminderView[] = REMINDERS.map((reminder) => ({ ...reminder, custom: false }))
  const own: ReminderView[] = custom.map((reminder) => ({ id: reminder.id, date: reminder.date, title: reminder.text, custom: true }))
  return [...builtin, ...own].sort((a, b) => (a.date ?? '').localeCompare(b.date ?? ''))
}

/** Наступило ли напоминание сегодня (для повторяющихся — совпадает ли день) */
function isDueToday(reminder: ReminderView, now: Date, todayIso: string): boolean {
  if (reminder.repeat === 'weekly') return isoWeekday(now) === reminder.weekday
  if (reminder.repeat === 'monthly') return now.getDate() === reminder.day
  return !!reminder.date && reminder.date <= todayIso
}

/** Ключ скрытия: разовые скрываются навсегда, повторяющиеся — до следующего раза */
export function dismissKey(reminder: ReminderView, todayIso: string): string {
  return reminder.repeat ? `${reminder.id}@${todayIso}` : reminder.id
}

/** Сколько напоминаний наступило и не скрыто — для счётчика на колокольчике */
export function countDueReminders(reminders: ReminderView[], dismissed: Record<string, boolean>): number {
  const now = new Date()
  const today = todayISO()
  return reminders.filter((reminder) => isDueToday(reminder, now, today) && !dismissed[dismissKey(reminder, today)]).length
}

function scheduleLabel(reminder: ReminderView): string {
  if (reminder.repeat === 'weekly') return `каждый ${WEEKDAYS_SHORT[(reminder.weekday ?? 1) - 1]}`
  if (reminder.repeat === 'monthly') return `каждое ${reminder.day ?? 1}-е`
  return reminder.date ? fmtDateYear(parseISO(reminder.date)) : '—'
}

interface ReminderBannerProps {
  reminders: ReminderView[]
  dismissed: Record<string, boolean>
  onDismiss: (key: string) => void
}

/** Баннер под навигацией: напоминания, чья дата наступила и которые не скрыты */
export function ReminderBanner({ reminders, dismissed, onDismiss }: ReminderBannerProps) {
  const now = new Date()
  const today = todayISO()
  const due = reminders.filter((reminder) => isDueToday(reminder, now, today) && !dismissed[dismissKey(reminder, today)])
  if (due.length === 0) return null

  return (
    <div className="reminder-banner" role="status" aria-label="Напоминания">
      {due.map((reminder) => (
        <div className="reminder-banner__item" key={reminder.id}>
          <p className="reminder-banner__title">
            <span className="reminder-banner__icon" aria-hidden="true">
              <BellIcon />
            </span>
            {reminder.title}
          </p>
          {reminder.text && <p className="reminder-banner__text">{reminder.text}</p>}
          <p className="reminder-banner__actions">
            {reminder.link && <a href={reminder.link.hash}>{reminder.link.label}</a>}
            <button type="button" className="link-button" onClick={() => onDismiss(dismissKey(reminder, today))}>
              {reminder.repeat ? 'скрыть до следующего раза' : 'скрыть'}
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
  onToggleDismiss: (key: string) => void
  onAdd: (date: string, text: string) => void
  onDelete: (id: string) => void
}

export function RemindersSection({ reminders, dismissed, onToggleDismiss, onAdd, onDelete }: RemindersSectionProps) {
  const [date, setDate] = useState('')
  const [text, setText] = useState('')
  const now = new Date()
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
          Когда дата наступает, напоминание всплывает баннером на любой странице. Общие (включая повторяющиеся) дублируются в Telegram, если настроен бот;
          добавленные формой живут только в этом браузере.
        </p>
      </div>

      <ul className="reminder-list">
        {reminders.map((reminder) => {
          const due = isDueToday(reminder, now, today)
          const key = dismissKey(reminder, today)
          const isHidden = !!dismissed[key]
          const status = isHidden ? (reminder.repeat ? 'скрыто до следующего раза' : 'скрыто') : due ? 'сегодня' : 'ждёт'
          return (
            <li className={`reminder-list__item${isHidden ? ' reminder-list__item--hidden' : ''}`} key={reminder.id}>
              <span className="reminder-list__date">{scheduleLabel(reminder)}</span>
              <p className="reminder-list__title">
                {reminder.title}
                <span className={`badge${due && !isHidden ? ' badge--due' : ' badge--optional'}`}>{status}</span>
              </p>
              <p className="reminder-list__actions">
                {(due || isHidden) && (
                  <button type="button" className="link-button" onClick={() => onToggleDismiss(key)}>
                    {isHidden ? 'показать снова' : 'скрыть'}
                  </button>
                )}
                {reminder.custom && (
                  <button type="button" className="link-button" onClick={() => onDelete(reminder.id)}>
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
