# Development Guide

## Dev Environment

Make sure you've got:
- Node.js 20+
- npm 9+
- Linux x86_64
- `YOUTUBE_API_KEY` exported in your shell

See [Installation](INSTALLATION.md) for the full setup.

## Running the App

### The Easy Way

```bash
./run-source-linux.sh
```

Downloads binaries, installs deps, compiles TypeScript, starts Vite, launches Electron. All in one script. `Ctrl+C` to stop.

### The Manual Way

```bash
npm install

# Both processes at once (via concurrently)
npm run dev

# Or separately
npm run dev:renderer   # Vite dev server on port 50826
npm run dev:main       # Compile main process + launch Electron
```

When running manually, you need mpv and yt-dlp available. Either:
- Let `run-source-linux.sh` download them to `bin/` first, or
- Set `ELECTUBE_MPV_PATH` and `ELECTUBE_YTDLP_PATH` to your own binaries

## Build Commands

| Command | What it does |
|---------|-------------|
| `npm run dev` | Start both renderer (Vite) and main (Electron) concurrently |
| `npm run dev:renderer` | Vite dev server only, port 50826 |
| `npm run dev:main` | Compile main process TS, then launch Electron |
| `npm run build` | Build renderer (Vite) + main (tsc) |
| `npm run build:main` | Compile `src/main/` to `dist/main/` via `tsc -p tsconfig.main.json` |
| `npm run build:renderer` | Vite build to `dist/renderer/` |
| `npm run start` | Run the production build with Electron |
| `npm run package` | Full build + electron-builder (AppImage, deb) |
| `npm run package:linux` | Same but explicitly Linux target |

## Project Structure

```
elec-tube/
  src/
    main/                          # Electron main process (Node.js, CommonJS)
      index.ts                     # App lifecycle, window creation, all IPC handlers
      preload.ts                   # Context bridge: window.electube API
      youtube-api.ts               # YouTubeAPI class wrapping googleapis
      oauth.ts                     # Google OAuth 2.0 with local HTTP callback
    renderer/                      # React app (browser, ESM, bundled by Vite)
      App.tsx                      # Root component, auto-auth on mount
      main.tsx                     # React entry point
      store/
        appStore.ts                # Zustand store: views, videos, pagination, auth
      components/
        TitleBar.tsx               # Search bar, window controls, user avatar, logo
        Sidebar/
          Sidebar.tsx              # Nav items, playlist list, library section
        Grid/
          VideoCard.tsx            # Video thumbnail card with hover play overlay
          VideoGrid.tsx            # Responsive grid layout + infinite scroll
          PlaylistCard.tsx         # Playlist card with item count badge
          PlaylistGrid.tsx         # Grid view for playlists
          FilterBar.tsx            # Age filter dropdown + refresh button
          VideoCardSkeleton.tsx    # Loading skeleton placeholder
        Featured/
          FeaturedCarousel.tsx     # Hero carousel for top 5 videos
        Auth/
          UserAvatar.tsx           # Google profile pic, login/logout dropdown
      styles/
        index.css                  # Global CSS, glassmorphism system, animations
      types/
        electron.d.ts              # TypeScript interfaces for the IPC bridge
  dist/                            # Compiled output (git-ignored)
    main/                          # tsc output from tsconfig.main.json
    renderer/                      # Vite build output
  bin/                             # Self-contained mpv + yt-dlp binaries
  resources/                       # App icon
  run-source-linux.sh              # Launch script with binary bootstrap
  tailwind.config.js               # Tailwind theme with electube-* tokens
  vite.config.ts                   # Vite config, root: src/renderer
  tsconfig.json                    # Renderer TypeScript config
  tsconfig.main.json               # Main process TypeScript config
  postcss.config.js                # PostCSS with Tailwind + autoprefixer
```

## Adding a New YouTube API Method

This is the most common change pattern. Here's the full walkthrough:

**1. Add the method to `src/main/youtube-api.ts`:**

Add a new method to the `YouTubeAPI` class. Follow the existing patterns for error handling and response mapping. If the endpoint returns paginated results, return a `PaginatedVideos` object.

**2. Add an IPC handler in `src/main/index.ts`:**

```typescript
ipcMain.handle('youtube:yourMethod', async (_, arg1: string) => {
  try {
    // Refresh token if needed
    if (youtubeOAuth.isLoggedIn()) {
      const accessToken = await youtubeOAuth.getValidAccessToken();
      if (accessToken) {
        youtubeAPI.setAccessToken(accessToken);
      }
    }
    return await youtubeAPI.yourMethod(arg1);
  } catch (error) {
    console.error('Failed:', error);
    throw error;
  }
});
```

**3. Update the preload bridge in `src/main/preload.ts`:**

Add the method to both the `ElecTubeAPI` interface and the `api` object.

**4. Update types in `src/renderer/types/electron.d.ts`:**

Add the new method signature so the renderer's TypeScript knows about it.

**5. Add a Zustand action in `src/renderer/store/appStore.ts`:**

Add a new action that calls `window.electube.youtube.yourMethod()` and updates the store state.

## Adding a New View

1. Add the view name to the `ViewMode` union type in `appStore.ts`
2. Add a fetch action in the same store
3. Add the view to `refreshCurrentView()` switch statement
4. If paginated, add it to `loadMore()` too
5. Add a sidebar nav item in `Sidebar.tsx`
6. Wire up display logic in `App.tsx`

## Styling

Everything is TailwindCSS. The custom theme in `tailwind.config.js` defines `electube-*` color tokens:

- `electube-bg` -- main background (#0f0f0f)
- `electube-surface` -- card/panel surface (#1a1a1a)
- `electube-accent` -- brand red (#FF0033)
- Plus border, text, and hover variants

The glassmorphism effect (frosted glass look) is defined in `src/renderer/styles/index.css` using backdrop filters and semi-transparent backgrounds. Components apply it with the `glass` utility class.

## Debugging

DevTools open automatically in dev mode (`mainWindow.webContents.openDevTools()` in `src/main/index.ts`).

Main process console output goes to the terminal where you launched ElecTube. Renderer console output shows in the DevTools console.

Common things to check:
- **API errors:** Look for "Failed to fetch..." messages in the terminal
- **Auth issues:** Check if `youtubeOAuth.isLoggedIn()` returns what you expect
- **State bugs:** Use React DevTools + the Zustand devtools middleware
- **IPC issues:** Add `console.log` in both the handler (main) and the caller (store action)

## Hot Reload

The Vite dev server provides HMR for the renderer. Changes to React components, CSS, and store code will hot-reload without restarting.

Changes to the main process (`src/main/`) require a restart. Kill Electron and re-run `npm run dev:main` (or just restart via the launch script).

## Conventions

- TypeScript everywhere. No plain JS in `src/`.
- Interfaces over type aliases for objects with more than 2 properties.
- 2-space indentation.
- IPC channel names: `namespace:action` (e.g. `youtube:search`, `player:play`).
- Components never call IPC directly. They use `window.electube.*` or Zustand actions.
- Async data fetching lives in Zustand actions, not in component effects.
- TailwindCSS for styling. Use `electube-*` tokens for brand colors.

## Changelog

Update `CHANGELOG.md` after any functional change. Include a timestamp. Follow the existing format.
