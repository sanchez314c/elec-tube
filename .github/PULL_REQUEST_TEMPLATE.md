## What does this PR do?

Brief description of the change and why it's needed.

## Type of change

- [ ] Bug fix
- [ ] New feature
- [ ] Refactor (no behavior change)
- [ ] UI/styling update
- [ ] Documentation
- [ ] Build/config change

## Checklist

- [ ] Code is TypeScript (no plain JS in `src/`)
- [ ] New IPC channels follow `namespace:action` naming
- [ ] New IPC handlers use `ipcMain.handle()`, not `ipcMain.on()`
- [ ] Preload bridge updated if new IPC channels were added
- [ ] TypeScript types updated in `src/renderer/types/electron.d.ts`
- [ ] No API keys, secrets, or tokens hardcoded in source
- [ ] `contextIsolation` is still `true`, `nodeIntegration` is still `false`
- [ ] Tested with `./run-source-linux.sh`
- [ ] `CHANGELOG.md` updated

## How to test

Steps someone can follow to verify this works:

1. ...
2. ...
3. ...

## Screenshots

If this changes the UI, add before/after screenshots.

## Notes

Anything reviewers should know. Edge cases, known limitations, follow-up work, etc.
