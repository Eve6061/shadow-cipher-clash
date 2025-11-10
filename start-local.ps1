# Lucky Dice Local Startup Script

Write-Host "=== Lucky Dice Local Environment Startup ===" -ForegroundColor Green
Write-Host ""

# Step 1: Start Hardhat Node
Write-Host "[1/3] Starting Hardhat node in new window..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; Write-Host 'Starting Hardhat node...' -ForegroundColor Cyan; npx hardhat node"

# Wait for node to start
Write-Host "Waiting for node to start (15 seconds)..." -ForegroundColor Yellow
Start-Sleep -Seconds 15

# Step 2: Deploy Contracts
Write-Host "[2/3] Deploying contracts to local network..." -ForegroundColor Yellow
npx hardhat deploy --network localhost

if ($LASTEXITCODE -ne 0) {
    Write-Host "Deployment failed! Please check if Hardhat node is running properly." -ForegroundColor Red
    exit 1
}

Write-Host "Contract deployment successful!" -ForegroundColor Green
Write-Host ""

# Step 3: Start Frontend
Write-Host "[3/3] Starting frontend application in new window..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\frontend'; Write-Host 'Installing frontend dependencies...' -ForegroundColor Cyan; npm install; Write-Host 'Starting frontend development server...' -ForegroundColor Cyan; npm run dev"

Write-Host ""
Write-Host "=== Startup Complete ===" -ForegroundColor Green
Write-Host ""
Write-Host "Service URLs:" -ForegroundColor Cyan
Write-Host "  - Hardhat Node: http://localhost:8545" -ForegroundColor White
Write-Host "  - Frontend App: http://localhost:3000" -ForegroundColor White
Write-Host ""
Write-Host "Open http://localhost:3000 in your browser to use the application" -ForegroundColor Yellow
Write-Host ""
Write-Host "Press any key to exit this script window (other services will continue running)..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

