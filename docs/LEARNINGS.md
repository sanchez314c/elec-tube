# Learnings

Development insights, gotchas, and things that didn't work as expected.

## Electron-Specific

### Context Isolation Changes Everything

With `contextIsolation: true`, the renderer can't access Node.js APIs at all. Every piece of data that needs to cross the process boundary must go through the preload bridge. This means:
- No `require('electron')` in React components
- No direct `fs` access from the UI
- Every API call is an async IPC round-trip

This is the correct security approach, but it means adding a new feature touches 5 files minimum (youtube-api.ts, index.ts, preload.ts, electron.d.ts, appStore.ts).

### Two TypeScript Configs Are Mandatory

The main process runs CommonJS in Node.js. The renderer runs ES modules in Chromium via Vite. You cannot use a single tsconfig for both. This trips up developers (and AI agents) constantly. When you get weird module resolution errors, check which tsconfig you're compiling with.

### Linux Sandbox Is Broken on Most Distros

The Electron sandbox requires `kernel.unprivileged_userns_clone=1`, which is disabled by default on many Linux distributions. Rather than asking users to change kernel settings, we disable the sandbox with `--no-sandbox`. Not ideal for security, but necessary for compatibility.

### Frameless Window Requires Custom Drag Regions

With `frame: false` and `titleBarStyle: 'hidden'`, you lose native window controls and drag behavior. The CSS `-webkit-app-region: drag` on the title bar re-enables dragging, but you need `-webkit-app-region: no-drag` on every interactive element inside it (buttons, search bar, avatar).

## YouTube API

### Two-Step Video Fetch Is Required

The YouTube search endpoint (`search.list`) and playlist endpoints only return snippet data (title, description, thumbnail). To get duration, view counts, and like counts, you need a second `videos.list` call with the video IDs from the first response. Every feature that displays video metadata requires this two-step pattern.

### Subscription Feed Has No Direct Endpoint

YouTube doesn't have a "subscription feed" API. To build one, you have to:
1. Get the user's subscriptions
2. Resolve each channel's upload playlist ID
3. Fetch recent videos from each upload playlist
4. Merge and sort by date

This is expensive in API quota (each step is a separate API call) and slow. We batch it: 10 channels at a time, 5 videos each, with pagination using a numeric index rather than YouTube's page tokens.

### Watch History Is Often Restricted

The special playlist ID `HL` (watch history) returns 403 on many accounts. YouTube has progressively restricted API access to watch history. The app handles this gracefully by returning an empty array, but users may be confused about why the view is empty.

### API Quota Is Tight

YouTube's default quota is 10,000 units per day. A single search costs 100 units. Loading the subscription feed can burn through 500+ units depending on how many channels you're subscribed to. Heavy users will hit the quota limit.

## UI/UX

### Glassmorphism Needs Careful Layering

The frosted glass effect (`backdrop-filter: blur()`) only works when there's something behind the element to blur. This means z-index stacking order matters a lot. Elements with `backdrop-filter` can also cause performance issues if there are too many stacked layers.

### Skeleton Loaders Beat Spinners

The shimmer-effect skeleton loaders (`skeleton-glass` class) provide much better perceived performance than a single spinner. Users see the layout immediately and can predict where content will appear.

### Infinite Scroll Needs a Sentinel Element

Using Intersection Observer with a sentinel `div` at the bottom of the grid is cleaner than scroll event listeners. The 200px `rootMargin` ensures content loads before the user reaches the bottom, making scrolling feel smoother.

## OAuth

### Dynamic Port for Callback Server

The OAuth callback server starts at port 8901 and finds the next available port if it's taken. This avoids conflicts when running multiple instances or when another process holds the port. The Google OAuth redirect URI is generated dynamically with the actual port.

### Duplicate Auth Prevention

Without the `isAuthenticating` flag, clicking "Sign In" twice could spawn two auth windows and two callback servers, causing a race condition. The guard prevents this.
