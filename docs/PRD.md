# Product Requirements Document

## Overview

**Product:** ElecTube
**Type:** Desktop application (Electron)
**Platform:** Linux x86_64
**Version:** 1.0.0

## Problem Statement

YouTube's web interface is bloated. It loads megabytes of JavaScript, shows ads in the browsing UI, and plays videos in a browser tab competing for resources with everything else. Power users who want a fast, focused way to browse and watch YouTube content need a native alternative.

## Target Users

- Linux desktop users who watch YouTube regularly
- Developers and power users comfortable with command-line setup
- Users who prefer mpv as their video player
- People who want to browse YouTube without the web UI overhead

## Core Features

### Must Have (v1.0)

| Feature | Status | Notes |
|---------|:---:|-------|
| Trending video feed | Done | Paginated, US region |
| Video search | Done | Full-text, up to 25 results |
| mpv video playback | Done | Up to 1080p via yt-dlp |
| Browser fallback | Done | Right-click to open in browser |
| Subscription feed | Done | Batched, sorted by date, with age filter |
| Liked videos | Done | Paginated |
| Watch history | Done | Paginated (may be restricted by YouTube) |
| Playlist library | Done | Browse and play playlist videos |
| Google OAuth login | Done | Auto-auth, persistent tokens, auto-refresh |
| User profile display | Done | Google profile picture and name |
| Dark UI | Done | Glassmorphism design with red accent |
| Self-contained binaries | Done | mpv + yt-dlp auto-downloaded |
| Infinite scroll | Done | Intersection Observer on paginated views |

### Non-Goals

- **Commenting** on videos (read-only client)
- **Uploading** videos
- **Channel management**
- **In-app video player** (videos play in external mpv)
- **Windows/macOS support** (Linux-only for now)
- **Mobile support**
- **Ad blocking** (not in scope; mpv/yt-dlp behavior is external)
- **Download/save** videos locally
- **Multi-account** support

## Architecture Decisions

| Decision | Rationale |
|----------|-----------|
| Electron over Tauri | googleapis (Node.js) is battle-tested; Electron's IPC model is well-understood |
| mpv over embedded player | Native video playback, format selection via yt-dlp, no DRM issues with embedded Chromium player |
| Zustand over Redux | Simpler API, less boilerplate, perfect for this app's scale |
| TailwindCSS over CSS-in-JS | Utility-first approach matches the component-based architecture, no runtime overhead |
| electron-store over SQLite | Simple key-value storage is all that's needed (just auth tokens) |

## Success Criteria

- App launches and shows trending videos within 3 seconds
- Video playback starts within 5 seconds of clicking
- Subscription feed loads within 10 seconds for accounts with up to 50 subscriptions
- OAuth login completes in a single flow without errors
- App stays under 200MB RAM during normal use
