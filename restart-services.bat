@echo off
setlocal

echo.
echo ========================================
echo Restarting Lucky Dice Services
echo ========================================
echo.

:: Kill all node processes
echo [1/4] Stopping all Node.js processes...
taskkill /F /IM node.exe /T >nul 2>&1
timeout /t 2 /nobreak >nul

:: Start Hardhat Node
echo [2/4] Starting Hardhat Node...
cd /d E:\Spring\Zama\lucky
start "Hardhat Node" cmd /k "npx hardhat node"
timeout /t 8 /nobreak >nul

:: Deploy contracts
echo [3/4] Deploying contracts...
call npx hardhat deploy --network localhost --reset
if %errorlevel% neq 0 (
    echo Error: Contract deployment failed!
    pause
    exit /b 1
)

:: Start Frontend
echo [4/4] Starting Frontend...
cd /d E:\Spring\Zama\lucky\frontend
start "Lucky Dice Frontend" cmd /k "npm run dev"
timeout /t 5 /nobreak >nul

echo.
echo ========================================
echo Services Restarted Successfully!
echo ========================================
echo.
echo Frontend: http://localhost:3000
echo Hardhat:  http://localhost:8545
echo.
echo Test Accounts (each has 10000 ETH):
echo.
echo Account #0: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
echo Private Key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
echo.
echo Account #1: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
echo Private Key: 0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d
echo.
echo Account #2: 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC
echo Private Key: 0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a
echo.
echo Please import one of these accounts into MetaMask!
echo.
pause

