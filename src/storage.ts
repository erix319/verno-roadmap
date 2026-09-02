import { DEFAULT_SETTINGS, type DoneMap, type Settings } from './schedule'

const DONE_KEY = 'verno-roadmap:done'
const SETTINGS_KEY = 'verno-roadmap:settings'

export function loadDone(): DoneMap {
  try {
    const raw = localStorage.getItem(DONE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === 'object' ? (parsed as DoneMap) : {}
  } catch {
    return {}
  }
}

export function saveDone(done: DoneMap): void {
  try {
    localStorage.setItem(DONE_KEY, JSON.stringify(done))
  } catch {
    /* приватный режим или заблокированное хранилище — просто не сохраняем */
  }
}

export function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    if (!raw) return DEFAULT_SETTINGS
    const parsed = JSON.parse(raw) as Partial<Settings>
    return {
      start: typeof parsed.start === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(parsed.start) ? parsed.start : DEFAULT_SETTINGS.start,
      hoursBefore: clamp(Number(parsed.hoursBefore), 1, 80, DEFAULT_SETTINGS.hoursBefore),
      hoursAfter: clamp(Number(parsed.hoursAfter), 1, 80, DEFAULT_SETTINGS.hoursAfter),
      shareA: clamp(Number(parsed.shareA), 0, 100, DEFAULT_SETTINGS.shareA),
      includeOptional: typeof parsed.includeOptional === 'boolean' ? parsed.includeOptional : DEFAULT_SETTINGS.includeOptional,
    }
  } catch {
    return DEFAULT_SETTINGS
  }
}

export function saveSettings(s: Settings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(s))
  } catch {
    /* см. выше */
  }
}

function clamp(n: number, min: number, max: number, fallback: number): number {
  if (!Number.isFinite(n)) return fallback
  return Math.min(max, Math.max(min, n))
}
