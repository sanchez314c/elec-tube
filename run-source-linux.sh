#!/bin/bash
# ElecTube Launch Script - Linux Source Build
# Self-contained environment with bundled mpv/yt-dlp

set -e
set -o pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

BIN_DIR="$SCRIPT_DIR/bin"
YTDLP_BIN="$BIN_DIR/yt-dlp"
MPV_APPIMAGE="$BIN_DIR/mpv.AppImage"

# URLs for binary downloads
YTDLP_URL="https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp"
MPV_APPIMAGE_URL="https://github.com/pkivolowitz/mpv-appimage/releases/download/v0.36.0/mpv-0.36.0-x86_64.AppImage"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${CYAN}"
echo "╔═══════════════════════════════════════════╗"
echo "║          ELECTUBE LAUNCH SEQUENCE         ║"
echo "║        Self-Contained Environment         ║"
echo "╚═══════════════════════════════════════════╝"
echo -e "${NC}"

# Function to kill processes
cleanup() {
    echo -e "${YELLOW}[CLEANUP] Terminating existing processes...${NC}"

    # Kill any existing Vite dev server on port 50826
    if lsof -ti:50826 > /dev/null 2>&1; then
        echo -e "  Killing Vite server on port 50826..."
        kill $(lsof -ti:50826) 2>/dev/null || true
        sleep 1
    fi

    # Kill any existing Electron processes for ElecTube
    if pgrep -f "electron.*electube" > /dev/null 2>&1; then
        echo -e "  Killing existing Electron processes..."
        pkill -f "electron.*electube" 2>/dev/null || true
        sleep 1
    fi

    echo -e "${GREEN}[CLEANUP] Complete${NC}"
}

# Function to setup bin directory and download binaries
setup_binaries() {
    echo -e "${YELLOW}[BINARIES] Setting up self-contained environment...${NC}"

    mkdir -p "$BIN_DIR"

    # Download yt-dlp if not present or update if older than 7 days
    if [ ! -f "$YTDLP_BIN" ] || [ $(find "$YTDLP_BIN" -mtime +7 2>/dev/null | wc -l) -gt 0 ]; then
        echo -e "  Downloading yt-dlp..."
        curl -L "$YTDLP_URL" -o "$YTDLP_BIN" --progress-bar
        chmod +x "$YTDLP_BIN"
        echo -e "  ${GREEN}yt-dlp installed${NC}"
    else
        echo -e "  yt-dlp: $($YTDLP_BIN --version 2>/dev/null || echo 'present')"
    fi

    # Download mpv AppImage if not present
    if [ ! -f "$MPV_APPIMAGE" ]; then
        echo -e "  Downloading mpv AppImage..."
        curl -L "$MPV_APPIMAGE_URL" -o "$MPV_APPIMAGE" --progress-bar
        chmod +x "$MPV_APPIMAGE"
        echo -e "  ${GREEN}mpv AppImage installed${NC}"
    else
        echo -e "  mpv: AppImage present"
    fi

    # Verify binaries work
    if [ -x "$YTDLP_BIN" ]; then
        echo -e "  ${GREEN}✓${NC} yt-dlp: $($YTDLP_BIN --version 2>/dev/null || echo 'ready')"
    else
        echo -e "  ${RED}✗${NC} yt-dlp: Failed to install"
        exit 1
    fi

    if [ -x "$MPV_APPIMAGE" ]; then
        echo -e "  ${GREEN}✓${NC} mpv: ready"
    else
        echo -e "  ${RED}✗${NC} mpv: Failed to install"
        exit 1
    fi

    # Export paths for the application
    export ELECTUBE_YTDLP_PATH="$YTDLP_BIN"
    export ELECTUBE_MPV_PATH="$MPV_APPIMAGE"
    export PATH="$BIN_DIR:$PATH"

    echo -e "${GREEN}[BINARIES] Self-contained environment ready${NC}"
}

# Function to check core dependencies
check_deps() {
    echo -e "${YELLOW}[CHECK] Verifying dependencies...${NC}"

    # Check Node.js
    if ! command -v node &> /dev/null; then
        echo -e "${RED}[ERROR] Node.js not found${NC}"
        exit 1
    fi
    echo -e "  Node.js: $(node --version)"

    # Check npm
    if ! command -v npm &> /dev/null; then
        echo -e "${RED}[ERROR] npm not found${NC}"
        exit 1
    fi
    echo -e "  npm: $(npm --version)"

    # Check YouTube API key (sourced from bashrc)
    if [ -z "$YOUTUBE_API_KEY" ]; then
        echo -e "${YELLOW}[WARNING] YOUTUBE_API_KEY not set - API calls will fail${NC}"
    else
        echo -e "  YouTube API Key: ****${YOUTUBE_API_KEY: -4}"
    fi

    echo -e "${GREEN}[CHECK] Dependencies verified${NC}"
}

# Function to ensure node_modules exist
check_modules() {
    if [ ! -d "node_modules" ]; then
        echo -e "${YELLOW}[INSTALL] Installing dependencies...${NC}"
        npm install
        echo -e "${GREEN}[INSTALL] Complete${NC}"
    fi
}

# Function to compile TypeScript
compile_main() {
    echo -e "${YELLOW}[BUILD] Compiling main process...${NC}"
    npx tsc -p tsconfig.main.json
    echo -e "${GREEN}[BUILD] Main process compiled${NC}"
}

# Function to start Vite dev server
start_vite() {
    echo -e "${YELLOW}[VITE] Starting development server...${NC}"
    npm run dev:renderer &
    VITE_PID=$!

    # Wait for Vite to be ready
    local retries=0
    while ! curl -s http://localhost:50826 > /dev/null 2>&1; do
        sleep 1
        retries=$((retries + 1))
        if [ $retries -gt 30 ]; then
            echo -e "${RED}[ERROR] Vite server failed to start${NC}"
            exit 1
        fi
    done

    echo -e "${GREEN}[VITE] Server running at http://localhost:50826${NC}"
}

# Function to start Electron
start_electron() {
    echo -e "${YELLOW}[ELECTRON] Launching application...${NC}"
    sleep 1
    # Pass binary paths via environment and use --no-sandbox for Linux
    ELECTUBE_YTDLP_PATH="$YTDLP_BIN" \
    ELECTUBE_MPV_PATH="$MPV_APPIMAGE" \
    npx electron --no-sandbox . &
    ELECTRON_PID=$!
    echo -e "${GREEN}[ELECTRON] Application launched (PID: $ELECTRON_PID)${NC}"
}

# Trap for cleanup on exit
trap cleanup EXIT

# Main execution
echo ""
cleanup
echo ""
setup_binaries
echo ""
check_deps
echo ""
check_modules
echo ""
compile_main
echo ""
start_vite
echo ""
start_electron
echo ""

echo -e "${CYAN}"
echo "╔═══════════════════════════════════════════╗"
echo "║         ELECTUBE INITIALIZATION           ║"
echo "║              COMPLETE                     ║"
echo "╠═══════════════════════════════════════════╣"
echo "║  Self-contained binaries in ./bin/        ║"
echo "║  Press Ctrl+C to terminate all processes  ║"
echo "╚═══════════════════════════════════════════╝"
echo -e "${NC}"

# Wait for processes
wait
