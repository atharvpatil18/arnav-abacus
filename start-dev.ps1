# Start Development Servers Script
# This script kills any processes on ports 3000 and 3001, then starts both backend and frontend

Write-Host "🚀 Starting Arnav Abacus Development Servers..." -ForegroundColor Cyan
Write-Host ""

# Function to kill process on a specific port
function Kill-ProcessOnPort {
    param([int]$Port)
    
    Write-Host "🔍 Checking for processes on port $Port..." -ForegroundColor Yellow
    $connections = netstat -ano | Select-String ":$Port" | Select-String "LISTENING"
    
    if ($connections) {
        $connections | ForEach-Object {
            $line = $_.Line.Trim()
            $parts = $line -split '\s+'
            $pid = $parts[-1]
            
            if ($pid -and $pid -match '^\d+$') {
                try {
                    Write-Host "  ❌ Killing process $pid on port $Port..." -ForegroundColor Red
                    Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
                    Start-Sleep -Milliseconds 500
                } catch {
                    Write-Host "  ⚠️  Could not kill process $pid" -ForegroundColor Red
                }
            }
        }
        Write-Host "  ✅ Port $Port is now free" -ForegroundColor Green
    } else {
        Write-Host "  ✅ Port $Port is already free" -ForegroundColor Green
    }
    Write-Host ""
}

# Kill processes on ports 3000 and 3001
Kill-ProcessOnPort -Port 3000
Kill-ProcessOnPort -Port 3001

# Wait a moment to ensure ports are freed
Start-Sleep -Seconds 1

# Start Backend (NestJS on port 3000)
Write-Host "🔧 Starting Backend Server (NestJS on port 3000)..." -ForegroundColor Cyan
$backendPath = Join-Path $PSScriptRoot "apps\api"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$backendPath'; Write-Host '🔧 Backend Server' -ForegroundColor Green; npm run dev"

# Wait for backend to initialize
Start-Sleep -Seconds 3

# Start Frontend (Next.js on port 3001)
Write-Host "🎨 Starting Frontend Server (Next.js on port 3001)..." -ForegroundColor Cyan
$frontendPath = Join-Path $PSScriptRoot "apps\web"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$frontendPath'; Write-Host '🎨 Frontend Server' -ForegroundColor Blue; npm run dev"

# Wait a moment for startup
Start-Sleep -Seconds 2

Write-Host ""
Write-Host "✅ Development servers are starting!" -ForegroundColor Green
Write-Host ""
Write-Host "📍 Backend:  http://localhost:3000" -ForegroundColor Yellow
Write-Host "📍 Frontend: http://localhost:3001" -ForegroundColor Yellow
Write-Host ""
Write-Host "💡 Two new PowerShell windows will open with the servers." -ForegroundColor Cyan
Write-Host "💡 Close those windows to stop the servers." -ForegroundColor Cyan
Write-Host ""
Write-Host "Press any key to exit this window..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
