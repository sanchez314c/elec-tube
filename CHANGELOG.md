# Changelog

All notable changes to ElecTube are documented here.

## v1.0.0 — 2026-03-07

### Initial Release
- Electron 33 + React 18 + TypeScript 5.3 desktop YouTube client
- Frameless window with custom title bar, macOS-style window controls
- YouTube Data API v3 integration via `googleapis`
- Google OAuth 2.0 authentication flow with local HTTP callback server (dynamic port starting at 8901)
- Automatic token refresh (5-minute buffer before expiry)
- Persistent auth token storage via `electron-store`

### Views
- **Trending** — paginated YouTube trending (US region, 25 per page)
- **Subscriptions** — batched feed across all subscribed channels, 10 channels per batch, 5 videos each, sorted by publish date
- **Liked Videos** — special playlist ID `LL`, paginated
- **Watch History** — special playlist ID `HL`, paginated (restricted on many accounts)
- **My Playlists** — user playlist library with inline video browsing
- **Search** — full-text search returning up to 25 results with full metadata

### Video Playback
- Launches mpv AppImage with `--ytdl-format=bestvideo[height<=?1080]+bestaudio/best`
- yt-dlp used as the ytdl hook for format selection
- Browser fallback via `shell.openExternal()` on right-click
- Self-contained binaries auto-downloaded to `bin/` on first run
- yt-dlp auto-updates if older than 7 days

### UI
- Dark glassmorphism design with `electube-accent` (#FF0033) red accent color
- Featured carousel for top 5 videos in trending/subscriptions view
- Video card grid with lazy-loaded thumbnails, duration badge, hover play overlay
- Skeleton loaders during fetch
- Age filter for subscription feed (Today / 3 / 7 / 14 / 30 days / All time)
- Load more / infinite scroll support for paginated views
- User avatar with Google profile picture in title bar
- Error banner with dismiss for API failures

### Infrastructure
- `run-source-linux.sh` — managed dev launch with binary bootstrap
- `electron-store` for settings and auth token persistence
- Linux `--no-sandbox` applied automatically
- Vite 5 dev server on port 50826
- Dual TypeScript configs: `tsconfig.json` (renderer) and `tsconfig.main.json` (main, CommonJS)

### Documentation — 2026-03-07
- Created README.md with full tech stack table, architecture overview, project structure, build commands, and environment variable setup
- Created CHANGELOG.md, CONTRIBUTING.md, LICENSE
- All documentation is self-contained in the repo root (no separate docs/ site)

### Extended Documentation — 2026-03-07
- Added SECURITY.md with credential handling details, Electron security config, IPC surface audit, and vulnerability reporting contact
- Added AGENTS.md with AI agent guide covering entry points, key files, IPC conventions, and common change patterns
- Added .github/ISSUE_TEMPLATE/bug_report.md with frontmatter and environment checklist
- Added .github/ISSUE_TEMPLATE/feature_request.md with frontmatter and implementation prompts
- Added .github/PULL_REQUEST_TEMPLATE.md with type-of-change checklist and security verification items
- Added docs/README.md as documentation index linking to all project docs
- Added docs/ARCHITECTURE.md with two-process model, IPC channel map, state management, OAuth flow, and video playback pipeline
- Added docs/INSTALLATION.md with prerequisites, API credential setup, quick start, and troubleshooting
- Added docs/DEVELOPMENT.md with build commands, project structure, feature walkthrough patterns, styling guide, and debugging tips

## v1.0.1 — 2026-03-14

### Documentation Standardization
- Created docs/API.md with full IPC channel reference, parameters, return types, and type definitions
- Created docs/BUILD_COMPILE.md with build system overview, TypeScript config breakdown, Vite config, and packaging details
- Created docs/DEPLOYMENT.md with release process, distribution formats, binary dependencies, and post-deploy verification
- Created docs/TECHSTACK.md with full technology breakdown, versions, and rationale for each choice
- Created docs/FAQ.md with real questions about auth, playback, development, and platform support
- Created docs/TROUBLESHOOTING.md with error scenarios, platform issues, build failures, and step-by-step fixes
- Created docs/WORKFLOW.md with development workflow, branching strategy, commit conventions, and release cycle
- Created docs/QUICK_START.md with minimal steps to clone-to-running in under 2 minutes
- Created docs/LEARNINGS.md with Electron gotchas, YouTube API insights, UI/UX discoveries, and OAuth implementation notes
- Created docs/PRD.md with product requirements, target users, feature scope, non-goals, and architecture decisions
- Created docs/TODO.md with known issues, planned features, technical debt, and nice-to-haves
- Updated docs/README.md index to link all 15 documentation files
- Achieved 27/27 standard documentation file coverage

### Repository Compliance (repo-prep)
- Created .editorconfig with project-specific settings
- Created .nvmrc (Node 20)
- Created run-source-mac.sh with macOS binary bootstrapping and port management
- Created run-source-windows.bat with Windows port management and yt-dlp download
- Created resources/icons/ directory with .gitkeep
- Created tests/ directory with .gitkeep
- Created archive/.gitkeep for backup directory
- Synced AGENTS.md from CLAUDE.md
- Fixed package.json: author "User" -> "J. Michaels", added repository/bugs/homepage URLs
- Generated random high ports: dev server 50826, debug 52445, inspect 58700
- Updated vite.config.ts, src/main/index.ts, run-source-linux.sh, and all docs with new port
- Injected Chromium transparency/GPU flags (enable-transparent-visuals, disable-gpu-compositing) into main process
- Disabled DevTools auto-open (manual via Ctrl+Shift+I only)
- Added archive/ and legacy/ patterns to .gitignore
- Removed 3 empty non-protected directories (hooks, Player, services)
- Three-layer Electron sandbox defense: main.ts + run scripts + package.json

### Forensic Audit & Remediation (repo-audit)
- [H1] Extracted `refreshTokenIfNeeded()` helper to eliminate 6x duplicated token refresh boilerplate in IPC handlers
- [M1] Created shared `src/renderer/utils/formatDate.ts` utility, removed duplicate from VideoCard.tsx and FeaturedCarousel.tsx
- [M3] Added YouTube video ID regex validation (`/^[a-zA-Z0-9_-]{11}$/`) in player:play and player:openInBrowser handlers
- [M4] Added 5-minute timeout to OAuth callback server to prevent indefinite listening
- [M5] Added error event listener on mpv spawn to handle missing binary gracefully
- [L1] Fixed `local` keyword used outside function context in run-source-mac.sh
- [L2] Added `set -o pipefail` to run-source-linux.sh for proper pipe error propagation
- 14 dependency vulnerabilities documented (all require major version upgrades: electron 33->41, electron-builder 24->26, vite 5->8)
- Full build verified: main process (tsc) and renderer (vite) compile clean
- Generated AUDIT_REPORT.md with forensic findings and remediation log

### Neo-Noir Glass Monitor Restyle (repo-restyle-neo)
- Applied Neo-Noir Glass Monitor design system (teal #14b8a6 accent, replacing red #FF0033)
- Frameless floating window: transparent: true, hasShadow: false, 16px body padding gap
- Canonical title bar: YouTube play icon, "ElecTube" in teal, tagline, flat about button, circular window controls
- About modal: app icon, version, description, MIT license, GitHub badge, email, closes on X/Escape/overlay
- Status bar footer: status dot + video count (left), version v1.0.0 in teal (right)
- Sidebar restyled: no logo section, nav items at top, teal active states with left border accent
- Complete design token system: 40+ CSS custom properties for backgrounds, text, borders, shadows, gradients
- Glass card system: layered shadows, ::before inner highlights, hover lift + shadow escalation
- Featured hero carousel: ambient radial gradient mesh, dot particle overlay
- All components converted from electube-* Tailwind tokens to Neo-Noir CSS classes
- Invisible-at-rest scrollbars (6px, appear on hover)
- Search input: teal focus glow
- Video cards: teal/purple gradient glow on hover
- Full build verified: tsc + vite pass clean
