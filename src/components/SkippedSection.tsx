import { SKIPPED } from '../data'

export function SkippedSection() {
  return (
    <section className="page-section" aria-labelledby="skipped-title">
      <details className="section-fold">
        <summary className="section-fold__summary">
          <h2 id="skipped-title">Отложено или мимо</h2>
          <span className="section-fold__hint" aria-hidden="true" />
        </summary>
        <p className="section-lead section-fold__lead">
          Остаток библиотеки Udemy — около 375 ч видео вместе с уже пройденной Tilda. Ничего из этого не приближает ни заказы, ни fullstack.
        </p>
        <ul className="skipped-list">
          {SKIPPED.map((entry) => (
            <li className="skipped-list__item" key={entry.title}>
              <p className="skipped-list__title">
                {entry.title} <span className="skipped-list__meta">· {entry.meta}</span>
              </p>
              <p className="skipped-list__reason">{entry.why}</p>
            </li>
          ))}
        </ul>
      </details>
    </section>
  )
}
