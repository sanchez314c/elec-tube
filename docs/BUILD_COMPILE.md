# Build & Compile

ElecTube has a split build pipeline: Vite handles the React renderer, TypeScript compiler handles the Electron main process, and electron-builder packages everything for distribution.

## Build System Overview

| Component | Tool | Config | Input | Output |
|-----------|------|--------|-------|--------|
| Renderer | Vite 5 + @vitejs/plugin-react | `vite.config.ts` | `src/renderer/` | `dist/renderer/` |
| Main process | tsc (TypeScript 5.3) | `tsconfig.main.json` | `src/main/` | `dist/main/` |
| Packaging | electron-builder 24 | `package.json` build field | `dist/` + `resources/` | `release/` |

## Development Build

In development, the renderer runs on the Vite dev server (port 50826) with hot module replacement. Electron loads `http://localhost:50826` instead of local files.

```bash
# Run both processes concurrently
npm run dev

# Or separately
npm run dev:renderer   # Vite dev server on port 50826
npm run dev:main       # tsc compile + launch Electron
```

The launch script (`run-source-linux.sh`) wraps this with binary bootstrapping, dependency checks, and process management.

## Production Build

```bash
npm run build
```

This runs two steps sequentially:
1. `vite build` compiles the renderer from `src/renderer/` to `dist/renderer/` (minified, tree-shaken)
2. `tsc -p tsconfig.main.json` compiles the main process from `src/main/` to `dist/main/`

To build components individually:

```bash
npm run build:renderer    # Vite build only
npm run build:main        # TypeScript compile only
```

## TypeScript Configuration

Two separate configs are required because the main process runs in Node.js (CommonJS) while the renderer runs in Chromium (ESM, bundled by Vite).

### Renderer (`tsconfig.json`)

| Setting | Value | Why |
|---------|-------|-----|
| target | ES2022 | Modern browser features in Chromium |
| module | ESNext | Vite handles module bundling |
| moduleResolution | bundler | Vite's resolution strategy |
| jsx | react-jsx | React 18 JSX transform |
| noEmit | true | Vite handles output, not tsc |
| strict | true | Full type checking |

Path alias: `@/*` maps to `src/renderer/*`

### Main Process (`tsconfig.main.json`)

| Setting | Value | Why |
|---------|-------|-----|
| target | ES2022 | Node.js 20+ supports ES2022 |
| module | CommonJS | Electron main process runs CommonJS |
| moduleResolution | node | Standard Node.js resolution |
| outDir | dist/main | Compiled output directory |
| declaration | true | Generate .d.ts files |
| esModuleInterop | true | Default imports from CJS modules |

## Packaging

```bash
npm run package            # Build + electron-builder (all targets)
npm run package:linux      # Build + electron-builder --linux only
```

### electron-builder Configuration

Defined in `package.json` under the `build` key:

| Setting | Value |
|---------|-------|
| appId | `com.electube.app` |
| productName | `ElecTube` |
| Output directory | `release/` |
| Linux targets | AppImage, deb |
| Linux category | Video |
| Included files | `dist/**/*`, `resources/**/*` |

### Output Formats

| Format | Description | Location |
|--------|-------------|----------|
| AppImage | Portable Linux executable, no install needed | `release/` |
| deb | Debian package for apt-based distros | `release/` |

### What Gets Packaged

The packaged app includes:
- `dist/main/` (compiled main process)
- `dist/renderer/` (built React app)
- `resources/` (app icon)
- `node_modules/` (production dependencies only)

**Not included:** `bin/` directory (mpv and yt-dlp). Users of the packaged app need mpv and yt-dlp on their system PATH, or you can add a custom build step to bundle them.

## Vite Configuration

Defined in `vite.config.ts`:

| Setting | Value |
|---------|-------|
| Root | `src/renderer` |
| Base | `./` (relative paths for file:// protocol) |
| Output | `../../dist/renderer` |
| Dev server port | 50826 (strict) |
| Path alias | `@` maps to `src/renderer` |
| Plugin | @vitejs/plugin-react (JSX transform + fast refresh) |

## PostCSS Pipeline

`postcss.config.js` runs TailwindCSS and Autoprefixer on all CSS. Tailwind processes `src/renderer/**/*.{js,ts,jsx,tsx}` for class detection.
