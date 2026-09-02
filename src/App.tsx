import { useEffect, useMemo, useRef, useState } from 'react'
import { TRACKS } from './data'
import { buildPlan, type DoneMap, type Settings, type SkippedMap } from './schedule'
import {
  loadCustomReminders,
  loadDismissedReminders,
  loadDone,
  loadSettings,
  loadSkipped,
  saveCustomReminders,
  saveDismissedReminders,
  saveDone,
  saveSettings,
  saveSkipped,
  sanitizeSettings,
  type CustomReminder,
} from './storage'
import { AppNav } from './components/AppNav'
import { Hero } from './components/Hero'
import { Recommendation } from './components/Recommendation'
import { LoadChart } from './components/LoadChart'
import { ScheduleControls } from './components/ScheduleControls'
import { Timeline } from './components/Timeline'
import { TrackCard } from './components/TrackCard'
import { TrackPage } from './components/TrackPage'
import { SkippedSection } from './components/SkippedSection'
import { BackupSection } from './components/BackupSection'
import { buildReminderViews, countDueReminders, ReminderBanner, RemindersSection } from './components/Reminders'
import { ROUTE_META, useRoute } from './router'

export default function App() {
  const [done, setDone] = useState<DoneMap>(loadDone)
  const [skipped, setSkipped] = useState<SkippedMap>(loadSkipped)
  const [settings, setSettings] = useState<Settings>(loadSettings)
  const [dismissedReminders, setDismissedReminders] = useState<Record<string, boolean>>(loadDismissedReminders)
  const [customReminders, setCustomReminders] = useState<CustomReminder[]>(loadCustomReminders)
  const [pendingReminderScroll, setPendingReminderScroll] = useState(false)
  const route = useRoute()
  const pageRef = useRef<HTMLDivElement>(null)
  const isFirstRender = useRef(true)

  useEffect(() => saveDone(done), [done])
  useEffect(() => saveSkipped(skipped), [skipped])
  useEffect(() => saveSettings(settings), [settings])
  useEffect(() => saveDismissedReminders(dismissedReminders), [dismissedReminders])
  useEffect(() => saveCustomReminders(customReminders), [customReminders])

  useEffect(() => {
    document.title = ROUTE_META[route].title
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    window.scrollTo({ top: 0 })
    pageRef.current?.focus({ preventScroll: true })
  }, [route])

  useEffect(() => {
    if (pendingReminderScroll && route === 'home') {
      document.getElementById('reminders-title')?.scrollIntoView({ block: 'start' })
      setPendingReminderScroll(false)
    }
  }, [pendingReminderScroll, route])

  const plan = useMemo(() => buildPlan(settings, done, skipped), [settings, done, skipped])

  const toggleStep = (id: string) =>
    setDone((previous) => {
      const next = { ...previous }
      if (next[id]) delete next[id]
      else next[id] = true
      return next
    })

  const toggleSkip = (id: string) =>
    setSkipped((previous) => {
      const next = { ...previous }
      if (next[id]) delete next[id]
      else next[id] = true
      return next
    })

  const resetProgress = () => {
    if (window.confirm('Снять все галочки? Настройки и отложенные шаги останутся.')) setDone({})
  }

  const reminders = useMemo(() => buildReminderViews(customReminders), [customReminders])

  const toggleReminderDismiss = (id: string) =>
    setDismissedReminders((previous) => {
      const next = { ...previous }
      if (next[id]) delete next[id]
      else next[id] = true
      return next
    })

  const addReminder = (date: string, text: string) =>
    setCustomReminders((previous) => [...previous, { id: `custom-${Date.now().toString(36)}`, date, text }])

  const deleteReminder = (id: string) => {
    setCustomReminders((previous) => previous.filter((reminder) => reminder.id !== id))
    setDismissedReminders((previous) => {
      if (!previous[id]) return previous
      const next = { ...previous }
      delete next[id]
      return next
    })
  }

  const openReminders = () => {
    if (route !== 'home') window.location.hash = ROUTE_META.home.hash
    setPendingReminderScroll(true)
  }

  const exportData = () => JSON.stringify({ v: 1, done, skipped, settings, customReminders, dismissedReminders })

  const importData = (raw: string): boolean => {
    try {
      const parsed = JSON.parse(raw)
      if (!parsed || typeof parsed !== 'object') return false
      if (parsed.done && typeof parsed.done === 'object') setDone(parsed.done as DoneMap)
      if (parsed.skipped && typeof parsed.skipped === 'object') setSkipped(parsed.skipped as SkippedMap)
      if (parsed.settings) setSettings(sanitizeSettings(parsed.settings))
      if (Array.isArray(parsed.customReminders))
        setCustomReminders(
          parsed.customReminders.filter(
            (entry: unknown): entry is CustomReminder =>
              !!entry &&
              typeof (entry as CustomReminder).id === 'string' &&
              typeof (entry as CustomReminder).date === 'string' &&
              typeof (entry as CustomReminder).text === 'string',
          ),
        )
      if (parsed.dismissedReminders && typeof parsed.dismissedReminders === 'object')
        setDismissedReminders(parsed.dismissedReminders as Record<string, boolean>)
      return true
    } catch {
      return false
    }
  }

  return (
    <div className="container">
      <AppNav route={route} plan={plan} dueReminders={countDueReminders(reminders, dismissedReminders)} onBellClick={openReminders} />
      <ReminderBanner reminders={reminders} dismissed={dismissedReminders} onDismiss={toggleReminderDismiss} />
      <div className="page" ref={pageRef} tabIndex={-1}>
        {route === 'home' ? (
          <>
            <Hero plan={plan} />
            <main>
              <Recommendation plan={plan} settings={settings} done={done} skipped={skipped} onChange={setSettings} />
              <section className="page-section" aria-labelledby="tracks-title">
                <div className="page-section__header">
                  <h2 id="tracks-title">Треки</h2>
                  <p className="section-lead">Полные списки шагов с галочками — на страницах треков.</p>
                </div>
                <div className="track-cards">
                  {TRACKS.map((track) => (
                    <TrackCard key={track.id} trackPlan={plan.tracks[track.id]} done={done} skipped={skipped} settings={settings} />
                  ))}
                </div>
              </section>
              <ScheduleControls settings={settings} onChange={setSettings} onResetProgress={resetProgress} />
              <Timeline plan={plan} />
              <LoadChart plan={plan} settings={settings} />
              <RemindersSection
                reminders={reminders}
                dismissed={dismissedReminders}
                onToggleDismiss={toggleReminderDismiss}
                onAdd={addReminder}
                onDelete={deleteReminder}
              />
              <BackupSection onExport={exportData} onImport={importData} />
              <SkippedSection />
            </main>
          </>
        ) : (
          <TrackPage trackId={route} plan={plan} done={done} skipped={skipped} settings={settings} onToggle={toggleStep} onSkip={toggleSkip} />
        )}
      </div>
      <footer className="site-footer">
        <p>
          Часы работы = видео × коэффициент: курсы с кодом ×2, no-code и дизайн ×1,5, справочные ×1,2. Длительности — из библиотеки Udemy на 2 сентября 2026, цены услуг — с
          verno-dev.com. Бесплатные материалы (Битрикс, NextPizza, SQL, GetCourse) оценены приблизительно — поправь по факту.
        </p>
        <p>Галочки и настройки хранятся в этом браузере (localStorage) и не синхронизируются между устройствами.</p>
      </footer>
    </div>
  )
}
