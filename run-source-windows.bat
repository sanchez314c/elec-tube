@echo off
setlocal enabledelayedexpansion

REM ============================================
REM ElecTube - Windows Source Runner
REM Clean start script with port management
REM ============================================

REM ============================================
REM PORT CONFIGURATION (Random High Ports)
REM ============================================
set ELECTRON_DEBUG_PORT=52445
set ELECTRON_INSPECT_PORT=58700
set DEV_SERVER_PORT=50826

for /F %%a in ('echo prompt $E ^| cmd') do set "ESC=%%a"
set "RED=%ESC%[91m"
set "GREEN=%ESC%[92m"
set "YELLOW=%ESC%[93m"
set "BLUE=%ESC%[94m"
set "CYAN=%ESC%[96m"
set "MAGENTA=%ESC%[95m"
set "NC=%ESC%[0m"

echo %CYAN%
echo =====================================================
echo          ElecTube - Windows Source Runner
echo =====================================================
echo %NC%

echo %BLUE%[INFO]%NC% Working directory: %CD%
echo %BLUE%[INFO]%NC% Configured ports:
echo   - Dev Server:       %DEV_SERVER_PORT%
echo   - Electron Debug:   %ELECTRON_DEBUG_PORT%
echo   - Electron Inspect: %ELECTRON_INSPECT_PORT%
echo.

REM ============================================
REM CLEANUP PHASE
REM ============================================
echo %CYAN%=== CLEANUP PHASE ===%NC%
echo %BLUE%[CLEANUP]%NC% Killing processes on configured ports...

for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":%ELECTRON_DEBUG_PORT%" 2^>nul') do (
    echo %YELLOW%[CLEANUP]%NC% Killing PID %%a on port %ELECTRON_DEBUG_PORT%
    taskkill /F /PID %%a 2>nul
)
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":%ELECTRON_INSPECT_PORT%" 2^>nul') do (
    echo %YELLOW%[CLEANUP]%NC% Killing PID %%a on port %ELECTRON_INSPECT_PORT%
    taskkill /F /PID %%a 2>nul
)
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":%DEV_SERVER_PORT%" 2^>nul') do (
    echo %YELLOW%[CLEANUP]%NC% Killing PID %%a on port %DEV_SERVER_PORT%
    taskkill /F /PID %%a 2>nul
)
taskkill /F /IM electron.exe 2>nul
echo.

REM ============================================
REM VERIFICATION PHASE
REM ============================================
echo %CYAN%=== VERIFICATION PHASE ===%NC%
echo %BLUE%[CHECK]%NC% Verifying dependencies...

where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo %RED%[ERROR]%NC% Node.js is not installed!
    echo   Install from: https://nodejs.org
    pause
    exit /b 1
)
for /f "tokens=*" %%i in ('node --version') do echo %GREEN%[OK]%NC% Node.js %%i

where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo %RED%[ERROR]%NC% npm is not installed!
    pause
    exit /b 1
)
for /f "tokens=*" %%i in ('npm --version') do echo %GREEN%[OK]%NC% npm %%i

REM Check YouTube API key
if "%YOUTUBE_API_KEY%"=="" (
    echo %YELLOW%[WARNING]%NC% YOUTUBE_API_KEY not set - API calls will fail
) else (
    echo %GREEN%[OK]%NC% YouTube API Key configured
)

REM Check if node_modules exists
if not exist "node_modules" (
    echo %YELLOW%[SETUP]%NC% Installing dependencies...
    call npm install
)

REM Download yt-dlp for Windows if not present
if not exist "bin" mkdir bin
if not exist "bin\yt-dlp.exe" (
    echo %YELLOW%[SETUP]%NC% Downloading yt-dlp...
    curl -L "https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp.exe" -o "bin\yt-dlp.exe"
)

REM Check for mpv
where mpv >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo %YELLOW%[WARN]%NC% mpv not found. Install from: https://mpv.io/installation/
) else (
    echo %GREEN%[OK]%NC% mpv found
)
echo.

REM ============================================
REM BUILD PHASE
REM ============================================
echo %CYAN%=== BUILD PHASE ===%NC%
echo %YELLOW%[BUILD]%NC% Compiling main process...
call npx tsc -p tsconfig.main.json
echo %GREEN%[BUILD]%NC% Main process compiled
echo.

REM ============================================
REM LAUNCH PHASE
REM ============================================
echo %CYAN%=== LAUNCH PHASE ===%NC%
echo %GREEN%[START]%NC% Launching ElecTube...
echo.

set ELECTUBE_YTDLP_PATH=%CD%\bin\yt-dlp.exe

REM Start Vite dev server
start /B "Vite" npm run dev:renderer

REM Wait for Vite to be ready
echo %BLUE%[WAIT]%NC% Waiting for Vite dev server...
:waitloop
timeout /t 1 /nobreak >nul
curl -s http://localhost:%DEV_SERVER_PORT% >nul 2>nul
if %ERRORLEVEL% NEQ 0 goto waitloop
echo %GREEN%[VITE]%NC% Server running at http://localhost:%DEV_SERVER_PORT%

REM Start Electron
echo %GREEN%[ELECTRON]%NC% Launching application...
call npx electron .

endlocal
