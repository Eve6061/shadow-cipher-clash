@echo off
chcp 65001 >nul
cd /d %~dp0

echo.
echo === Lucky Dice 本地环境启动 ===
echo.

echo [1/3] 正在启动 Hardhat 节点...
start "Hardhat Node" cmd /k "echo 启动 Hardhat 节点... && npx hardhat node"

echo 等待节点启动 (15秒)...
timeout /t 15 /nobreak >nul

echo.
echo [2/3] 部署合约到本地网络...
call npx hardhat deploy --network localhost
if errorlevel 1 (
    echo 部署失败！请检查 Hardhat 节点是否正常运行。
    pause
    exit /b 1
)

echo 合约部署成功！
echo.

echo [3/3] 正在启动前端应用...
cd frontend
start "Frontend Dev Server" cmd /k "echo 安装前端依赖... && npm install && echo 启动前端开发服务器... && npm run dev"

cd ..
echo.
echo === 启动完成 ===
echo.
echo 服务地址:
echo   - Hardhat 节点: http://localhost:8545
echo   - 前端应用: http://localhost:3000
echo.
echo 请在浏览器中打开 http://localhost:3000 使用应用
echo.
echo 按任意键退出此脚本窗口 (其他服务将继续运行)...
pause >nul

