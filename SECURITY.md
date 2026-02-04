# Security Policy

## Supported Versions

| Version | Supported |
|---------|-----------|
| 1.0.x   | Yes       |

## Reporting a Vulnerability

If you find a security issue, don't open a public GitHub issue. Email the maintainer directly or use GitHub's private vulnerability reporting feature.

**Contact:** J. Michaels ([sanchez314c](https://github.com/sanchez314c) on GitHub)

We'll acknowledge your report within 48 hours and provide an estimated timeline for a fix. If the issue is confirmed, we'll release a patch and credit you (unless you prefer to stay anonymous).

## How ElecTube Handles Credentials

### YouTube API Key

The `YOUTUBE_API_KEY` is read from environment variables at startup (`process.env.YOUTUBE_API_KEY` in `src/main/index.ts`). It never touches the renderer process or leaves the main process boundary. The key is passed directly to the `googleapis` client and is not logged, stored on disk, or sent anywhere besides Google's API endpoints.

Don't hardcode API keys in source files. Export them in your shell profile or use a `.env` file (which is in `.gitignore`).

### OAuth Tokens

Google OAuth 2.0 tokens (access token, refresh token, expiry) are stored locally via `electron-store`, which writes to the OS-level user data directory. Tokens are scoped to `youtube.readonly`, `youtube`, `userinfo.profile`, and `userinfo.email`.

The OAuth flow (`src/main/oauth.ts`) spins up a temporary local HTTP server on a dynamic port starting at 8901 to catch the callback. This server only listens on localhost and shuts down immediately after receiving the auth code.

Token refresh happens automatically when the access token is within 5 minutes of expiry. On logout, tokens are deleted from the store and session cookies are cleared.

### What's NOT Stored

- API keys are never written to disk
- No passwords are stored anywhere
- No telemetry or analytics data is collected or transmitted

## Electron Security Configuration

### Context Isolation

Context isolation is **enabled** (`contextIsolation: true` in `src/main/index.ts`). The renderer cannot access Node.js APIs directly. All communication goes through the preload bridge (`src/main/preload.ts`), which exposes a controlled `window.electube` API via `contextBridge.exposeInMainWorld()`.

### Node Integration

Node integration is **disabled** (`nodeIntegration: false`). The renderer process runs as a standard browser context with no access to `require()`, `process`, `fs`, or any Node built-ins.

### Sandbox Status

The Electron sandbox is disabled on Linux (`--no-sandbox`, `--disable-gpu-sandbox`) due to compatibility issues with `kernel.unprivileged_userns_clone` on many distros. If your kernel supports it, you can re-enable the sandbox:

```bash
sudo sysctl -w kernel.unprivileged_userns_clone=1
```

Then remove the `--no-sandbox` flags from `src/main/index.ts` and `run-source-linux.sh`.

### IPC Surface

All IPC channels use `ipcMain.handle()` / `ipcRenderer.invoke()` (the async request-response pattern). No `ipcMain.on()` fire-and-forget channels exist. The full list of exposed IPC channels:

- `window:minimize`, `window:maximize`, `window:close`
- `youtube:getTrending`, `youtube:search`, `youtube:getPlaylists`, `youtube:getPlaylistItems`, `youtube:getVideoDetails`, `youtube:getSubscriptions`, `youtube:getSubscriptionFeed`, `youtube:getLikedVideos`, `youtube:getWatchHistory`
- `player:play`, `player:openInBrowser`
- `store:get`, `store:set`, `store:delete`
- `auth:login`, `auth:logout`, `auth:getProfile`, `auth:isLoggedIn`, `auth:isConfigured`

### External Process Spawning

Video playback spawns mpv as a detached child process (`child_process.spawn` with `detached: true`). The video URL is constructed from a validated video ID, not raw user input. The mpv and yt-dlp binary paths come from environment variables or the `bin/` directory, not from any user-controlled source.

### Content Security

The app loads content from `localhost:50826` in dev mode and from local files in production. No remote web content is loaded into the main BrowserWindow. The OAuth login window loads Google's auth pages in a separate BrowserWindow with `nodeIntegration: false` and `contextIsolation: true`.

## Dependencies

ElecTube uses `googleapis` for YouTube API access and `electron-store` for local persistence. Keep dependencies updated. Run `npm audit` periodically to check for known vulnerabilities.

## Things to Watch

- **electron-store** writes unencrypted JSON to the user data directory. Anyone with filesystem access to your machine can read stored OAuth tokens.
- The `store:get`/`store:set`/`store:delete` IPC channels allow the renderer to read/write any key in the store. This is fine since the renderer is trusted code, but be aware of this if you add webview content or load remote URLs.
- The `player:openInBrowser` handler uses `shell.openExternal()`, which opens URLs in the system browser. The URL is constructed from a video ID, not raw input, so this is safe in the current implementation.
