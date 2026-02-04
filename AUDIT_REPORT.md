# ElecTube Forensic Code Audit Report

**Date**: 2026-03-14
**Auditor**: Master Control
**Scope**: Full source audit of ElecTube desktop application
**Project Path**: `/media/heathen-admin/RAID/Development/Projects/portfolio/elec-tube`

---

## Summary

| Severity | Count | Remediated | Deferred |
|----------|-------|------------|----------|
| CRITICAL | 0     | -          | -        |
| HIGH     | 2     | 1          | 1        |
| MEDIUM   | 7     | 4          | 3        |
| LOW      | 5     | 2          | 3        |
| INFO     | 4     | 0          | 4        |
| **Total**| **18**| **7**      | **11**   |

---

## HIGH Severity

### H1. Repeated Token Refresh Pattern (DRY Violation)

**File**: `src/main/index.ts` (lines 137-247, pre-fix)
**Status**: REMEDIATED

The same token refresh boilerplate was duplicated 5 times across IPC handlers: `getPlaylists`, `getSubscriptions`, `getSubscriptionFeed`, `getLikedVideos`, and `getWatchHistory`. Each handler contained an identical block checking `youtubeOAuth.isLoggedIn()`, calling `getValidAccessToken()`, and calling `setAccessToken()`.

**Risk**: Maintenance burden. Any change to the refresh logic would need to be applied in 5+ places, increasing the chance of drift or missed updates.

**Fix Applied**: Extracted a `refreshTokenIfNeeded()` helper function and replaced all 5 duplicated blocks with a single call to the helper.

---

### H2. Dependency Vulnerabilities (14 npm vulnerabilities)

**File**: `package.json` / `package-lock.json`
**Status**: DEFERRED (requires breaking changes)

`npm audit` reports 14 vulnerabilities:
- 5 high severity in `node-tar` (via electron-builder)
- 5 moderate in electron/esbuild/yauzl transitive deps
- 4 low severity

All remaining vulnerabilities require major version upgrades:
- `electron` 33 -> 41
- `electron-builder` 24 -> 26
- `vite` 5 -> 8

These are breaking changes requiring manual migration and full regression testing. They cannot be patched in place.

**Recommendation**: Schedule a dedicated upgrade sprint for each major dependency. Test thoroughly before and after each upgrade.

---

## MEDIUM Severity

### M1. Duplicated Date Formatting Function

**Files**: `src/renderer/components/Grid/VideoCard.tsx` (lines 14-26, pre-fix), `src/renderer/components/Featured/FeaturedCarousel.tsx` (lines 23-35, pre-fix)
**Status**: REMEDIATED

Identical `formatDate` function was copy-pasted in both components, computing relative date strings from ISO date strings.

**Fix Applied**: Extracted to `src/renderer/utils/formatDate.ts`. Both components now import from the shared utility.

---

### M2. Duplicated Type Definitions Across Process Boundaries

**Files**: `src/main/youtube-api.ts`, `src/main/preload.ts`, `src/renderer/types/electron.d.ts`
**Status**: DEFERRED (intentional architecture)

`VideoItem`, `PlaylistItem`, and related interfaces are defined three times. This is a consequence of Electron's process isolation: the main process uses CommonJS, the renderer uses ESM, and the preload bridge sits between them. Sharing types across these boundaries without a shared build step would add complexity for marginal benefit.

**Recommendation**: If a shared build step (e.g., a `shared/types` package compiled separately) is added in the future, consolidate these definitions. Until then, keep them in sync manually.

---

### M3. No Input Validation on videoId in Player IPC Handlers

**Files**: `src/main/index.ts` - `player:play` (line 262, pre-fix) and `player:openInBrowser` (line 288, pre-fix)
**Status**: REMEDIATED

The `videoId` parameter from the renderer was interpolated directly into a URL string. While the renderer constructs valid IDs, no server-side validation ensured the value matched the expected YouTube video ID format (11 alphanumeric characters with hyphens and underscores).

**Risk**: If a corrupted or malicious value were passed (e.g., via a compromised renderer), it could result in unexpected URLs being opened or passed to `spawn`.

**Fix Applied**: Added regex validation `(/^[a-zA-Z0-9_-]{11}$/)` before URL construction in both `player:play` and `player:openInBrowser` handlers. Invalid IDs throw an error immediately.

---

### M4. OAuth Callback Server Missing Timeout

**File**: `src/main/oauth.ts` (line 186, pre-fix)
**Status**: REMEDIATED

The local HTTP server created for the OAuth callback had no timeout. If the user closed the auth browser window without completing the flow, or simply abandoned it, the server would remain listening indefinitely, and the Promise would never resolve or reject.

**Risk**: Resource leak. The port stays bound, the Promise hangs, and `isAuthenticating` stays true, blocking future auth attempts.

**Fix Applied**: Added a 5-minute (300000ms) `setTimeout` that cleans up the server, closes the auth window, and rejects the Promise. The timeout is cleared on successful auth, on error, on window close, and on server error.

---

### M5. Missing Error Handler on Spawn

**File**: `src/main/index.ts` (line 267, pre-fix)
**Status**: REMEDIATED

The `spawn` call for mpv did not listen for the `'error'` event. If the mpv binary did not exist or was not executable, `spawn` would emit an unhandled `'error'` event. With `detached: true` and `stdio: 'ignore'`, this error would go unhandled.

**Fix Applied**: Added `mpv.on('error', ...)` handler that logs the error to console.

---

### M6. CSP Allows unsafe-inline for Scripts

**File**: `src/renderer/index.html` (line 6)
**Status**: DEFERRED (acceptable for context)

The Content Security Policy includes `'unsafe-inline'` in `script-src`. In a web application this would be a significant XSS risk. In this context (desktop Electron app with `contextIsolation: true`, `nodeIntegration: false`, and only trusted first-party code), the risk is minimal. Vite's dev mode requires inline scripts for HMR.

**Recommendation**: For production builds, consider using a stricter CSP with nonces or hashes if a build step can inject them.

---

### M7. store:set IPC Channel Has No Key Validation

**File**: `src/main/index.ts` (line 296, pre-fix)
**Status**: DEFERRED (acceptable for context)

The `store:set` handler accepts any key string from the renderer process. There is no allowlist of valid keys. Since the renderer process is entirely trusted first-party code and electron-store writes to a local JSON file, this is a low practical risk.

**Recommendation**: If the app grows to include third-party extensions or untrusted renderer content, add a key allowlist.

---

## LOW Severity

### L1. `local` Keyword Used Outside Function in run-source-mac.sh

**File**: `run-source-mac.sh` (line 167, pre-fix)
**Status**: REMEDIATED

The `local` keyword was used for `retries=0` in the main script scope (outside any function). While bash on macOS silently allows this, it is undefined behavior per POSIX and will fail on strict shells.

**Fix Applied**: Wrapped the Vite startup and wait loop in a `start_vite()` function where `local` is valid.

---

### L2. Missing `set -o pipefail` in run-source-linux.sh

**File**: `run-source-linux.sh` (line 6, pre-fix)
**Status**: REMEDIATED

The script used `set -e` for error-on-failure but did not set `pipefail`. Without `pipefail`, a failed command in a pipeline (e.g., `command | grep pattern`) would not trigger the `set -e` exit if the last command in the pipe succeeded.

**Fix Applied**: Added `set -o pipefail` after `set -e`.

---

### L3. Hardcoded Region Code 'US' for Trending

**Files**: `src/main/index.ts` (line 182), `src/main/youtube-api.ts` (lines 196, 333)
**Status**: DEFERRED (planned feature)

The trending videos region is hardcoded to `'US'`. Users in other countries always see US trending content.

**Recommendation**: Already documented in `docs/TODO.md` as a planned feature. Implement region detection or user preference when prioritized.

---

### L4. No Rate Limiting on API Calls from Renderer

**Files**: Multiple IPC handlers in `src/main/index.ts`
**Status**: DEFERRED (natural limit exists)

The renderer can fire unlimited API calls through IPC with no throttling or debouncing at the IPC layer. In practice, the YouTube Data API v3 quota (10,000 units/day) acts as a natural rate limit.

**Recommendation**: If users report quota exhaustion, add client-side debouncing on rapid navigation.

---

### L5. postcss.config.js Uses ESM Export Syntax

**File**: `postcss.config.js`
**Status**: DEFERRED (works correctly)

Uses `export default` syntax which requires ESM support. This works with Vite (which handles ESM configs natively) but could cause issues if other tooling attempts to load this config.

**Recommendation**: No action needed unless non-Vite tooling is introduced.

---

## INFO

### I1. No Test Framework Configured

No testing framework (Jest, Vitest, Playwright) is set up. Already documented in `docs/TODO.md`.

### I2. No CI/CD Pipeline

No GitHub Actions, GitLab CI, or other automation. Already documented in `docs/WORKFLOW.md`.

### I3. No Linting/Formatting Enforcement

No ESLint, Prettier, or similar tooling configured. Already documented in `docs/TODO.md`.

### I4. electron-store Data Is Unencrypted

Auth tokens and cached data are stored as plaintext JSON via `electron-store`. Already documented in `SECURITY.md`.

---

## Remediation Log

All fixes applied on 2026-03-14. Backups created with timestamp `20260314_012513`.

| ID | Fix Description | File(s) Modified | Status |
|----|----------------|-----------------|--------|
| H1 | Extracted `refreshTokenIfNeeded()` helper, replaced 5 duplicated token refresh blocks | `src/main/index.ts` | COMPLETE |
| H2 | Dependency upgrades (electron, electron-builder, vite) | - | DEFERRED - breaking changes |
| M1 | Extracted shared `formatDate()` utility, updated imports in both components | `src/renderer/utils/formatDate.ts` (new), `src/renderer/components/Grid/VideoCard.tsx`, `src/renderer/components/Featured/FeaturedCarousel.tsx` | COMPLETE |
| M2 | Duplicated types across process boundaries | - | DEFERRED - intentional architecture |
| M3 | Added videoId regex validation (`/^[a-zA-Z0-9_-]{11}$/`) to `player:play` and `player:openInBrowser` | `src/main/index.ts` | COMPLETE |
| M4 | Added 5-minute auth timeout with cleanup on all exit paths | `src/main/oauth.ts` | COMPLETE |
| M5 | Added `mpv.on('error', ...)` handler for spawn failures | `src/main/index.ts` | COMPLETE |
| M6 | CSP unsafe-inline in script-src | - | DEFERRED - acceptable for desktop app |
| M7 | store:set key validation | - | DEFERRED - acceptable for trusted renderer |
| L1 | Wrapped Vite wait loop in `start_vite()` function to fix `local` outside function | `run-source-mac.sh` | COMPLETE |
| L2 | Added `set -o pipefail` after `set -e` | `run-source-linux.sh` | COMPLETE |
| L3 | Hardcoded US region for trending | - | DEFERRED - planned feature |
| L4 | No IPC rate limiting | - | DEFERRED - natural API quota limit |
| L5 | ESM export in postcss.config.js | - | DEFERRED - works with Vite |

### Files Created
- `src/renderer/utils/formatDate.ts` - shared date formatting utility

### Files Modified
- `src/main/index.ts` - H1, M3, M5 fixes
- `src/main/oauth.ts` - M4 fix
- `src/renderer/components/Grid/VideoCard.tsx` - M1 fix
- `src/renderer/components/Featured/FeaturedCarousel.tsx` - M1 fix
- `run-source-mac.sh` - L1 fix
- `run-source-linux.sh` - L2 fix

### Backup Files
All modified files have `.backup.20260314_012513` copies in their original locations.

---

END OF AUDIT REPORT.
