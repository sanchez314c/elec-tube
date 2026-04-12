# API Reference

ElecTube uses Electron IPC for all renderer-to-main communication. There are no HTTP endpoints. The renderer accesses everything through the `window.electube` API, exposed by the preload context bridge (`src/main/preload.ts`).

## IPC Channel Convention

All channels follow the `namespace:action` naming pattern. Every channel uses `ipcMain.handle()` / `ipcRenderer.invoke()` (async request-response). No fire-and-forget `send`/`on` patterns exist.

## Window Controls

| Channel | Parameters | Returns | Auth Required |
|---------|-----------|---------|:---:|
| `window:minimize` | None | `void` | No |
| `window:maximize` | None | `void` | No |
| `window:close` | None | `void` | No |

**Renderer usage:**
```typescript
await window.electube.window.minimize()
await window.electube.window.maximize()
await window.electube.window.close()
```

## YouTube API

All YouTube channels proxy to the `YouTubeAPI` class in `src/main/youtube-api.ts`, which wraps the `googleapis` YouTube Data API v3 client.

### Trending

| Channel | Parameters | Returns | Auth Required |
|---------|-----------|---------|:---:|
| `youtube:getTrending` | `pageToken?: string` | `PaginatedVideos` | No |

Returns most popular videos in the US region, 25 per page.

```typescript
const result = await window.electube.youtube.getTrending()
// result: { videos: VideoItem[], nextPageToken?: string, hasMore: boolean }
```

### Search

| Channel | Parameters | Returns | Auth Required |
|---------|-----------|---------|:---:|
| `youtube:search` | `query: string` | `VideoItem[]` | No |

Full-text video search, up to 25 results. Does a two-step fetch: search for video IDs, then fetch full metadata (duration, view counts, like counts).

```typescript
const videos = await window.electube.youtube.search('electron tutorial')
```

### Playlists

| Channel | Parameters | Returns | Auth Required |
|---------|-----------|---------|:---:|
| `youtube:getPlaylists` | None | `PlaylistItem[]` | Yes |
| `youtube:getPlaylistItems` | `playlistId: string` | `VideoItem[]` | Yes |

`getPlaylists` returns the authenticated user's playlists (up to 50). `getPlaylistItems` returns videos within a specific playlist.

```typescript
const playlists = await window.electube.youtube.getPlaylists()
const videos = await window.electube.youtube.getPlaylistItems('PLxxxxxxx')
```

### Video Details

| Channel | Parameters | Returns | Auth Required |
|---------|-----------|---------|:---:|
| `youtube:getVideoDetails` | `videoId: string` | `VideoItem \| null` | No |

Returns full metadata for a single video, including max-resolution thumbnail.

### Subscriptions

| Channel | Parameters | Returns | Auth Required |
|---------|-----------|---------|:---:|
| `youtube:getSubscriptions` | None | `SubscriptionItem[]` | Yes |
| `youtube:getSubscriptionFeed` | `pageToken?: string` | `PaginatedVideos` | Yes |

`getSubscriptions` returns the user's subscribed channels (up to 50, alphabetical). `getSubscriptionFeed` fetches recent videos from those channels in batches of 10 channels, 5 videos each, sorted by publish date. Pass `'refresh'` as the page token to reset the subscription cache.

```typescript
const feed = await window.electube.youtube.getSubscriptionFeed('refresh')
// Subsequent pages:
const more = await window.electube.youtube.getSubscriptionFeed(feed.nextPageToken)
```

### Liked Videos

| Channel | Parameters | Returns | Auth Required |
|---------|-----------|---------|:---:|
| `youtube:getLikedVideos` | `pageToken?: string` | `PaginatedVideos` | Yes |

Fetches from the special playlist ID `LL` (YouTube's liked videos playlist), 25 per page.

### Watch History

| Channel | Parameters | Returns | Auth Required |
|---------|-----------|---------|:---:|
| `youtube:getWatchHistory` | `pageToken?: string` | `PaginatedVideos` | Yes |

Fetches from the special playlist ID `HL`. Watch history access is often restricted by YouTube at the API level. Returns an empty array with `hasMore: false` if access is denied (403).

## Player

| Channel | Parameters | Returns | Auth Required |
|---------|-----------|---------|:---:|
| `player:play` | `videoId: string` | `{ success: boolean }` | No |
| `player:openInBrowser` | `videoId: string` | `{ success: boolean }` | No |

`player:play` spawns mpv as a detached child process with yt-dlp:
```
mpv --ytdl-format=bestvideo[height<=?1080]+bestaudio/best \
    --script-opts=ytdl_hook-ytdl_path=<yt-dlp-path> \
    --force-window=immediate --ontop --no-terminal \
    https://www.youtube.com/watch?v=<videoId>
```

`player:openInBrowser` opens the YouTube URL in the system default browser via `shell.openExternal()`.

Binary paths are resolved from `ELECTUBE_MPV_PATH` / `ELECTUBE_YTDLP_PATH` environment variables, with fallback to `bin/mpv.AppImage` and `bin/yt-dlp`.

## Persistence

| Channel | Parameters | Returns | Auth Required |
|---------|-----------|---------|:---:|
| `store:get` | `key: string` | `unknown` | No |
| `store:set` | `key: string, value: unknown` | `void` | No |
| `store:delete` | `key: string` | `void` | No |

Read/write to `electron-store`, which persists as JSON in the OS user data directory. Used internally for auth token storage.

## Authentication

| Channel | Parameters | Returns | Auth Required |
|---------|-----------|---------|:---:|
| `auth:login` | None | `{ success: boolean }` | No |
| `auth:logout` | None | `{ success: boolean }` | No |
| `auth:getProfile` | None | `UserProfile \| null` | No |
| `auth:isLoggedIn` | None | `boolean` | No |
| `auth:isConfigured` | None | `boolean` | No |

`auth:login` triggers the full Google OAuth 2.0 flow: opens an auth window, spins up a local HTTP callback server on a dynamic port (starting at 8901), exchanges the auth code for tokens, and stores them. Guarded against duplicate auth attempts.

`auth:isConfigured` checks whether `YOUTUBE_CLIENT_ID` and `YOUTUBE_CLIENT_SECRET` environment variables are set. Returns `false` if OAuth credentials aren't available.

## Type Definitions

All types are defined in `src/renderer/types/electron.d.ts`:

```typescript
interface VideoItem {
  id: string
  title: string
  description: string
  thumbnail: string        // medium quality
  thumbnailHigh: string    // high/maxres quality
  channelId: string
  channelTitle: string
  publishedAt: string      // ISO 8601
  duration: string         // formatted: "1:23:45" or "4:20"
  viewCount: string        // formatted: "1.2M", "345K", "89"
  likeCount: string        // raw number as string
}

interface PlaylistItem {
  id: string
  title: string
  description: string
  thumbnail: string
  itemCount: number
  channelTitle: string
  publishedAt: string
}

interface UserProfile {
  id: string
  email: string
  name: string
  picture: string          // Google profile picture URL
}

interface SubscriptionItem {
  channelId: string
  title: string
  description: string
  thumbnail: string
}

interface PaginatedVideos {
  videos: VideoItem[]
  nextPageToken?: string
  hasMore: boolean
}
```

## Adding a New IPC Channel

1. Add the method to `YouTubeAPI` class in `src/main/youtube-api.ts`
2. Add an `ipcMain.handle()` handler in `src/main/index.ts`
3. Add to the preload bridge interface and implementation in `src/main/preload.ts`
4. Add the TypeScript type to `src/renderer/types/electron.d.ts`
5. Add the Zustand action in `src/renderer/store/appStore.ts`
