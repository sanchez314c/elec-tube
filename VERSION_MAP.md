# Version Map

Tracks all dependency versions and their roles in ElecTube.

## Application

| Component | Version | Notes |
|-----------|---------|-------|
| ElecTube | 1.0.0 | `package.json` version field |

## Runtime Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| electron | ^33.0.0 | Desktop app framework, main + renderer processes |
| electron-store | ^8.1.0 | Persistent key-value storage for auth tokens and settings |
| googleapis | ^144.0.0 | YouTube Data API v3 client, Google OAuth 2.0 |
| zustand | ^4.5.0 | State management for the React renderer |

## Dev Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| @types/node | ^20.10.0 | Node.js type definitions for main process |
| @types/react | ^18.2.0 | React type definitions |
| @types/react-dom | ^18.2.0 | ReactDOM type definitions |
| @vitejs/plugin-react | ^4.2.0 | Vite plugin for React JSX transform and fast refresh |
| autoprefixer | ^10.4.16 | PostCSS plugin for CSS vendor prefixes |
| concurrently | ^8.2.0 | Run main + renderer dev servers in parallel |
| electron-builder | ^24.9.0 | Package Electron app into AppImage and deb |
| postcss | ^8.4.32 | CSS processing pipeline (used by Tailwind) |
| react | ^18.2.0 | UI component library |
| react-dom | ^18.2.0 | React DOM renderer |
| tailwindcss | ^3.4.0 | Utility-first CSS framework |
| typescript | ^5.3.0 | TypeScript compiler for both main and renderer |
| vite | ^5.0.0 | Frontend dev server and bundler |

## Bundled Binaries

Downloaded to `bin/` by `run-source-linux.sh` on first run.

| Binary | Version | Source | Auto-update |
|--------|---------|--------|-------------|
| mpv | 0.36.0 (AppImage) | [pkivolowitz/mpv-appimage](https://github.com/pkivolowitz/mpv-appimage/releases/download/v0.36.0/mpv-0.36.0-x86_64.AppImage) | No |
| yt-dlp | latest | [yt-dlp/yt-dlp](https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp) | Yes, if binary is older than 7 days |

## TypeScript Configs

| File | Target | Module | Output | Scope |
|------|--------|--------|--------|-------|
| `tsconfig.json` | ES2022 | ESNext (bundler) | No emit (Vite handles it) | `src/renderer/` |
| `tsconfig.main.json` | ES2022 | CommonJS | `dist/main/` | `src/main/` |

## Build Targets

| Target | Format | Tool |
|--------|--------|------|
| AppImage | Linux portable | electron-builder |
| deb | Debian package | electron-builder |

## External APIs

| API | Version | Auth Method |
|-----|---------|-------------|
| YouTube Data API | v3 | API key (anonymous) or OAuth 2.0 access token |
| Google OAuth 2.0 | v2 | Client ID + Client Secret, local HTTP callback |
| Google UserInfo | v2 | OAuth 2.0 access token (for profile picture, name, email) |
