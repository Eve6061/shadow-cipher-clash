# Lucky Dice - 分步运行脚本（单终端版本）

Write-Host ""
Write-Host "═══════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "    Lucky Dice 项目 - 分步启动指南" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

$currentPath = Get-Location

# 检查是否在正确的目录
if (-not (Test-Path ".\hardhat.config.ts")) {
    Write-Host "错误：请在项目根目录运行此脚本！" -ForegroundColor Red
    exit 1
}

Write-Host "当前目录：$currentPath" -ForegroundColor Gray
Write-Host ""

# 菜单
while ($true) {
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
    Write-Host "请选择操作：" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "  [1] 启动 Hardhat 节点（新窗口）"
    Write-Host "  [2] 部署合约到本地网络"
    Write-Host "  [3] 运行测试"
    Write-Host "  [4] 启动前端开发服务器（新窗口）"
    Write-Host "  [5] 查看合约地址"
    Write-Host "  [6] 查看当前运行的进程"
    Write-Host "  [0] 一键启动所有服务"
    Write-Host "  [Q] 退出"
    Write-Host ""
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
    Write-Host ""
    
    $choice = Read-Host "请输入选项"
    
    switch ($choice) {
        "1" {
            Write-Host ""
            Write-Host "启动 Hardhat 节点..." -ForegroundColor Yellow
            Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$currentPath'; Write-Host '═══ Hardhat 本地节点 ═══' -ForegroundColor Cyan; npx hardhat node"
            Write-Host "✓ 已在新窗口启动 Hardhat 节点" -ForegroundColor Green
            Write-Host "  等待 10-15 秒后再执行部署..." -ForegroundColor Gray
            Write-Host ""
        }
        
        "2" {
            Write-Host ""
            Write-Host "部署合约到本地网络..." -ForegroundColor Yellow
            npx hardhat deploy --network localhost
            if ($LASTEXITCODE -eq 0) {
                Write-Host "✓ 合约部署成功！" -ForegroundColor Green
            } else {
                Write-Host "✗ 部署失败！请确保 Hardhat 节点正在运行。" -ForegroundColor Red
            }
            Write-Host ""
        }
        
        "3" {
            Write-Host ""
            Write-Host "运行测试..." -ForegroundColor Yellow
            npx hardhat test
            Write-Host ""
        }
        
        "4" {
            Write-Host ""
            Write-Host "启动前端开发服务器..." -ForegroundColor Yellow
            
            # 检查 frontend 目录
            if (-not (Test-Path ".\frontend")) {
                Write-Host "✗ 找不到 frontend 目录！" -ForegroundColor Red
                Write-Host ""
                continue
            }
            
            # 检查是否需要安装依赖
            if (-not (Test-Path ".\frontend\node_modules")) {
                Write-Host "首次运行，需要安装依赖..." -ForegroundColor Yellow
                Set-Location frontend
                npm install
                Set-Location ..
            }
            
            Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$currentPath\frontend'; Write-Host '═══ 前端开发服务器 ═══' -ForegroundColor Cyan; npm run dev"
            Write-Host "✓ 已在新窗口启动前端服务器" -ForegroundColor Green
            Write-Host "  稍等片刻后，在浏览器打开：http://localhost:3000" -ForegroundColor Cyan
            Write-Host ""
        }
        
        "5" {
            Write-Host ""
            Write-Host "查询合约地址..." -ForegroundColor Yellow
            if (Test-Path ".\deployments\localhost\LuckyDice.json") {
                $deployment = Get-Content ".\deployments\localhost\LuckyDice.json" | ConvertFrom-Json
                Write-Host "✓ LuckyDice 合约地址：" -ForegroundColor Green
                Write-Host "  $($deployment.address)" -ForegroundColor Cyan
            } else {
                Write-Host "✗ 未找到部署信息。请先部署合约（选项 2）" -ForegroundColor Red
            }
            Write-Host ""
        }
        
        "6" {
            Write-Host ""
            Write-Host "检查运行中的进程..." -ForegroundColor Yellow
            Write-Host ""
            
            $hardhatProcess = Get-Process | Where-Object { $_.ProcessName -like "*node*" -and $_.CommandLine -like "*hardhat*" }
            $frontendProcess = Get-Process | Where-Object { $_.ProcessName -like "*node*" -and $_.CommandLine -like "*next*" }
            
            if ($hardhatProcess) {
                Write-Host "✓ Hardhat 节点正在运行" -ForegroundColor Green
            } else {
                Write-Host "✗ Hardhat 节点未运行" -ForegroundColor Red
            }
            
            if ($frontendProcess) {
                Write-Host "✓ 前端服务器正在运行" -ForegroundColor Green
            } else {
                Write-Host "✗ 前端服务器未运行" -ForegroundColor Red
            }
            
            Write-Host ""
            Write-Host "检查端口占用..." -ForegroundColor Gray
            $port8545 = netstat -ano | Select-String ":8545"
            $port3000 = netstat -ano | Select-String ":3000"
            
            if ($port8545) {
                Write-Host "✓ 端口 8545 (Hardhat) 已占用" -ForegroundColor Green
            } else {
                Write-Host "  端口 8545 空闲" -ForegroundColor Gray
            }
            
            if ($port3000) {
                Write-Host "✓ 端口 3000 (Frontend) 已占用" -ForegroundColor Green
            } else {
                Write-Host "  端口 3000 空闲" -ForegroundColor Gray
            }
            
            Write-Host ""
        }
        
        "0" {
            Write-Host ""
            Write-Host "═══ 一键启动所有服务 ═══" -ForegroundColor Cyan
            Write-Host ""
            
            # 步骤 1
            Write-Host "[1/4] 启动 Hardhat 节点..." -ForegroundColor Yellow
            Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$currentPath'; Write-Host '═══ Hardhat 本地节点 ═══' -ForegroundColor Cyan; npx hardhat node"
            Write-Host "✓ Hardhat 节点已在新窗口启动" -ForegroundColor Green
            
            # 等待
            Write-Host ""
            Write-Host "[2/4] 等待节点初始化 (15秒)..." -ForegroundColor Yellow
            for ($i = 15; $i -gt 0; $i--) {
                Write-Host "  $i..." -NoNewline
                Start-Sleep -Seconds 1
            }
            Write-Host " 完成" -ForegroundColor Green
            
            # 步骤 2
            Write-Host ""
            Write-Host "[3/4] 部署合约..." -ForegroundColor Yellow
            npx hardhat deploy --network localhost
            if ($LASTEXITCODE -eq 0) {
                Write-Host "✓ 合约部署成功！" -ForegroundColor Green
                
                # 显示合约地址
                if (Test-Path ".\deployments\localhost\LuckyDice.json") {
                    $deployment = Get-Content ".\deployments\localhost\LuckyDice.json" | ConvertFrom-Json
                    Write-Host "  合约地址：$($deployment.address)" -ForegroundColor Cyan
                }
            } else {
                Write-Host "✗ 部署失败！" -ForegroundColor Red
                Write-Host ""
                continue
            }
            
            # 步骤 3
            Write-Host ""
            Write-Host "[4/4] 启动前端服务器..." -ForegroundColor Yellow
            
            # 检查并安装依赖
            if (-not (Test-Path ".\frontend\node_modules")) {
                Write-Host "首次运行，安装前端依赖..." -ForegroundColor Yellow
                Set-Location frontend
                npm install
                Set-Location ..
            }
            
            Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$currentPath\frontend'; Write-Host '═══ 前端开发服务器 ═══' -ForegroundColor Cyan; npm run dev"
            Write-Host "✓ 前端服务器已在新窗口启动" -ForegroundColor Green
            
            Write-Host ""
            Write-Host "═══════════════════════════════════════════════" -ForegroundColor Cyan
            Write-Host "✓ 所有服务启动完成！" -ForegroundColor Green
            Write-Host "═══════════════════════════════════════════════" -ForegroundColor Cyan
            Write-Host ""
            Write-Host "服务地址：" -ForegroundColor Yellow
            Write-Host "  🌐 前端应用：http://localhost:3000" -ForegroundColor Cyan
            Write-Host "  ⛓️  区块链节点：http://localhost:8545" -ForegroundColor Cyan
            Write-Host ""
            Write-Host "请在浏览器中打开 http://localhost:3000 开始使用！" -ForegroundColor Green
            Write-Host ""
        }
        
        { $_ -in "q", "Q", "quit", "exit" } {
            Write-Host ""
            Write-Host "再见！" -ForegroundColor Green
            Write-Host ""
            exit 0
        }
        
        default {
            Write-Host ""
            Write-Host "✗ 无效选项，请重新选择" -ForegroundColor Red
            Write-Host ""
        }
    }
    
    Read-Host "按 Enter 继续" | Out-Null
    Clear-Host
    Write-Host ""
}

