# Contributing to ElecTube

Thanks for your interest in contributing.

## Dev Setup

```bash
git clone https://github.com/sanchez314c/elec-tube
cd elec-tube
npm install
```

Export your API credentials:

```bash
export YOUTUBE_API_KEY=your_api_key
export YOUTUBE_CLIENT_ID=your_client_id      # optional
export YOUTUBE_CLIENT_SECRET=your_secret      # optional
```

Then start the dev environment:

```bash
./run-source-linux.sh
```

Or manually:

```bash
npm run dev:renderer   # Vite on port 50826
npm run dev:main       # compile main + launch Electron
```

## Project Structure

```
src/
  main/
    index.ts          # Electron app lifecycle + all IPC handlers
    preload.ts        # Context bridge (window.electube API)
    youtube-api.ts    # YouTube Data API v3 wrapper
    oauth.ts          # Google OAuth 2.0 flow
  renderer/
    App.tsx           # Root component, auth bootstrap
    store/
      appStore.ts     # Zustand state: views, videos, pagination, auth
    components/
      TitleBar.tsx    # Search bar, window controls, user avatar
      Sidebar/        # Navigation and playlist list
      Grid/           # VideoCard, VideoGrid, PlaylistCard, PlaylistGrid, FilterBar
      Featured/       # FeaturedCarousel (top 5 videos)
      Auth/           # UserAvatar
```

## Code Conventions

- **TypeScript everywhere** — no plain JS in `src/`
- **Interfaces over types** for objects with more than 2 properties
- **Zustand for state** — all async data fetching lives in `store/appStore.ts`
- **IPC naming** — `namespace:action` format (e.g. `youtube:getTrending`, `player:play`)
- **No direct IPC in components** — use `window.electube.*` from the preload bridge
- **TailwindCSS** for all styling — use `electube-*` color tokens for brand colors
- **Indentation**: 2 spaces

## Submitting Changes

1. Fork the repo and create a feature branch (`git checkout -b fix/broken-search`)
2. Make your changes
3. Update `CHANGELOG.md` under a new version or `Unreleased` section
4. Open a pull request using the PR template

## Reporting Bugs

Use the GitHub issue tracker. Include your Node.js version, OS version, and steps to reproduce. If the issue involves credentials or API key exposure, report it privately via the issue tracker rather than in a public issue.

## Code of Conduct

Be respectful. That's it.
