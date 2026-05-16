# Tabelline PWA

Impara le tabelline giocando — Progressive Web App per bambini.

## Sviluppo locale

```bash
npm install
npm run dev
```

Apri [http://localhost:5173](http://localhost:5173) nel browser.

## Build

```bash
npm run build
npm run preview
```

## Deploy su Vercel

Il file `vercel.json` configura il rewrite SPA: tutte le route vengono reindirizzate a `index.html`.

```bash
vercel deploy
```

## Struttura progetto

```
src/
  components/   # Componenti riusabili
  pages/        # Pagine (HomePage, GamePage, ResultsPage, SettingsPage)
  hooks/        # Custom React hooks
  engine/       # Logica di gioco (generazione domande, scoring)
  types/        # Cartella riservata (tipi condivisi in src/types.ts)
  types.ts      # Interfacce TypeScript
```

## Stack

- [Vite](https://vite.dev/) + [React](https://react.dev/) + TypeScript
- [react-router-dom](https://reactrouter.com/) per il routing
- [@dnd-kit](https://dndkit.com/) per drag & drop
- [vite-plugin-pwa](https://vite-pwa-org.netlify.app/) per service worker e manifest
