# FAQ

## General

**What is ElecTube?**
A desktop YouTube client for Linux. It connects to the YouTube Data API to browse videos and plays them through mpv with yt-dlp for best-quality streaming. No browser tab, no ads in the browsing UI.

**Why not just use YouTube in a browser?**
ElecTube gives you a grid-view interface focused on browsing. Videos play in mpv at up to 1080p. The app is lightweight and doesn't load YouTube's web frontend.

**Does ElecTube block ads in videos?**
ElecTube doesn't play videos in the app itself. Videos open in mpv via yt-dlp. Whether ads play depends on your mpv/yt-dlp setup and YouTube's current ad injection methods. The browsing UI has no ads.

**What platforms does it support?**
Linux x86_64 only. The bundled mpv AppImage and yt-dlp binary are Linux builds. The Electron app itself could theoretically run on macOS/Windows, but the binary bootstrapping and launch script are Linux-specific.

## Authentication

**Do I need a Google account?**
No. Without OAuth credentials, ElecTube runs in anonymous mode. You can browse trending videos and search. Subscriptions, liked videos, watch history, and playlists require authentication.

**What's the difference between the API key and OAuth credentials?**
The `YOUTUBE_API_KEY` is required for any YouTube API access (search, trending). OAuth credentials (`YOUTUBE_CLIENT_ID` + `YOUTUBE_CLIENT_SECRET`) are only needed if you want to access your personal YouTube data (subscriptions, playlists, liked videos).

**Where are my OAuth tokens stored?**
In `electron-store`, which writes to the OS user data directory (typically `~/.config/electube/`). Tokens are stored as unencrypted JSON. See [SECURITY.md](../SECURITY.md) for details.

**How do I log out?**
Click your profile picture in the top-right corner and click "Sign out". This deletes stored tokens and clears session cookies.

**My OAuth login window is blank. What's wrong?**
Your OAuth client ID is probably set as "Web application" instead of "Desktop app". Re-create it in Google Cloud Console as a Desktop app. Also make sure your Google account is added as a test user in the OAuth consent screen settings.

## Video Playback

**Where does mpv come from?**
The launch script (`run-source-linux.sh`) downloads mpv as an AppImage to the `bin/` directory on first run. It's self-contained; nothing is installed system-wide.

**Can I use my own mpv installation?**
Yes. Set the `ELECTUBE_MPV_PATH` environment variable to your mpv binary path.

**What quality do videos play at?**
Up to 1080p. The mpv command uses `--ytdl-format=bestvideo[height<=?1080]+bestaudio/best`, which selects the best video stream at or below 1080p combined with the best audio stream.

**Right-click opens in browser instead of mpv. Why?**
That's by design. Left-click plays in mpv. Right-click opens the video on YouTube in your default browser as a fallback.

## Development

**Why are there two tsconfig files?**
Electron's main process runs in Node.js (CommonJS modules) while the renderer runs in Chromium (ES modules, bundled by Vite). Each needs different TypeScript settings. See [BUILD_COMPILE.md](BUILD_COMPILE.md) for details.

**Why is the Electron sandbox disabled?**
Many Linux distros don't enable `kernel.unprivileged_userns_clone` by default, which Electron's sandbox requires. Disabling the sandbox avoids the "credentials.cc: Permission denied" crash. You can re-enable it by running `sudo sysctl -w kernel.unprivileged_userns_clone=1`.

**How do I add a new YouTube API method?**
See the walkthrough in [DEVELOPMENT.md](DEVELOPMENT.md#adding-a-new-youtube-api-method). It's a 5-step process touching `youtube-api.ts`, `index.ts`, `preload.ts`, `electron.d.ts`, and `appStore.ts`.

**Where does state live?**
All app state is in a single Zustand store at `src/renderer/store/appStore.ts`. Components read state via hooks and trigger actions. No component-level data fetching (except the initial auth check in `App.tsx`).
