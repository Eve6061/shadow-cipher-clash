# Lucky Dice - Quick Start Script
# UTF-8 Encoding

param(
    [switch]$All,
    [switch]$Node,
    [switch]$Deploy,
    [switch]$Frontend,
    [switch]$Test
)

$ErrorActionPreference = "Stop"
$currentPath = Get-Location

Write-Host ""
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host "    Lucky Dice Project - Quick Start" -ForegroundColor Green
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host ""

# Check if in correct directory
if (-not (Test-Path ".\hardhat.config.ts")) {
    Write-Host "ERROR: Please run this script in project root!" -ForegroundColor Red
    exit 1
}

# Function to start Hardhat node
function Start-HardhatNode {
    Write-Host "[Step 1] Starting Hardhat Node..." -ForegroundColor Yellow
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$currentPath'; Write-Host 'Hardhat Local Node' -ForegroundColor Cyan; npx hardhat node"
    Write-Host "  OK - Hardhat node started in new window" -ForegroundColor Green
    Write-Host ""
}

# Function to deploy contract
function Deploy-Contract {
    Write-Host "[Step 2] Deploying contract..." -ForegroundColor Yellow
    npx hardhat deploy --network localhost
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  OK - Contract deployed successfully!" -ForegroundColor Green
        
        if (Test-Path ".\deployments\localhost\LuckyDice.json") {
            $deployment = Get-Content ".\deployments\localhost\LuckyDice.json" | ConvertFrom-Json
            Write-Host "  Contract address: $($deployment.address)" -ForegroundColor Cyan
        }
    } else {
        Write-Host "  ERROR - Deployment failed!" -ForegroundColor Red
        return $false
    }
    Write-Host ""
    return $true
}

# Function to start frontend
function Start-Frontend {
    Write-Host "[Step 3] Starting frontend server..." -ForegroundColor Yellow
    
    if (-not (Test-Path ".\frontend\node_modules")) {
        Write-Host "  Installing frontend dependencies..." -ForegroundColor Yellow
        Set-Location frontend
        npm install
        Set-Location ..
    }
    
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$currentPath\frontend'; Write-Host 'Frontend Dev Server' -ForegroundColor Cyan; npm run dev"
    Write-Host "  OK - Frontend server started in new window" -ForegroundColor Green
    Write-Host ""
}

# Function to run tests
function Run-Tests {
    Write-Host "Running tests..." -ForegroundColor Yellow
    npx hardhat test
    Write-Host ""
}

# Main logic
if ($All) {
    Write-Host "=== Starting all services ===" -ForegroundColor Cyan
    Write-Host ""
    
    Start-HardhatNode
    
    Write-Host "Waiting for node to initialize (15 seconds)..." -ForegroundColor Yellow
    Start-Sleep -Seconds 15
    
    $deployed = Deploy-Contract
    
    if ($deployed) {
        Start-Frontend
        
        Write-Host "===============================================" -ForegroundColor Cyan
        Write-Host "All services started successfully!" -ForegroundColor Green
        Write-Host "===============================================" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "Service URLs:" -ForegroundColor Yellow
        Write-Host "  Frontend:   http://localhost:3000" -ForegroundColor Cyan
        Write-Host "  Blockchain: http://localhost:8545" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "Open http://localhost:3000 in your browser!" -ForegroundColor Green
        Write-Host ""
    }
}
elseif ($Node) {
    Start-HardhatNode
}
elseif ($Deploy) {
    Deploy-Contract
}
elseif ($Frontend) {
    Start-Frontend
}
elseif ($Test) {
    Run-Tests
}
else {
    Write-Host "Usage:" -ForegroundColor Yellow
    Write-Host "  .\start.ps1 -All        Start all services" -ForegroundColor White
    Write-Host "  .\start.ps1 -Node       Start Hardhat node only" -ForegroundColor White
    Write-Host "  .\start.ps1 -Deploy     Deploy contract only" -ForegroundColor White
    Write-Host "  .\start.ps1 -Frontend   Start frontend only" -ForegroundColor White
    Write-Host "  .\start.ps1 -Test       Run tests" -ForegroundColor White
    Write-Host ""
    Write-Host "Quick start: .\start.ps1 -All" -ForegroundColor Green
    Write-Host ""
}

