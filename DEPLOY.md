# Deploying to GitHub Pages

This app is pre-configured to deploy automatically to GitHub Pages on every push to `main`. Follow the one-time setup steps below.

## How GitHub Pages works for this app

When you enable GitHub Pages for the `times-tables-game` repository, your app will be live at:

```
https://firepol.github.io/times-tables-game/
```

The build workflow (`GITHUB_PAGES=true`) sets the correct base path so all assets and the service worker resolve correctly at that URL.

> **Custom domain**: if you point a custom domain (e.g. `https://times-tables-game.com`) at GitHub Pages, change the `base` value in `vite.config.ts` from `'/times-tables-game/'` to `'/'` and commit. The app will resolve from root.

---

## One-time setup

### 1. Push the repository to GitHub

If you haven't already:

```bash
git remote add origin https://github.com/firepol/times-tables-game.git
git push -u origin main
```

### 2. Enable GitHub Pages in repository settings

1. Go to your repository on GitHub: `https://github.com/firepol/times-tables-game`
2. Click **Settings** → **Pages** (left sidebar).
3. Under **Build and deployment**, set **Source** to **GitHub Actions**.

Official guide: [Creating a GitHub Pages site](https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site)

### 3. Trigger the first deploy

The workflow runs automatically on every push to `main`. After step 2, either push a new commit or trigger it manually:

- Go to **Actions** tab → **Deploy to GitHub Pages** → **Run workflow**.

Wait ~1 minute, then open `https://firepol.github.io/times-tables-game/`.

---

## Automatic deploys

After the one-time setup, every `git push` to `main` triggers a new build and deploy. No manual steps needed.

---

## Local development

```bash
npm install
npm run dev        # dev server at http://localhost:5173
npm run build      # production build (base = '/')
npm run preview    # preview the build locally
npm test           # run unit tests
```

## Alternative: deploy to Vercel

Connect the repository to [Vercel](https://vercel.com). It auto-detects Vite and deploys on every push with zero configuration. The included `vercel.json` handles SPA routing.
