# Architecture

ElecTube is a standard two-process Electron app. The main process handles all external I/O (YouTube API, OAuth, mpv spawning, local storage). The renderer process is a React SPA that talks to the main process through a preload bridge.

## Process Model

```
┌─────────────────────────────────┐     ┌──────────────────────────────────┐
│         Main Process            │     │        Renderer Process          │
│         (Node.js)               │     │         (Chromium)               │
│                                 │     │                                  │
│  src/main/index.ts              │     │  src/renderer/App.tsx            │
│    - App lifecycle              │     │    - React root component        │
│    - BrowserWindow creation     │     │    - Auto-auth bootstrap         │
│    - All ipcMain.handle() calls │     │                                  │
│                                 │ IPC │  src/renderer/store/appStore.ts  │
│  src/main/youtube-api.ts        │<--->│    - Zustand state store         │
│    - YouTubeAPI class           │     │    - All async fetch actions     │
│    - googleapis v3 wrapper      │     │    - View mode, pagination       │
│                                 │     │                                  │
│  src/main/oauth.ts              │     │  src/renderer/components/        │
│    - Google OAuth 2.0 flow      │     │    - TitleBar, Sidebar, Grid,    │
│    - Local HTTP callback server │     │      Featured, Auth components   │
│    - Token refresh logic        │     │                                  │
│                                 │     │  src/renderer/styles/index.css   │
│  src/main/preload.ts            │     │    - Glassmorphism design system │
│    - contextBridge              │     │    - TailwindCSS custom tokens   │
│    - window.electube API        │     │                                  │
│                                 │     │  src/renderer/types/electron.d.ts│
│  electron-store                 │     │    - IPC bridge type definitions │
│    - Auth token persistence     │     │                                  │
└─────────────────────────────────┘     └──────────────────────────────────┘
```

## IPC Layer

The renderer and main process communicate through Electron's IPC mechanism, with a preload script acting as the bridge.

**Security model:** `nodeIntegration: false`, `contextIsolation: true`. The preload script (`src/main/preload.ts`) uses `contextBridge.exposeInMainWorld()` to expose a typed `window.electube` API. The renderer never touches `ipcRenderer` directly.

**Pattern:** All channels use `ipcMain.handle()` / `ipcRenderer.invoke()` (async request/response). No fire-and-forget `send`/`on` patterns.

**Channel naming:** `namespace:action` format.

### Channel Map

**Window controls:**
- `window:minimize` / `window:maximize` / `window:close`

**YouTube API (all go through `YouTubeAPI` class):**
- `youtube:getTrending` -- paginated trending videos (US, 25 per page)
- `youtube:search` -- full-text search, up to 25 results
- `youtube:getPlaylists` -- user's playlist library (requires auth)
- `youtube:getPlaylistItems` -- videos in a specific playlist
- `youtube:getVideoDetails` -- single video metadata
- `youtube:getSubscriptions` -- list of subscribed channels (requires auth)
- `youtube:getSubscriptionFeed` -- recent videos from subscriptions, batched (requires auth)
- `youtube:getLikedVideos` -- liked videos playlist `LL` (requires auth)
- `youtube:getWatchHistory` -- watch history playlist `HL` (requires auth, often restricted)

**Player:**
- `player:play` -- spawns mpv with yt-dlp for the given video ID
- `player:openInBrowser` -- opens the YouTube URL via `shell.openExternal()`

**Persistence:**
- `store:get` / `store:set` / `store:delete` -- read/write `electron-store`

**Auth:**
- `auth:login` -- triggers OAuth flow, opens auth window
- `auth:logout` -- clears tokens and cookies
- `auth:getProfile` -- returns Google user info (name, email, picture)
- `auth:isLoggedIn` -- checks if tokens exist
- `auth:isConfigured` -- checks if OAuth env vars are set

### Token Refresh

Before every authenticated API call, the main process checks `youtubeOAuth.getValidAccessToken()`. If the access token is within 5 minutes of expiry, it uses the refresh token to get a new one. The refreshed token is stored back to `electron-store`.

## State Management

The renderer uses a single Zustand store (`src/renderer/store/appStore.ts`) for all app state.

### View Modes

The `currentView` field controls which content is displayed:

| View | Auth Required | Data Source |
|------|:---:|---|
| `trending` | No | `youtube.videos.list` with `chart: mostPopular` |
| `search` | No | `youtube.search.list` + `youtube.videos.list` for full metadata |
| `subscriptions` | Yes | Batch fetch: get subscriptions, resolve upload playlists, fetch recent videos |
| `liked` | Yes | `youtube.playlistItems.list` with playlist ID `LL` |
| `history` | Yes | `youtube.playlistItems.list` with playlist ID `HL` |
| `playlists` | Yes | `youtube.playlists.list` with `mine: true` |
| `playlist` | Yes | `youtube.playlistItems.list` for a specific playlist |

### Pagination

Paginated views (`trending`, `subscriptions`, `liked`, `history`) track `nextPageToken` and `hasMore` in the store. The `loadMore()` action appends new results to the existing video array, with deduplication by video ID.

The subscription feed uses a custom pagination scheme. The page token is just a numeric index into the cached list of subscription upload playlist IDs, processed in batches of 10 channels at a time.

### Age Filter

The subscription view has a client-side age filter (Today, 3/7/14/30 days, All time). Default is 14 days. The filter runs after fetching, not as an API parameter. It's applied to both initial loads and "load more" appends.

## YouTube API Wrapper

`src/main/youtube-api.ts` wraps the `googleapis` YouTube Data v3 client. Key design choices:

- **Two-step video fetch:** Search and playlist endpoints only return snippet data. To get duration, view counts, and like counts, the wrapper does a second `videos.list` call with the video IDs from the first response.
- **Subscription feed batching:** Fetches all subscriptions, resolves each channel's upload playlist ID, then fetches recent videos in batches of 10 channels, 5 videos per channel.
- **Duration parsing:** Converts ISO 8601 durations (`PT1H23M45S`) to display format (`1:23:45`).
- **View count formatting:** Converts raw counts to abbreviated form (`1.2M`, `345K`).

## OAuth Flow

`src/main/oauth.ts` implements Google OAuth 2.0:

1. Find an available port starting at 8901
2. Spin up a local HTTP server on that port
3. Generate the auth URL with scopes for YouTube and user profile
4. Open a new BrowserWindow loading the Google auth page
5. User signs in and grants permissions
6. Google redirects to `http://localhost:{port}/oauth2callback`
7. The local server catches the auth code, exchanges it for tokens
8. Tokens are stored via `electron-store`
9. The auth window closes, the local server shuts down

The flow is guarded against duplicate auth attempts with an `isAuthenticating` flag.

## Video Playback

When the user clicks a video, the main process spawns mpv as a detached child process:

```
mpv --ytdl-format=bestvideo[height<=?1080]+bestaudio/best \
    --script-opts=ytdl_hook-ytdl_path=/path/to/yt-dlp \
    --force-window=immediate \
    --ontop \
    --no-terminal \
    https://www.youtube.com/watch?v=VIDEO_ID
```

Binary paths are resolved from:
1. `ELECTUBE_MPV_PATH` / `ELECTUBE_YTDLP_PATH` environment variables (set by `run-source-linux.sh`)
2. Fallback: `bin/mpv.AppImage` and `bin/yt-dlp` relative to the app root

The mpv process is detached (`detached: true`, `stdio: 'ignore'`) and unref'd so it doesn't block the Electron process.

Right-click on a video triggers `player:openInBrowser`, which opens the YouTube URL in the system default browser via `shell.openExternal()`.

## Build Pipeline

### Development

Vite runs a dev server on port 50826. Electron loads `http://localhost:50826` in dev mode. The main process TypeScript is compiled separately with `tsc -p tsconfig.main.json` to `dist/main/`.

### Production

1. `vite build` compiles the renderer to `dist/renderer/`
2. `tsc -p tsconfig.main.json` compiles the main process to `dist/main/`
3. `electron-builder` packages everything into AppImage and/or deb

### TypeScript Configs

Two separate configs because Electron's main process runs in Node.js (CommonJS) while the renderer runs in the browser (ESM, bundled by Vite):

- `tsconfig.json` -- renderer. ESNext, bundler resolution, JSX, path alias `@/*` to `src/renderer/*`.
- `tsconfig.main.json` -- main process. CommonJS, Node resolution, outputs to `dist/main/`.
