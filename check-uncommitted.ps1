#!/usr/bin/env pwsh
# Script to check for uncommitted changes in the repository
# Usage: ./check-uncommitted.ps1 [-Strict]
#
# Exit codes:
#   0 - No uncommitted changes
#   1 - Uncommitted changes detected
#   2 - Error occurred

param(
    [switch]$Strict = $false
)

$ErrorActionPreference = "Stop"

# Colors for output
function Write-Success { Write-Host $args -ForegroundColor Green }
function Write-Info { Write-Host $args -ForegroundColor Cyan }
function Write-Warning { Write-Host $args -ForegroundColor Yellow }
function Write-Error { Write-Host $args -ForegroundColor Red }

Write-Info "🔍 Checking for uncommitted changes..."
Write-Host ""

# Check if we're in a git repository
try {
    git rev-parse --git-dir | Out-Null
} catch {
    Write-Error "✗ Error: Not a git repository"
    exit 2
}

# Check for uncommitted changes
$statusOutput = git status --porcelain
if ($statusOutput) {
    Write-Warning "⚠  Uncommitted changes detected:"
    Write-Host ""
    
    # Show status
    git status --short
    Write-Host ""
    
    # Count changes
    $modifiedFiles = @(git diff --name-only).Count
    $stagedFiles = @(git diff --cached --name-only).Count
    $untrackedFiles = @(git ls-files --others --exclude-standard).Count
    
    Write-Host "Summary:"
    Write-Host "  - Modified files: $modifiedFiles"
    Write-Host "  - Staged files: $stagedFiles"
    Write-Host "  - Untracked files: $untrackedFiles"
    Write-Host ""
    
    if ($Strict) {
        Write-Error "✗ Cannot proceed in strict mode with uncommitted changes"
        exit 1
    } else {
        Write-Warning "ℹ  You can:"
        Write-Host "  1. Commit your changes: git add . && git commit -m 'your message'"
        Write-Host "  2. Stash your changes: git stash"
        Write-Host "  3. Discard your changes: git checkout -- ."
        Write-Host ""
        exit 1
    }
} else {
    Write-Success "✓ Working tree is clean"
    Write-Host "No uncommitted changes detected."
    exit 0
}
