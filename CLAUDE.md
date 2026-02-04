# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ElecTube is a desktop YouTube client built with Electron + React + Vite. It provides a native grid-view interface for browsing YouTube content and plays videos through mpv with yt-dlp for best quality streaming.

## Build & Development Commands

```bash
# Development (runs main + renderer concurrently)
npm run dev

# Development - individual processes
npm run dev:main      # Compile main process + launch Electron
npm run dev:renderer  # Vite dev server on port 50826

# Production build
npm run build         # Build both renderer and main
npm run build:main    # TypeScript compile main process only
npm run build:renderer # Vite build renderer only

# Run production build
npm run start

# Package for distribution
npm run package       # Build + electron-builder
npm run package:linux # Build + electron-builder --linux
```

## Environment Variables

Required for full functionality:
- `YOUTUBE_API_KEY` - YouTube Data API v3 key (required for search, trending)
- `YOUTUBE_CLIENT_ID` - OAuth 2.0 client ID (required for user playlists)
- `YOUTUBE_CLIENT_SECRET` - OAuth 2.0 client secret (required for user playlists)

## Architecture

### Process Model (Electron)

```
Main Process (Node.js)         Renderer Process (Browser)
├── src/main/index.ts          ├── src/renderer/App.tsx
├── src/main/preload.ts        ├── src/renderer/store/appStore.ts
├── src/main/youtube-api.ts    └── src/renderer/components/
└── src/main/oauth.ts
```

**Main Process** (`src/main/`):
- `index.ts` - Electron app lifecycle, IPC handlers, window management
- `preload.ts` - Context bridge exposing `window.electube` API
- `youtube-api.ts` - YouTube Data API v3 wrapper using `googleapis`
- `oauth.ts` - Google OAuth 2.0 flow with local HTTP callback server

**Renderer Process** (`src/renderer/`):
- React 18 with Vite bundler
- Zustand for state management (`store/appStore.ts`)
- TailwindCSS with custom `electube-*` color tokens
- Frameless window with custom title bar

### IPC Communication Pattern

All renderer-to-main communication uses `ipcRenderer.invoke()` through the preload bridge:

```typescript
// Renderer calls
await window.electube.youtube.getTrending()
await window.electube.player.play(videoId)
await window.electube.auth.login()

// Main process handles
ipcMain.handle('youtube:getTrending', ...)
ipcMain.handle('player:play', ...)
ipcMain.handle('auth:login', ...)
```

### Video Playback

Videos launch in external mpv player via `child_process.spawn()`:
```
mpv --ytdl-format=bestvideo[height<=?1080]+bestaudio/best --script-opts=ytdl_hook-ytdl_path=<yt-dlp> URL
```
Self-contained: mpv AppImage + yt-dlp binary auto-downloaded to `bin/` directory on first run.

### TypeScript Configuration

Two separate configs:
- `tsconfig.json` - Renderer (React, ESNext, bundler resolution)
- `tsconfig.main.json` - Main process (CommonJS, Node resolution, outputs to `dist/main/`)

Path aliases:
- `@/*` → `src/renderer/*` (renderer tsconfig only)

### View Modes

The renderer uses 4 view states managed by Zustand (`store/appStore.ts`):
- `trending` - Default view, fetches YouTube trending videos
- `search` - Search results from query
- `playlists` - User's playlist library (requires auth)
- `playlist` - Videos within a selected playlist

### Persistence

Uses `electron-store` for persistent settings in the main process. Access via `window.electube.store` API.

### Launch Script

`./run-source-linux.sh` provides managed development startup with self-contained binaries:
- Downloads `yt-dlp` and `mpv` AppImage to `bin/` directory (first run only)
- Auto-updates yt-dlp if older than 7 days
- Kills stale Vite/Electron processes on port 50826
- Auto-installs `node_modules` if missing
- Compiles main process before launching
- Passes `ELECTUBE_MPV_PATH` and `ELECTUBE_YTDLP_PATH` to Electron
- Cleanup on Ctrl+C

The main process reads these env vars to locate binaries, with fallback to `bin/` relative paths.

### Linux Sandbox Note

Electron sandbox is disabled for Linux compatibility:
```typescript
app.commandLine.appendSwitch('--no-sandbox');
```
Launch with `--no-sandbox` flag or run `sudo sysctl -w kernel.unprivileged_userns_clone=1`.
