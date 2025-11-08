# 检查 Lucky Dice 服务状态

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Lucky Dice 服务状态检查" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Cyan

# 检查 Hardhat 节点
Write-Host "[1/3] 检查 Hardhat 节点 (端口 8545)..." -ForegroundColor Yellow
$hardhat = netstat -ano | Select-String ":8545.*LISTENING"
if ($hardhat) {
    Write-Host "✅ Hardhat 节点正在运行" -ForegroundColor Green
    Write-Host "   $hardhat" -ForegroundColor Gray
} else {
    Write-Host "❌ Hardhat 节点未运行！" -ForegroundColor Red
    Write-Host "   请运行: npx hardhat node" -ForegroundColor Yellow
}

Write-Host ""

# 检查前端服务
Write-Host "[2/3] 检查前端服务 (端口 3000)..." -ForegroundColor Yellow
$frontend = netstat -ano | Select-String ":3000.*LISTENING"
if ($frontend) {
    Write-Host "✅ 前端服务正在运行" -ForegroundColor Green
    Write-Host "   $frontend" -ForegroundColor Gray
} else {
    Write-Host "❌ 前端服务未运行！" -ForegroundColor Red
    Write-Host "   请运行: cd frontend && npm run dev" -ForegroundColor Yellow
}

Write-Host ""

# 测试 RPC 连接
Write-Host "[3/3] 测试 Hardhat RPC 连接..." -ForegroundColor Yellow
try {
    $body = '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}'
    $response = Invoke-RestMethod -Uri "http://127.0.0.1:8545" -Method Post -Body $body -ContentType "application/json" -ErrorAction Stop
    if ($response.result) {
        $chainId = [Convert]::ToInt32($response.result, 16)
        Write-Host "✅ RPC 连接成功！Chain ID: $chainId" -ForegroundColor Green
    } else {
        Write-Host "⚠️  RPC 响应异常" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ RPC 连接失败！" -ForegroundColor Red
    Write-Host "   错误: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "服务地址:" -ForegroundColor Yellow
Write-Host "  🌐 前端: http://localhost:3000" -ForegroundColor White
Write-Host "  ⛓️  RPC:  http://localhost:8545" -ForegroundColor White
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "按任意键退出..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

