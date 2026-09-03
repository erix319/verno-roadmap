import { fmtHours, type Plan } from '../schedule'
import { ROUTE_META } from '../router'
import { ProgressRing } from './ProgressRing'

interface OverallProgressProps {
  plan: Plan
}

/** Плавающее кольцо общего прогресса. Ведёт на обзор, поэтому на самом обзоре не рендерится */
export function OverallProgress({ plan }: OverallProgressProps) {
  const total = plan.tracks.A.total + plan.tracks.B.total
  const done = plan.tracks.A.done + plan.tracks.B.done
  const percent = total ? Math.round((done / total) * 100) : 0

  return (
    <a className="overall-progress" href={ROUTE_META.home.hash}>
      <ProgressRing
        percent={percent}
        color="var(--color-track-a)"
        label={`Общий прогресс ${percent} % — ${fmtHours(done)} из ${fmtHours(total)} ч по обоим трекам. Открыть обзор`}
        size={52}
      />
    </a>
  )
}
