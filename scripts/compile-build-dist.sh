#!/bin/bash
#
# ElecTube — Compile → Build → Dist Pipeline
# Produces distributable packages for Linux, macOS, and Windows
#

set -e
set -o pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_DIR"

# ============================================
# COLORS
# ============================================
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# ============================================
# DEFAULTS
# ============================================
PLATFORM="linux"
ARCH=""
QUICK=false
NO_CLEAN=false
NO_TEMP_CLEAN=false
NO_BLOAT_CHECK=false
CORES=$(nproc 2>/dev/null || sysctl -n hw.ncpu 2>/dev/null || echo 4)

# ============================================
# USAGE
# ============================================
usage() {
    echo -e "${CYAN}ElecTube — Compile → Build → Dist${NC}"
    echo ""
    echo "Usage: $0 [options]"
    echo ""
    echo "Options:"
    echo "  --platform <mac|win|linux|all>   Target platform (default: linux)"
    echo "  --arch <x64|arm64|universal>     Target architecture"
    echo "  --quick                          Skip type-check and bloat check"
    echo "  --no-clean                       Skip cleaning old artifacts"
    echo "  --no-temp-clean                  Skip temp file cleanup"
    echo "  --no-bloat-check                 Skip node_modules size check"
    echo "  --help                           Show this help"
    echo ""
    echo "Examples:"
    echo "  $0                               # Linux deb + AppImage"
    echo "  $0 --platform mac                # macOS dmg"
    echo "  $0 --platform all                # All platforms"
    echo "  $0 --quick                       # Fast build, skip checks"
    exit 0
}

# ============================================
# PARSE ARGS
# ============================================
while [[ $# -gt 0 ]]; do
    case $1 in
        --platform) PLATFORM="$2"; shift 2 ;;
        --arch) ARCH="$2"; shift 2 ;;
        --quick) QUICK=true; shift ;;
        --no-clean) NO_CLEAN=true; shift ;;
        --no-temp-clean) NO_TEMP_CLEAN=true; shift ;;
        --no-bloat-check) NO_BLOAT_CHECK=true; shift ;;
        --help) usage ;;
        *) echo "Unknown option: $1"; usage ;;
    esac
done

# ============================================
# FUNCTIONS
# ============================================
timestamp() { date '+%H:%M:%S'; }
step() { echo -e "\n${CYAN}[$(timestamp)]${NC} ${BLUE}▸${NC} $1"; }
ok() { echo -e "  ${GREEN}✓${NC} $1"; }
warn() { echo -e "  ${YELLOW}!${NC} $1"; }
fail() { echo -e "  ${RED}✗${NC} $1"; exit 1; }

# ============================================
# HEADER
# ============================================
echo -e "${CYAN}"
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║       ElecTube — Compile → Build → Dist Pipeline         ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo -e "${NC}"
echo -e "Platform: ${GREEN}${PLATFORM}${NC}  Cores: ${GREEN}${CORES}${NC}  Quick: ${QUICK}"
echo ""

# ============================================
# PHASE 1: REQUIREMENTS CHECK
# ============================================
step "Checking requirements..."
command -v node &>/dev/null || fail "Node.js not found"
ok "Node.js $(node --version)"
command -v npm &>/dev/null || fail "npm not found"
ok "npm $(npm --version)"

# ============================================
# PHASE 2: TEMP CLEANUP
# ============================================
if [ "$NO_TEMP_CLEAN" = false ]; then
    step "Cleaning system temp files..."
    TEMP_DIR="${TMPDIR:-/tmp}"
    CLEANED=$(find "$TEMP_DIR" -maxdepth 1 -name "electron-*" -mtime +1 -type d 2>/dev/null | wc -l)
    find "$TEMP_DIR" -maxdepth 1 -name "electron-*" -mtime +1 -type d -exec rm -rf {} + 2>/dev/null || true
    ok "Cleaned $CLEANED stale Electron temp dirs"
fi

# ============================================
# PHASE 3: BLOAT CHECK
# ============================================
if [ "$NO_BLOAT_CHECK" = false ] && [ "$QUICK" = false ]; then
    step "Checking node_modules size..."
    NM_SIZE=$(du -sh node_modules 2>/dev/null | cut -f1)
    ok "node_modules: $NM_SIZE"
fi

# ============================================
# PHASE 4: CLEAN ARTIFACTS
# ============================================
if [ "$NO_CLEAN" = false ]; then
    step "Cleaning old build artifacts..."
    rm -rf dist/ release/ out/ 2>/dev/null || true
    ok "Cleaned dist/, release/, out/"
fi

# ============================================
# PHASE 5: NPM INSTALL
# ============================================
step "Ensuring dependencies..."
if [ ! -d "node_modules" ]; then
    npm install
    ok "Dependencies installed"
else
    ok "node_modules present"
fi

# ============================================
# PHASE 6: COMPILE (TypeScript type-check)
# ============================================
if [ "$QUICK" = false ]; then
    step "TypeScript compile (main process)..."
    npx tsc -p tsconfig.main.json
    ok "Main process compiled to dist/main/"
fi

# ============================================
# PHASE 7: BUILD (Vite + tsc)
# ============================================
step "Building application..."
npm run build
ok "Renderer built (Vite) + Main compiled (tsc)"

# ============================================
# PHASE 8: DIST (electron-builder)
# ============================================
step "Packaging with electron-builder..."
export ELECTRON_BUILDER_PARALLELISM=$CORES

case $PLATFORM in
    linux)
        npx electron-builder --linux deb AppImage ${ARCH:+--$ARCH}
        ;;
    mac)
        npx electron-builder --mac dmg ${ARCH:+--$ARCH}
        ;;
    win)
        npx electron-builder --win nsis ${ARCH:+--$ARCH}
        ;;
    all)
        npx electron-builder --linux deb AppImage --mac dmg --win nsis ${ARCH:+--$ARCH}
        ;;
    *)
        fail "Unknown platform: $PLATFORM"
        ;;
esac
ok "Packaging complete"

# ============================================
# PHASE 9: SIZE REPORT
# ============================================
step "Build results:"
echo ""
echo -e "  ${CYAN}File                                          Size${NC}"
echo -e "  ─────────────────────────────────────────────────────"
find release/ dist/ out/ -maxdepth 2 \( -name "*.deb" -o -name "*.AppImage" -o -name "*.dmg" -o -name "*.exe" -o -name "*.nsis" \) 2>/dev/null | while read f; do
    SIZE=$(du -h "$f" | cut -f1)
    printf "  %-46s %s\n" "$(basename "$f")" "$SIZE"
done
echo ""

# ============================================
# DONE
# ============================================
echo -e "${GREEN}"
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║                   BUILD COMPLETE                          ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo -e "${NC}"
echo "To run the application:"
echo "  Linux:   ./run-source-linux.sh"
echo "  macOS:   ./run-source-mac.sh"
echo "  Windows: run-source-windows.bat"
echo ""
