# Маршрут verno/dev

Личный учебный план в двух треках — «Фриланс как можно быстрее» и «Рост как программиста (fullstack)» — с расчётом дат по часам в неделю, вехами и трекером прогресса. Галочки и настройки хранятся в браузере (localStorage).

Стек: Vite + React + TypeScript, без UI-библиотек. CSS — БЭМ, mobile-first, светлая и тёмная тема через `prefers-color-scheme`.

## Запуск

```bash
npm install
npm run dev
```

Сборка: `npm run build` (сначала проверка типов, потом Vite). Предпросмотр сборки: `npm run preview`.

## Деплой на GitHub Pages

1. Создай репозиторий на GitHub и запушь этот код в ветку `main`.
2. В репозитории открой **Settings → Pages** и в поле **Source** выбери **GitHub Actions**.
3. Workflow `.github/workflows/deploy.yml` соберёт сайт и опубликует его по адресу `https://<username>.github.io/<repo>/`.

Базовый путь подставляется автоматически из имени репозитория (`--base=/<repo>/`), поэтому переименование репозитория ничего не ломает.

## Структура

```text
src/
  data.ts            шаги обоих треков, привычки, отложенные курсы
  schedule.ts        раскладка часов по неделям и даты вех
  storage.ts         чтение и запись localStorage
  components/        Hero, ScheduleControls, Timeline, TrackSection, SkippedSection
  styles/
    variables.css    design tokens
    base/            reset, typography
    layout/          container, site-footer
    components/      по одному файлу на БЭМ-блок
    utilities/       visually-hidden
    global.css       точка входа, импортирует всё остальное
```

Чтобы поменять план, правь `src/data.ts`: часы, порядок, заметки и вехи живут там.
