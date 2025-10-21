#!/usr/bin/env pwsh
# 🚀 Arnav Abacus Academy - Automated Setup Script
# This script automates the setup process for Windows PowerShell

param(
    [switch]$SkipDependencies = $false,
    [switch]$SkipDatabase = $false,
    [switch]$Production = $false
)

$ErrorActionPreference = "Stop"

# Colors for output
function Write-Success { Write-Host $args -ForegroundColor Green }
function Write-Info { Write-Host $args -ForegroundColor Cyan }
function Write-Warning { Write-Host $args -ForegroundColor Yellow }
function Write-Error { Write-Host $args -ForegroundColor Red }

Write-Info "🚀 Arnav Abacus Academy - Automated Setup"
Write-Info "=========================================`n"

# Check Node.js
Write-Info "Checking prerequisites..."
try {
    $nodeVersion = node --version
    Write-Success "✓ Node.js found: $nodeVersion"
} catch {
    Write-Error "✗ Node.js not found. Please install Node.js 18+ from https://nodejs.org/"
    exit 1
}

# Check npm
try {
    $npmVersion = npm --version
    Write-Success "✓ npm found: $npmVersion"
} catch {
    Write-Error "✗ npm not found"
    exit 1
}

# Check PostgreSQL
try {
    $pgVersion = psql --version
    Write-Success "✓ PostgreSQL found: $pgVersion"
} catch {
    Write-Warning "⚠ PostgreSQL not found. You'll need to set up the database manually or install PostgreSQL."
}

# Check if Prisma CLI is available
try {
    npx prisma --version | Out-Null
    Write-Success "✓ Prisma CLI available"
} catch {
    Write-Warning "⚠ Prisma CLI not found, will be installed with dependencies"
}

Write-Info "`nStep 1: Installing dependencies..."
if (-not $SkipDependencies) {
    # Install root dependencies
    Write-Info "Installing root dependencies..."
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Failed to install root dependencies"
        exit 1
    }
    Write-Success "✓ Root dependencies installed"

    # Install API dependencies
    Write-Info "Installing API dependencies..."
    Set-Location apps/api
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Failed to install API dependencies"
        exit 1
    }
    Write-Success "✓ API dependencies installed"
    Set-Location ../..

    # Install Web dependencies
    Write-Info "Installing Web dependencies..."
    Set-Location apps/web
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Failed to install Web dependencies"
        exit 1
    }
    Write-Success "✓ Web dependencies installed"
    Set-Location ../..
} else {
    Write-Warning "Skipping dependency installation"
}

Write-Info "`nStep 2: Setting up environment files..."

# Setup API .env
$apiEnvPath = "apps/api/.env"
$apiEnvExamplePath = "apps/api/.env.example"

if (-not (Test-Path $apiEnvPath)) {
    if (Test-Path $apiEnvExamplePath) {
        Copy-Item $apiEnvExamplePath $apiEnvPath
        Write-Success "✓ Created apps/api/.env from example"
        Write-Warning "⚠ Please edit apps/api/.env with your configuration"
    } else {
        Write-Info "Creating default apps/api/.env..."
        $defaultApiEnv = @"
DATABASE_URL="postgresql://arnav_user:password@localhost:5432/arnav_abacus?schema=public"
JWT_SECRET="change-this-secret-key-in-production-$(Get-Random)"
JWT_EXPIRES_IN="7d"
PORT=3001
NODE_ENV="development"

# Email Configuration
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER="your-email@gmail.com"
EMAIL_PASSWORD="your-app-password"
EMAIL_FROM="Arnav Abacus Academy <noreply@arnavabacus.com>"

# SMS Configuration
TWILIO_ACCOUNT_SID="your_account_sid"
TWILIO_AUTH_TOKEN="your_auth_token"
TWILIO_PHONE_NUMBER="+1234567890"

CORS_ORIGIN="http://localhost:3000"
"@
        $defaultApiEnv | Out-File -FilePath $apiEnvPath -Encoding utf8
        Write-Success "✓ Created default apps/api/.env"
        Write-Warning "⚠ Please edit apps/api/.env with your database and service credentials"
    }
} else {
    Write-Success "✓ apps/api/.env already exists"
}

# Setup Web .env
$webEnvPath = "apps/web/.env.local"
$webEnvExamplePath = "apps/web/.env.example"

if (-not (Test-Path $webEnvPath)) {
    if (Test-Path $webEnvExamplePath) {
        Copy-Item $webEnvExamplePath $webEnvPath
        Write-Success "✓ Created apps/web/.env.local from example"
    } else {
        Write-Info "Creating default apps/web/.env.local..."
        $defaultWebEnv = @"
NEXT_PUBLIC_API_URL="http://localhost:3001"
NEXT_PUBLIC_APP_NAME="Arnav Abacus Academy"
NEXT_PUBLIC_APP_VERSION="1.0.0"
NEXT_PUBLIC_ENABLE_NOTIFICATIONS=true
NEXT_PUBLIC_ENABLE_SMS=true
NEXT_PUBLIC_ENABLE_EMAIL=true
"@
        $defaultWebEnv | Out-File -FilePath $webEnvPath -Encoding utf8
        Write-Success "✓ Created default apps/web/.env.local"
    }
} else {
    Write-Success "✓ apps/web/.env.local already exists"
}

Write-Info "`nStep 3: Database setup..."
if (-not $SkipDatabase) {
    Write-Info "Checking database connection..."
    
    Set-Location apps/api
    
    # Test database connection
    $dbTest = npx prisma db pull --schema=prisma/schema.prisma 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Success "✓ Database connection successful"
    } else {
        Write-Warning "⚠ Could not connect to database. Please ensure:"
        Write-Warning "  1. PostgreSQL is running"
        Write-Warning "  2. Database 'arnav_abacus' exists"
        Write-Warning "  3. DATABASE_URL in .env is correct"
        Write-Info "`nTo create the database, run:"
        Write-Info '  psql -U postgres -c "CREATE DATABASE arnav_abacus;"'
        Write-Info '  psql -U postgres -c "CREATE USER arnav_user WITH PASSWORD ''password'';"'
        Write-Info '  psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE arnav_abacus TO arnav_user;"'
        
        $continue = Read-Host "`nDo you want to continue without database setup? (y/n)"
        if ($continue -ne "y") {
            exit 1
        }
    }
    
    # Run migrations
    Write-Info "Running database migrations..."
    npx prisma migrate deploy
    if ($LASTEXITCODE -eq 0) {
        Write-Success "✓ Database migrations completed"
    } else {
        Write-Warning "⚠ Migration failed. You may need to run 'npx prisma migrate dev' manually"
    }
    
    # Generate Prisma Client
    Write-Info "Generating Prisma Client..."
    npx prisma generate
    if ($LASTEXITCODE -eq 0) {
        Write-Success "✓ Prisma Client generated"
    } else {
        Write-Error "✗ Failed to generate Prisma Client"
        exit 1
    }
    
    Set-Location ../..
} else {
    Write-Warning "Skipping database setup"
}

Write-Info "`nStep 4: Building applications..."
if ($Production) {
    # Build API
    Write-Info "Building API..."
    Set-Location apps/api
    npm run build
    if ($LASTEXITCODE -eq 0) {
        Write-Success "✓ API built successfully"
    } else {
        Write-Error "✗ API build failed"
        exit 1
    }
    Set-Location ../..
    
    # Build Web
    Write-Info "Building Web app..."
    Set-Location apps/web
    npm run build
    if ($LASTEXITCODE -eq 0) {
        Write-Success "✓ Web app built successfully"
    } else {
        Write-Error "✗ Web build failed"
        exit 1
    }
    Set-Location ../..
} else {
    Write-Info "Skipping production build (development mode)"
}

Write-Success "`n✅ Setup completed successfully!"
Write-Info "`nNext steps:"
Write-Info "1. Review and edit configuration files:"
Write-Info "   - apps/api/.env (database, email, SMS credentials)"
Write-Info "   - apps/web/.env.local (API URL)"
Write-Info ""
Write-Info "2. Start the development servers:"
Write-Info "   Backend:  cd apps/api && npm run start:dev"
Write-Info "   Frontend: cd apps/web && npm run dev"
Write-Info ""
Write-Info "3. Access the application:"
Write-Info "   Frontend: http://localhost:3000"
Write-Info "   Backend:  http://localhost:3001"
Write-Info "   API Docs: http://localhost:3001/api"
Write-Info ""
Write-Info "4. Default login (after seeding):"
Write-Info "   Email:    admin@arnavabacus.com"
Write-Info "   Password: admin123"
Write-Info ""
Write-Info "📚 For detailed documentation, see SETUP.md"
Write-Success "`n🎉 Happy coding!"
