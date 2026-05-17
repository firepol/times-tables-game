# Times Tables Game

A Progressive Web App (PWA) for children to practice multiplication tables (×1–×9).

[![Deploy to GitHub Pages](https://github.com/firepol/times-tables-game/actions/workflows/deploy.yml/badge.svg)](https://github.com/firepol/times-tables-game/actions/workflows/deploy.yml)

## Features

- **4 game modes**: drag & drop, multiple choice, typed answer, missing factor (6 × ? = 24)
- **Mixed mode**: one session combining all modes
- **Timed challenge**: optional per-question countdown (2–6 s), configurable in settings
- **Statistics**: session history with per-type error breakdown (typed / MC / drag)
- **Smart training**: "Train weak calculations" suggests the most-missed multiplications from recent sessions
- **English + Italian**: language auto-detected from browser, switchable in settings
- **Installable PWA**: works offline, can be added to the home screen on Android/iOS

## Live demo

[https://firepol.github.io/times-tables-game/](https://firepol.github.io/times-tables-game/)

## Local development

```bash
npm install
npm run dev        # dev server at http://localhost:5173
```

## Tests

```bash
NODE_ENV=test npm test    # 30 unit tests (vitest)
```

## Deploy

To deploy this app for free on GitHub Pages, follow the instructions in [DEPLOY.md](DEPLOY.md).

## Tech stack

- [Vite](https://vite.dev/) + [React 19](https://react.dev/) + TypeScript
- [react-router-dom v7](https://reactrouter.com/) for routing
- [@dnd-kit](https://dndkit.com/) for touch-native drag & drop
- [vite-plugin-pwa](https://vite-pwa-org.netlify.app/) for service worker and PWA manifest
- [react-i18next](https://react.i18next.com/) for EN/IT translations
- [vitest](https://vitest.dev/) for unit tests

## Project structure

```
src/
  components/   # Reusable UI components (NumberPad, MultipleChoice, DragDropBoard, CountdownBar)
  pages/        # Pages (HomePage, GamePage, ResultsPage, SettingsPage, StatsPage, …)
  hooks/        # Custom React hooks (useSettings, useSessions, useWeakCalcs)
  engine/       # Game logic (question generation, scoring, distractors)
  i18n/         # EN + IT translation strings
  types.ts      # Shared TypeScript interfaces
```

## License

[MIT](LICENSE)
