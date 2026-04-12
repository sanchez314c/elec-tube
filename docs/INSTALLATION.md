# Installation

## Prerequisites

- **Node.js 20+** and **npm 9+**
- **Linux x86_64** (the bundled mpv AppImage and yt-dlp binary are Linux-only)
- **A YouTube Data API v3 key** from the [Google Cloud Console](https://console.cloud.google.com/apis/credentials)

Optional (for authenticated features like subscriptions, liked videos, playlists):
- A Google OAuth 2.0 Client ID (type: Desktop app)
- The corresponding Client Secret

## Getting API Credentials

### YouTube API Key (required)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a project (or pick an existing one)
3. Go to **APIs & Services > Library**
4. Search for "YouTube Data API v3" and enable it
5. Go to **APIs & Services > Credentials**
6. Click **Create Credentials > API Key**
7. Copy the key

### OAuth Client ID (optional)

1. In the same project, go to **APIs & Services > Credentials**
2. Click **Create Credentials > OAuth 2.0 Client ID**
3. Application type: **Desktop app**
4. Copy the Client ID and Client Secret
5. Under **OAuth consent screen**, add your Google account as a test user (required while the app is in "Testing" status)

## Environment Variables

Export these in your shell or add them to `~/.bashrc`:

```bash
# Required for search and trending
export YOUTUBE_API_KEY="your_youtube_data_api_v3_key"

# Optional - needed for subscriptions, liked videos, history, playlists
export YOUTUBE_CLIENT_ID="your_oauth_client_id"
export YOUTUBE_CLIENT_SECRET="your_oauth_client_secret"
```

Reload your shell (`source ~/.bashrc`) or open a new terminal before running ElecTube.

## Quick Start

```bash
git clone https://github.com/sanchez314c/elec-tube
cd elec-tube
./run-source-linux.sh
```

That's it. The launch script handles everything on first run:

1. Creates the `bin/` directory
2. Downloads mpv AppImage (~30MB) and yt-dlp (~10MB)
3. Installs npm dependencies if `node_modules/` is missing
4. Compiles the main process TypeScript
5. Starts the Vite dev server on port 50826
6. Launches Electron pointing at the dev server

Hit `Ctrl+C` to shut everything down cleanly.

## Manual Setup

If you prefer to do things yourself:

```bash
git clone https://github.com/sanchez314c/elec-tube
cd elec-tube
npm install
npm run dev
```

This runs both the Vite dev server and Electron via `concurrently`. You'll need to provide your own mpv and yt-dlp binaries (set `ELECTUBE_MPV_PATH` and `ELECTUBE_YTDLP_PATH`), or let the launch script download them for you.

## What Gets Downloaded

On first run, `run-source-linux.sh` downloads two binaries to the `bin/` directory:

| Binary | Source | Size | Auto-update |
|--------|--------|------|-------------|
| yt-dlp | [yt-dlp/yt-dlp](https://github.com/yt-dlp/yt-dlp/releases/latest) | ~10MB | Yes, if older than 7 days |
| mpv | [pkivolowitz/mpv-appimage](https://github.com/pkivolowitz/mpv-appimage/releases) v0.36.0 | ~30MB | No |

These are self-contained binaries. Nothing is installed system-wide.

## Building for Distribution

```bash
npm run package           # AppImage + deb
npm run package:linux     # Linux only
```

Output goes to the `release/` directory. The packaged app includes `dist/` and `resources/` but not `bin/`. Users running the packaged version will need mpv and yt-dlp on their system PATH, or you can bundle them in a custom build step.

## Troubleshooting

**"YOUTUBE_API_KEY not found" warning at startup:**
Your API key isn't in the environment. Make sure you exported it and started ElecTube from the same shell.

**OAuth login window is blank or errors out:**
Check that your OAuth client ID is type "Desktop app", not "Web application". Also make sure your Google account is added as a test user in the OAuth consent screen settings.

**"Watch history access restricted":**
This is a YouTube API limitation. Many accounts have watch history access blocked at the API level. There's no fix on the ElecTube side.

**Electron crashes with "credentials.cc: Permission denied":**
Linux sandbox issue. The launch script already passes `--no-sandbox`, but if you're running manually, either add the flag or run:

```bash
sudo sysctl -w kernel.unprivileged_userns_clone=1
```

**Port 50826 already in use:**
The launch script tries to kill stale Vite processes on that port. If it persists, manually kill whatever's using it:

```bash
lsof -ti:50826 | xargs kill
```
