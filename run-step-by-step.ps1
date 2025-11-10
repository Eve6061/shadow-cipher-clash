# Lucky Dice - Step-by-step execution script (single terminal version)

Write-Host ""
Write-Host "═══════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "    Lucky Dice Project - Step-by-step Startup Guide" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

$currentPath = Get-Location

# Check if in correct directory
if (-not (Test-Path ".\hardhat.config.ts")) {
    Write-Host "Error: Please run this script from the project root directory!" -ForegroundColor Red
    exit 1
}

Write-Host "Current directory: $currentPath" -ForegroundColor Gray
Write-Host ""

# Menu
while ($true) {
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
    Write-Host "Please select an operation:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "  [1] Start Hardhat node (new window)"
    Write-Host "  [2] Deploy contracts to local network"
    Write-Host "  [3] Run tests"
    Write-Host "  [4] Start frontend development server (new window)"
    Write-Host "  [5] View contract addresses"
    Write-Host "  [6] Check running processes"
    Write-Host "  [0] Start all services (one-click)"
    Write-Host "  [Q] Exit"
    Write-Host ""
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
    Write-Host ""

    $choice = Read-Host "Enter your choice"
    
    switch ($choice) {
        "1" {
            Write-Host ""
            Write-Host "Starting Hardhat node..." -ForegroundColor Yellow
            Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$currentPath'; Write-Host '═══ Hardhat Local Node ═══' -ForegroundColor Cyan; npx hardhat node"
            Write-Host "✓ Hardhat node started in new window" -ForegroundColor Green
            Write-Host "  Wait 10-15 seconds before deploying..." -ForegroundColor Gray
            Write-Host ""
        }
        
        "2" {
            Write-Host ""
            Write-Host "Deploying contracts to local network..." -ForegroundColor Yellow
            npx hardhat deploy --network localhost
            if ($LASTEXITCODE -eq 0) {
                Write-Host "✓ Contract deployment successful!" -ForegroundColor Green
            } else {
                Write-Host "✗ Deployment failed! Please ensure Hardhat node is running." -ForegroundColor Red
            }
            Write-Host ""
        }
        
        "3" {
            Write-Host ""
            Write-Host "Running tests..." -ForegroundColor Yellow
            npx hardhat test
            Write-Host ""
        }
        
        "4" {
            Write-Host ""
            Write-Host "Starting frontend development server..." -ForegroundColor Yellow

            # Check if frontend directory exists
            if (-not (Test-Path ".\frontend")) {
                Write-Host "✗ Frontend directory not found!" -ForegroundColor Red
                Write-Host ""
                continue
            }

            # Check if dependencies need to be installed
            if (-not (Test-Path ".\frontend\node_modules")) {
                Write-Host "First run, installing dependencies..." -ForegroundColor Yellow
                Set-Location frontend
                npm install
                Set-Location ..
            }

            Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$currentPath\frontend'; Write-Host '═══ Frontend Development Server ═══' -ForegroundColor Cyan; npm run dev"
            Write-Host "✓ Frontend server started in new window" -ForegroundColor Green
            Write-Host "  Open http://localhost:3000 in your browser shortly" -ForegroundColor Cyan
            Write-Host ""
        }
        
        "5" {
            Write-Host ""
            Write-Host "Checking contract addresses..." -ForegroundColor Yellow
            if (Test-Path ".\deployments\localhost\LuckyDice.json") {
                $deployment = Get-Content ".\deployments\localhost\LuckyDice.json" | ConvertFrom-Json
                Write-Host "✓ LuckyDice contract address:" -ForegroundColor Green
                Write-Host "  $($deployment.address)" -ForegroundColor Cyan
            } else {
                Write-Host "✗ Deployment information not found. Please deploy contracts first (option 2)." -ForegroundColor Red
            }
            Write-Host ""
        }
        
        "6" {
            Write-Host ""
            Write-Host "Checking running processes..." -ForegroundColor Yellow
            Write-Host ""

            $hardhatProcess = Get-Process | Where-Object { $_.ProcessName -like "*node*" -and $_.CommandLine -like "*hardhat*" }
            $frontendProcess = Get-Process | Where-Object { $_.ProcessName -like "*node*" -and $_.CommandLine -like "*next*" }

            if ($hardhatProcess) {
                Write-Host "✓ Hardhat node is running" -ForegroundColor Green
            } else {
                Write-Host "✗ Hardhat node is not running" -ForegroundColor Red
            }

            if ($frontendProcess) {
                Write-Host "✓ Frontend server is running" -ForegroundColor Green
            } else {
                Write-Host "✗ Frontend server is not running" -ForegroundColor Red
            }

            Write-Host ""
            Write-Host "Checking port usage..." -ForegroundColor Gray
            $port8545 = netstat -ano | Select-String ":8545"
            $port3000 = netstat -ano | Select-String ":3000"

            if ($port8545) {
                Write-Host "✓ Port 8545 (Hardhat) is in use" -ForegroundColor Green
            } else {
                Write-Host "  Port 8545 is free" -ForegroundColor Gray
            }

            if ($port3000) {
                Write-Host "✓ Port 3000 (Frontend) is in use" -ForegroundColor Green
            } else {
                Write-Host "  Port 3000 is free" -ForegroundColor Gray
            }

            Write-Host ""
        }
        
        "0" {
            Write-Host ""
            Write-Host "═══ Start All Services (One-Click) ═══" -ForegroundColor Cyan
            Write-Host ""

            # Step 1
            Write-Host "[1/4] Starting Hardhat node..." -ForegroundColor Yellow
            Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$currentPath'; Write-Host '═══ Hardhat Local Node ═══' -ForegroundColor Cyan; npx hardhat node"
            Write-Host "✓ Hardhat node started in new window" -ForegroundColor Green

            # Wait
            Write-Host ""
            Write-Host "[2/4] Waiting for node initialization (15 seconds)..." -ForegroundColor Yellow
            for ($i = 15; $i -gt 0; $i--) {
                Write-Host "  $i..." -NoNewline
                Start-Sleep -Seconds 1
            }
            Write-Host "  Complete" -ForegroundColor Green

            # Step 2
            Write-Host ""
            Write-Host "[3/4] Deploying contracts..." -ForegroundColor Yellow
            npx hardhat deploy --network localhost
            if ($LASTEXITCODE -eq 0) {
                Write-Host "✓ Contract deployment successful!" -ForegroundColor Green

                # Show contract address
                if (Test-Path ".\deployments\localhost\LuckyDice.json") {
                    $deployment = Get-Content ".\deployments\localhost\LuckyDice.json" | ConvertFrom-Json
                    Write-Host "  Contract address: $($deployment.address)" -ForegroundColor Cyan
                }
            } else {
                Write-Host "✗ Deployment failed!" -ForegroundColor Red
                Write-Host ""
                continue
            }

            # Step 3
            Write-Host ""
            Write-Host "[4/4] Starting frontend server..." -ForegroundColor Yellow

            # Check and install dependencies
            if (-not (Test-Path ".\frontend\node_modules")) {
                Write-Host "First run, installing frontend dependencies..." -ForegroundColor Yellow
                Set-Location frontend
                npm install
                Set-Location ..
            }

            Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$currentPath\frontend'; Write-Host '═══ Frontend Development Server ═══' -ForegroundColor Cyan; npm run dev"
            Write-Host "✓ Frontend server started in new window" -ForegroundColor Green

            Write-Host ""
            Write-Host "═══════════════════════════════════════════════" -ForegroundColor Cyan
            Write-Host "✓ All services started successfully!" -ForegroundColor Green
            Write-Host "═══════════════════════════════════════════════" -ForegroundColor Cyan
            Write-Host ""
            Write-Host "Service URLs:" -ForegroundColor Yellow
            Write-Host "  🌐 Frontend App: http://localhost:3000" -ForegroundColor Cyan
            Write-Host "  ⛓️  Blockchain Node: http://localhost:8545" -ForegroundColor Cyan
            Write-Host ""
            Write-Host "Open http://localhost:3000 in your browser to start using the app!" -ForegroundColor Green
            Write-Host ""
        }
        
        { $_ -in "q", "Q", "quit", "exit" } {
            Write-Host ""
            Write-Host "Goodbye!" -ForegroundColor Green
            Write-Host ""
            exit 0
        }

        default {
            Write-Host ""
            Write-Host "✗ Invalid option, please try again" -ForegroundColor Red
            Write-Host ""
        }
    }
    
    Read-Host "Press Enter to continue" | Out-Null
    Clear-Host
    Write-Host ""
}

