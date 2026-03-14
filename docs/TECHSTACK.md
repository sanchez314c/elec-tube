# Tech Stack

Full breakdown of every technology used in ElecTube, with versions and purpose.

## Core Framework

| Technology | Version | Purpose |
|-----------|---------|---------|
| Electron | ^33.0.0 | Desktop app framework. Provides main process (Node.js) and renderer process (Chromium). Frameless window with custom title bar. |
| React | ^18.2.0 | UI component library for the renderer. Functional components with hooks. |
| ReactDOM | ^18.2.0 | React renderer for the browser DOM. |
| TypeScript | ^5.3.0 | Type safety across both processes. Two separate tsconfig files for main (CommonJS) and renderer (ESM). |

## State Management

| Technology | Version | Purpose |
|-----------|---------|---------|
| Zustand | ^4.5.0 | Lightweight state management. Single store for all app state: views, videos, pagination, auth, filters. Actions handle all async data fetching. |

## Styling

| Technology | Version | Purpose |
|-----------|---------|---------|
| TailwindCSS | ^3.4.0 | Utility-first CSS framework. Custom `electube-*` color tokens for brand theming. |
| PostCSS | ^8.4.32 | CSS processing pipeline. Runs TailwindCSS and Autoprefixer. |
| Autoprefixer | ^10.4.16 | Adds vendor prefixes for cross-browser CSS compatibility. |
| Custom CSS | N/A | Glassmorphism design system (`src/renderer/styles/index.css`): backdrop filters, glass surfaces, glow effects, skeleton loaders, staggered animations. |

## Build Tools

| Technology | Version | Purpose |
|-----------|---------|---------|
| Vite | ^5.0.0 | Frontend bundler and dev server for the renderer. HMR support, port 50826. |
| @vitejs/plugin-react | ^4.2.0 | Vite plugin for React JSX transform and fast refresh. |
| electron-builder | ^24.9.0 | Packages the Electron app into AppImage and deb formats. |
| concurrently | ^8.2.0 | Runs main and renderer dev servers in parallel during development. |

## YouTube Integration

| Technology | Version | Purpose |
|-----------|---------|---------|
| googleapis | ^144.0.0 | Official Google API client. Used for YouTube Data API v3 (videos, playlists, search, subscriptions) and Google OAuth 2.0 (authentication, user profile). |

## Persistence

| Technology | Version | Purpose |
|-----------|---------|---------|
| electron-store | ^8.1.0 | JSON-based key-value store for the main process. Stores OAuth tokens (access token, refresh token, expiry). Persists to the OS user data directory. |

## Video Playback (External Binaries)

| Technology | Version | Purpose |
|-----------|---------|---------|
| mpv | 0.36.0 (AppImage) | Video player. Spawned as a detached child process. Supports yt-dlp as a format hook for YouTube streaming. |
| yt-dlp | latest | YouTube video/audio format extraction. Used by mpv to select best quality up to 1080p. Auto-updated if older than 7 days. |

## Type Definitions

| Package | Version | Purpose |
|---------|---------|---------|
| @types/node | ^20.10.0 | Node.js type definitions for the main process |
| @types/react | ^18.2.0 | React type definitions |
| @types/react-dom | ^18.2.0 | ReactDOM type definitions |

## System Requirements

| Requirement | Minimum |
|-------------|---------|
| Node.js | 20+ |
| npm | 9+ |
| OS | Linux x86_64 |
| Kernel | Any (sandbox disabled by default) |

## External APIs

| API | Version | Auth |
|-----|---------|------|
| YouTube Data API | v3 | API key (anonymous) or OAuth 2.0 access token |
| Google OAuth 2.0 | v2 | Client ID + Client Secret, local HTTP callback |
| Google UserInfo API | v2 | OAuth 2.0 access token |
