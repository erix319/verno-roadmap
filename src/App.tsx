import { useEffect, useMemo, useState } from 'react'
import { TRACKS } from './data'
import { buildPlan, type DoneMap, type Settings } from './schedule'
import { loadDone, loadSettings, saveDone, saveSettings } from './storage'
import { Hero } from './components/Hero'
import { ScheduleControls } from './components/ScheduleControls'
import { Timeline } from './components/Timeline'
import { TrackSection } from './components/TrackSection'
import { SkippedSection } from './components/SkippedSection'

export default function App() {
  const [done, setDone] = useState<DoneMap>(loadDone)
  const [settings, setSettings] = useState<Settings>(loadSettings)

  useEffect(() => saveDone(done), [done])
  useEffect(() => saveSettings(settings), [settings])

  const plan = useMemo(() => buildPlan(settings, done), [settings, done])

  const toggleStep = (id: string) =>
    setDone((previous) => {
      const next = { ...previous }
      if (next[id]) delete next[id]
      else next[id] = true
      return next
    })

  const resetProgress = () => {
    if (window.confirm('Снять все галочки? Настройки останутся.')) setDone({})
  }

  return (
    <div className="container">
      <Hero plan={plan} />
      <main>
        <ScheduleControls settings={settings} onChange={setSettings} onResetProgress={resetProgress} />
        <Timeline plan={plan} />
        <div className="tracks">
          {TRACKS.map((track) => (
            <TrackSection key={track.id} trackPlan={plan.tracks[track.id]} done={done} settings={settings} onToggle={toggleStep} />
          ))}
        </div>
        <SkippedSection />
      </main>
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
