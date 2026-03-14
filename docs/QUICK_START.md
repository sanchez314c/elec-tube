# Quick Start

Get ElecTube running in under 2 minutes.

## Prerequisites

- Node.js 20+
- Linux x86_64
- A YouTube API key ([get one here](https://console.cloud.google.com/apis/credentials))

## Steps

1. Export your API key:
```bash
export YOUTUBE_API_KEY="your_key_here"
```

2. Clone and launch:
```bash
git clone https://github.com/sanchez314c/elec-tube
cd elec-tube
./run-source-linux.sh
```

3. Wait for the launch sequence to complete. On first run it downloads mpv (~30MB) and yt-dlp (~10MB).

4. The app opens showing trending videos. Click any video to play it in mpv. Use the search bar to find videos.

5. Press `Ctrl+C` in the terminal to shut everything down.

## Optional: Enable Authenticated Features

For subscriptions, liked videos, and playlists, add OAuth credentials to your `~/.bashrc`:

```bash
export YOUTUBE_CLIENT_ID="your_client_id"
export YOUTUBE_CLIENT_SECRET="your_client_secret"
```

Get these from Google Cloud Console > APIs & Services > Credentials > Create OAuth 2.0 Client ID (type: Desktop app). Add your Google account as a test user in the OAuth consent screen.

Restart ElecTube after adding the credentials. It will auto-authenticate on launch.

## Controls

- **Left-click** a video to play in mpv
- **Right-click** a video to open in browser
- **Search bar** at the top for full-text search
- **Sidebar** for navigation between views
- **Filter dropdown** (subscriptions view) to filter by age
