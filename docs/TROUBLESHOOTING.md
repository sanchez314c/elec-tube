# Troubleshooting

## Startup Issues

### "YOUTUBE_API_KEY not found" warning

Your API key isn't in the environment. Export it before launching:

```bash
export YOUTUBE_API_KEY="your_key_here"
```

Add it to `~/.bashrc` so it persists across sessions. Reload with `source ~/.bashrc`.

### Electron crashes with "credentials.cc: Permission denied"

Linux sandbox issue. The launch script already passes `--no-sandbox`, but if you're running manually:

```bash
# Option 1: Enable unprivileged user namespaces
sudo sysctl -w kernel.unprivileged_userns_clone=1

# Option 2: Run with --no-sandbox flag
npx electron --no-sandbox .
```

### Port 50826 already in use

The launch script tries to kill stale Vite processes. If it persists:

```bash
lsof -ti:50826 | xargs kill
```

Then restart.

### "Cannot find module" errors after pulling changes

Delete `node_modules` and reinstall:

```bash
rm -rf node_modules
npm install
```

## Authentication Issues

### OAuth login window is blank or shows an error

1. Check that your OAuth client ID type is **Desktop app**, not "Web application"
2. Make sure your Google account is added as a test user in the OAuth consent screen settings (Google Cloud Console > APIs & Services > OAuth consent screen)
3. Verify both `YOUTUBE_CLIENT_ID` and `YOUTUBE_CLIENT_SECRET` are exported

### "OAuth not configured" warning in the UI

The app can't find `YOUTUBE_CLIENT_ID` or `YOUTUBE_CLIENT_SECRET` in your environment. These are optional but required for subscriptions, liked videos, and playlists.

### Login succeeds but subscriptions don't load

Check the terminal for error messages. Common causes:
- The OAuth scopes changed and your token is stale. Log out and log back in.
- Your YouTube API quota is exhausted. Check the Google Cloud Console for quota usage.

### Token refresh fails silently

If authenticated features stop working after a while, your refresh token may have been revoked. Log out (click profile > Sign out) and log back in.

## Video Playback Issues

### mpv doesn't launch when clicking a video

1. Verify mpv is present: `ls -la bin/mpv.AppImage`
2. Verify it's executable: `chmod +x bin/mpv.AppImage`
3. Test mpv manually: `./bin/mpv.AppImage --version`
4. Check if `ELECTUBE_MPV_PATH` is set correctly (the launch script sets it automatically)

### yt-dlp errors or "format not available"

Update yt-dlp:

```bash
curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o bin/yt-dlp
chmod +x bin/yt-dlp
```

The launch script auto-updates yt-dlp if the binary is older than 7 days.

### Videos play but audio is missing

The format selection (`bestvideo[height<=?1080]+bestaudio/best`) should grab both streams. If audio is missing, try updating yt-dlp (above). Some videos may have DRM that prevents extraction.

## API Issues

### "Watch history access restricted"

This is a YouTube API limitation. Many accounts have watch history access blocked at the API level. The app returns an empty list gracefully. There's no fix on the ElecTube side.

### Search returns no results

1. Check that `YOUTUBE_API_KEY` is valid
2. Check your API quota in Google Cloud Console
3. The YouTube API enforces daily quotas (10,000 units/day by default). Each search costs 100 units.

### "401 Authentication required" errors

Your access token expired and refresh failed. Log out and log back in. If it keeps happening, check that your OAuth client ID hasn't been deleted or regenerated in Google Cloud Console.

## Build Issues

### TypeScript compilation errors in main process

Make sure you're using the correct config:

```bash
npx tsc -p tsconfig.main.json
```

Don't run `tsc` without specifying the config, as it'll use `tsconfig.json` (the renderer config, which has `noEmit: true`).

### Vite build fails with module resolution errors

Clear the Vite cache:

```bash
rm -rf node_modules/.vite
npm run build:renderer
```

### electron-builder fails

1. Make sure `dist/` exists (run `npm run build` first)
2. Check that `resources/icon.png` exists
3. On some systems, electron-builder needs `rpm` or `fakeroot` packages for certain targets

## Platform Issues

### App looks wrong on HiDPI displays

Electron should handle scaling automatically. If it doesn't, try launching with:

```bash
GDK_SCALE=2 ./run-source-linux.sh
```

### Window controls don't work

The custom title bar uses `titleBarStyle: 'hidden'` and `frame: false`. Window controls are rendered as React components. If they stop responding, check for JavaScript errors in the DevTools console.
