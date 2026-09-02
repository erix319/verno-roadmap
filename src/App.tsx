import { useEffect, useMemo, useRef, useState } from 'react'
import { TRACKS } from './data'
import { buildPlan, type DoneMap, type Settings, type SkippedMap } from './schedule'
import { loadDone, loadSettings, loadSkipped, saveDone, saveSettings, saveSkipped } from './storage'
import { AppNav } from './components/AppNav'
import { Hero } from './components/Hero'
import { Recommendation } from './components/Recommendation'
import { ScheduleControls } from './components/ScheduleControls'
import { Timeline } from './components/Timeline'
import { TrackCard } from './components/TrackCard'
import { TrackPage } from './components/TrackPage'
import { SkippedSection } from './components/SkippedSection'
import { ROUTE_META, useRoute } from './router'

export default function App() {
  const [done, setDone] = useState<DoneMap>(loadDone)
  const [skipped, setSkipped] = useState<SkippedMap>(loadSkipped)
  const [settings, setSettings] = useState<Settings>(loadSettings)
  const route = useRoute()
  const pageRef = useRef<HTMLDivElement>(null)
  const isFirstRender = useRef(true)

  useEffect(() => saveDone(done), [done])
  useEffect(() => saveSkipped(skipped), [skipped])
  useEffect(() => saveSettings(settings), [settings])

  useEffect(() => {
    document.title = ROUTE_META[route].title
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    window.scrollTo({ top: 0 })
    pageRef.current?.focus({ preventScroll: true })
  }, [route])

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

  return (
    <div className="container">
      <AppNav route={route} plan={plan} />
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
