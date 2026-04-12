# Workflow

## Development Workflow

### Daily Development

1. Pull latest changes
2. Run `./run-source-linux.sh` to start the dev environment
3. Make changes in `src/`
4. Renderer changes hot-reload automatically via Vite HMR
5. Main process changes require a restart (kill and re-run)
6. Test your changes
7. Update `CHANGELOG.md` with what you changed
8. Commit and push

### Branching Strategy

- `main` is the stable branch
- Feature branches: `feat/description`
- Bug fixes: `fix/description`
- All changes go through pull requests

### Commit Convention

Follow conventional commits:

| Type | When to use |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `refactor` | Code restructuring without behavior change |
| `docs` | Documentation only |
| `test` | Adding or updating tests |
| `chore` | Build config, dependencies, tooling |
| `perf` | Performance improvement |
| `ci` | CI/CD changes |

Format: `type: short description`

Example: `feat: add watch later playlist support`

### Pull Request Process

1. Create a feature branch from `main`
2. Make your changes
3. Update `CHANGELOG.md`
4. Open a PR using the PR template (`.github/PULL_REQUEST_TEMPLATE.md`)
5. Fill out the type-of-change checklist
6. Verify no secrets are committed
7. Merge after review

## Build Pipeline

### Local Development

```
src/renderer/ --[Vite HMR]--> browser (port 50826)
src/main/     --[tsc]-------> dist/main/ --[Electron]--> app
```

### Production Build

```
src/renderer/ --[vite build]---------> dist/renderer/
src/main/     --[tsc]----------------> dist/main/
dist/         --[electron-builder]---> release/ (AppImage, deb)
```

## Release Cycle

1. Accumulate changes on `main`
2. When ready for release:
   - Bump version in `package.json`
   - Finalize `CHANGELOG.md` entries under the new version
   - Update `VERSION_MAP.md`
   - Run `npm run package:linux`
   - Test the packaged app
   - Create a GitHub release with artifacts
   - Tag the commit

## CI/CD

No CI/CD pipeline is currently set up. Builds and releases are done locally. If you add CI:

- Use GitHub Actions
- Build on Ubuntu (matches the target platform)
- Run `npm run build` to verify compilation
- Run tests (once a test framework is added)
- Package on release tags
