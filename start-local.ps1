# Lucky Dice 本地启动脚本

Write-Host "=== Lucky Dice 本地环境启动 ===" -ForegroundColor Green
Write-Host ""

# 步骤 1: 启动 Hardhat 节点
Write-Host "[1/3] 正在新窗口启动 Hardhat 节点..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; Write-Host '启动 Hardhat 节点...' -ForegroundColor Cyan; npx hardhat node"

# 等待节点启动
Write-Host "等待节点启动 (15秒)..." -ForegroundColor Yellow
Start-Sleep -Seconds 15

# 步骤 2: 部署合约
Write-Host "[2/3] 部署合约到本地网络..." -ForegroundColor Yellow
npx hardhat deploy --network localhost

if ($LASTEXITCODE -ne 0) {
    Write-Host "部署失败！请检查 Hardhat 节点是否正常运行。" -ForegroundColor Red
    exit 1
}

Write-Host "合约部署成功！" -ForegroundColor Green
Write-Host ""

# 步骤 3: 启动前端
Write-Host "[3/3] 正在新窗口启动前端应用..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\frontend'; Write-Host '安装前端依赖...' -ForegroundColor Cyan; npm install; Write-Host '启动前端开发服务器...' -ForegroundColor Cyan; npm run dev"

Write-Host ""
Write-Host "=== 启动完成 ===" -ForegroundColor Green
Write-Host ""
Write-Host "服务地址:" -ForegroundColor Cyan
Write-Host "  - Hardhat 节点: http://localhost:8545" -ForegroundColor White
Write-Host "  - 前端应用: http://localhost:3000" -ForegroundColor White
Write-Host ""
Write-Host "请在浏览器中打开 http://localhost:3000 使用应用" -ForegroundColor Yellow
Write-Host ""
Write-Host "按任意键退出此脚本窗口 (其他服务将继续运行)..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

