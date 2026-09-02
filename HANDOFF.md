# Handoff для Claude Code: опубликовать «Маршрут verno/dev» на GitHub Pages

## Контекст

В этой папке лежит готовое приложение (Vite + React + TypeScript): личный учебный план в двух треках с трекером прогресса. Код собран и проверен, ничего дописывать не нужно — задача только инфраструктурная: создать репозиторий, запушить, включить GitHub Pages и убедиться, что сайт открывается.

Имя репозитория: `verno-roadmap` (новый, публичный). Деплой уже описан в `.github/workflows/deploy.yml`: на push в `main` собирает `dist` с `--base=/verno-roadmap/` (берётся из имени репозитория) и публикует через `actions/deploy-pages`.

## Шаги

1. Убедись, что `gh auth status` показывает нужный аккаунт. Запомни его логин: `OWNER=$(gh api user -q .login)`.
2. В корне проекта: `npm ci && npm run build` — сборка должна пройти без ошибок (сначала `tsc --noEmit`, потом Vite).
3. Инициализируй git, если папки `.git` нет: `git init -b main && git add -A && git commit -m "Маршрут verno/dev: учебный план в двух треках"`. `node_modules` и `dist` уже в `.gitignore`.
4. Создай репозиторий и запушь: `gh repo create verno-roadmap --public --source=. --remote=origin --push`.
5. Включи Pages с источником «GitHub Actions»:
   `gh api --method POST "repos/$OWNER/verno-roadmap/pages" -f build_type=workflow`
   Если API отвечает, что Pages уже включены, — используй `--method PUT` с тем же телом.
6. Дождись деплоя: `gh run watch` (или `gh run list --workflow "Deploy to GitHub Pages"`). Первый запуск иногда стартует до включения Pages и падает — тогда перезапусти: `gh workflow run "Deploy to GitHub Pages"`.
7. Проверь адрес: `gh api "repos/$OWNER/verno-roadmap/pages" -q .html_url` и открой его — должна открыться страница «Маршрут verno/dev» со стилями (если стили не подхватились, значит base path не совпал с именем репозитория — см. workflow).

## Что считать готовым

- Репозиторий `OWNER/verno-roadmap` публичный, в нём один коммит с исходниками (без `node_modules` и `dist`).
- Workflow «Deploy to GitHub Pages» зелёный.
- `https://OWNER.github.io/verno-roadmap/` открывается, галочки сохраняются после перезагрузки страницы.

Верни в ответе ссылку на репозиторий и на опубликованный сайт.
