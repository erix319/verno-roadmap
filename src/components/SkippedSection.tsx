import { SKIPPED } from '../data'

export function SkippedSection() {
  return (
    <section className="page-section" aria-labelledby="skipped-title">
      <div className="page-section__header">
        <h2 id="skipped-title">Отложено или мимо</h2>
        <p className="section-lead">Остаток библиотеки Udemy — около 375 ч видео вместе с уже пройденной Tilda. Ничего из этого не приближает ни заказы, ни fullstack.</p>
      </div>
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
    </section>
  )
}
