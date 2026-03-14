# TODO

Known issues, planned features, and technical debt.

## Known Issues

- [ ] Watch history view returns empty for most accounts (YouTube API restriction on playlist `HL`)
- [ ] Subscription feed can be slow for users with 50+ subscriptions (sequential batch fetching)
- [ ] API quota can be exhausted quickly with heavy use (10,000 units/day default)
- [ ] OAuth tokens in electron-store are unencrypted (anyone with filesystem access can read them)
- [ ] Packaged app doesn't include mpv/yt-dlp binaries (users must install them separately)

## Planned Features

- [ ] Region selector for trending (currently hardcoded to US)
- [ ] Video quality selector (currently hardcoded to 1080p max)
- [ ] Channel pages (click channel name to see their videos)
- [ ] Watch Later playlist support
- [ ] Keyboard shortcuts (j/k for navigation, Enter to play, Escape to go back)
- [ ] System tray integration with minimize-to-tray
- [ ] Remember window size and position across sessions
- [ ] Dark/light theme toggle (currently dark-only)

## Technical Debt

- [ ] No test framework set up (Vitest would be the natural fit)
- [ ] No CI/CD pipeline
- [ ] No linting or formatting enforcement (should add ESLint + Prettier)
- [ ] Error handling in Zustand actions could be more granular (currently just sets a single error string)
- [ ] The `store:get`/`store:set`/`store:delete` IPC channels are overly permissive (any key can be read/written from the renderer)
- [ ] View count formatting is duplicated in `youtube-api.ts` (server-side) and could be shared
- [ ] Date formatting helper is duplicated across VideoCard and FeaturedCarousel components

## Nice-to-Haves

- [ ] Thumbnail preloading for smoother scrolling
- [ ] Video description panel (click to expand)
- [ ] Search history / recent searches
- [ ] Offline mode (cache video metadata for browsing without internet)
- [ ] Drag-and-drop playlist reordering
- [ ] Custom accent color picker
- [ ] Notification for new subscription uploads
