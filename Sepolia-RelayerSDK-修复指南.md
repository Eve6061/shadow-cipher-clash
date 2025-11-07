# 🔧 Sepolia RelayerSDK 修复指南

## 🎯 你的需求

使用 **Sepolia 测试网**进行真实环境测试。

## ❌ 当前问题

### 错误 1: RelayerSDK 加载失败
```
RelayerSDKLoader: window object does not contain a valid relayerSDK object
```

### 错误 2: Relayer 后端连接失败
```
Transaction rejected: Input request failed
backend connection task has stopped
```

---

## 🔍 问题诊断

### 步骤 1: 检查网络连接

**在浏览器中访问**：
```
https://cdn.zama.ai/relayer-sdk-js/0.2.0/relayer-sdk-js.umd.cjs
```

**预期结果**：
- ✅ 应该自动下载一个 JS 文件（约 632 KB）
- ❌ 如果无法访问 → 网络问题（VPN/防火墙）

### 步骤 2: 检查浏览器控制台

1. **按 F12** 打开开发者工具
2. **切换到 Console 标签**
3. **查找日志**：

**正常加载日志应该是**：
```javascript
[RelayerSDKLoader] load...
[RelayerSDKLoader] add script to DOM...
[RelayerSDKLoader] script added!
[useFhevm] createFhevmInstance status changed: sdk-loading
[useFhevm] createFhevmInstance status changed: sdk-loaded
[useFhevm] createFhevmInstance status changed: sdk-initializing
[useFhevm] createFhevmInstance status changed: sdk-initialized
[useFhevm] createFhevmInstance created!
```

**如果卡在某个步骤**：
- `sdk-loading`: CDN 加载问题
- `sdk-initializing`: Zama 服务器连接问题

### 步骤 3: 检查 Network 标签

1. **F12 → Network 标签**
2. **刷新页面**
3. **找到** `relayer-sdk-js.umd.cjs` 请求

**检查状态**：
- ✅ Status: 200 → 正常
- ❌ Status: 404/500 → CDN 问题
- ❌ Failed → 网络连接问题
- ❌ CORS error → 跨域问题

---

## ✅ 解决方案

### 方案 1: 清除缓存重试（最常见）

1. **清除浏览器缓存**
   ```
   按 Ctrl + Shift + Delete
   - 选择 "缓存的图片和文件"
   - 时间范围：全部
   - 点击 "清除数据"
   ```

2. **硬刷新页面**
   ```
   按 Ctrl + F5 或 Ctrl + Shift + R
   ```

3. **检查 FHEVM Status**
   - 应该从 "Connecting" 变为 "Ready ✅"

### 方案 2: 禁用浏览器扩展

某些扩展可能阻止脚本加载：

1. **打开无痕/隐私模式**
   ```
   Chrome: Ctrl + Shift + N
   Firefox: Ctrl + Shift + P
   Edge: Ctrl + Shift + N
   ```

2. **访问** http://localhost:3000

3. **切换到 Sepolia**

4. **测试是否正常**

**如果无痕模式正常**：
- 逐个禁用扩展找出罪魁祸首
- 常见干扰扩展：广告拦截器、隐私保护工具

### 方案 3: 检查网络环境

#### 测试 CDN 连接

**Windows PowerShell**:
```powershell
Invoke-WebRequest -Uri "https://cdn.zama.ai/relayer-sdk-js/0.2.0/relayer-sdk-js.umd.cjs" -Method Head
```

**预期输出**:
```
StatusCode: 200
Content-Length: 631982
```

#### 如果无法连接 CDN

**可能原因**：
- 🔥 防火墙阻止
- 🌐 网络限制
- 🔒 公司/学校网络策略
- 🛡️ VPN 干扰

**解决**：
- 关闭 VPN 重试
- 切换网络（手机热点等）
- 联系网络管理员

### 方案 4: 等待 Zama 服务恢复

如果 CDN 可以访问，但后端连接失败：

```
Transaction rejected: backend connection task has stopped
```

**这意味着**：
- ✅ SDK 已加载
- ❌ Zama 的 FHEVM 协处理器服务暂时不可用

**解决**：
1. **检查 Zama 状态**：
   - 访问：https://docs.zama.ai/fhevm
   - 查看是否有维护公告

2. **等待服务恢复**（通常几小时内）

3. **临时使用本地网络**（推荐）：
   - 本地网络不依赖 Zama 服务
   - 速度更快，稳定性更好

---

## 🛠️ 高级调试

### 手动测试 RelayerSDK 加载

创建测试文件 `test-relayer.html`：

```html
<!DOCTYPE html>
<html>
<head>
    <title>RelayerSDK Test</title>
</head>
<body>
    <h1>RelayerSDK Load Test</h1>
    <div id="status">Testing...</div>
    
    <script src="https://cdn.zama.ai/relayer-sdk-js/0.2.0/relayer-sdk-js.umd.cjs"></script>
    <script>
        window.addEventListener('load', function() {
            const status = document.getElementById('status');
            
            if (window.relayerSDK) {
                status.innerHTML = '✅ RelayerSDK loaded successfully!<br>';
                status.innerHTML += 'Available methods:<br>';
                status.innerHTML += '- initSDK: ' + (typeof window.relayerSDK.initSDK) + '<br>';
                status.innerHTML += '- createInstance: ' + (typeof window.relayerSDK.createInstance) + '<br>';
                status.innerHTML += '- SepoliaConfig: ' + (typeof window.relayerSDK.SepoliaConfig);
            } else {
                status.innerHTML = '❌ RelayerSDK NOT loaded';
                status.style.color = 'red';
            }
        });
    </script>
</body>
</html>
```

**在浏览器中打开这个文件**：
- ✅ 如果显示绿色成功 → SDK 可以加载，问题在 Next.js 配置
- ❌ 如果显示红色失败 → 网络/浏览器问题

### 检查 CORS 策略

前端的 CORS 配置：
```typescript
// next.config.ts
{
  'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
  'Cross-Origin-Embedder-Policy': 'credentialless',
}
```

**如果还有 CORS 问题**，尝试临时关闭：
```typescript
// 注释掉 headers() 函数
// async headers() { ... }
```

**重启前端**：
```bash
cd E:\Spring\Zama\lucky\frontend
npm run dev
```

---

## 📊 Sepolia 使用检查清单

使用 Sepolia 前确认：

- [ ] **网络配置**：MetaMask 在 Sepolia Test Network
- [ ] **账户余额**：至少 0.1 ETH（从 Faucet 获取）
- [ ] **CDN 可访问**：能访问 https://cdn.zama.ai
- [ ] **浏览器正常**：无扩展干扰，无 CORS 错误
- [ ] **服务可用**：Zama 协处理器服务正常

**Sepolia Faucet**：
- https://sepoliafaucet.com/
- https://www.infura.io/faucet/sepolia
- https://faucet.quicknode.com/ethereum/sepolia

---

## 🔄 临时替代方案

如果 Sepolia 持续有问题，可以：

### 选项 1: 使用 Hardhat Local（推荐开发阶段）

**优点**：
- ✅ 不依赖外部服务
- ✅ 即时出块（<1秒）
- ✅ 无限余额（10000 ETH）
- ✅ 完全稳定

**缺点**：
- ❌ 数据不持久
- ❌ 无法公开访问
- ❌ 不是真实环境

### 选项 2: 等待 Zama 服务恢复

**Zama 官方渠道**：
- 文档：https://docs.zama.ai/fhevm
- GitHub：https://github.com/zama-ai/fhevm
- Discord：查找官方社区

---

## 🆘 还是无法解决？

### 收集诊断信息

1. **浏览器控制台完整日志**（F12 → Console → 全选复制）

2. **Network 标签信息**：
   - 找到 `relayer-sdk-js.umd.cjs` 请求
   - 右键 → Copy → Copy as cURL

3. **FHEVM Status 截图**

4. **MetaMask 网络设置截图**

### 提供以下信息

```
• 浏览器版本: ___________
• 操作系统: ___________
• 网络环境: 公司/家庭/学校
• VPN 使用: 是/否
• 是否能访问 https://cdn.zama.ai: 是/否
• 控制台错误信息: ___________
```

---

## 🎯 快速诊断命令

```powershell
# 在项目根目录运行
cd E:\Spring\Zama\lucky

# 测试 Zama CDN
Write-Host "Testing Zama CDN..." -ForegroundColor Cyan
Invoke-WebRequest -Uri "https://cdn.zama.ai/relayer-sdk-js/0.2.0/relayer-sdk-js.umd.cjs" -Method Head

# 检查服务状态
Write-Host "`nChecking services..." -ForegroundColor Cyan
$frontend = netstat -ano | findstr ":3000"
if ($frontend) { Write-Host "✅ Frontend: Running" -ForegroundColor Green } else { Write-Host "❌ Frontend: Not Running" -ForegroundColor Red }

# 检查合约部署
Write-Host "`nContract addresses:" -ForegroundColor Cyan
Get-Content frontend\abi\LuckyDiceAddresses.ts | Select-String "address"
```

---

## 📝 总结

**最可能的原因（按概率排序）**：

1. **70%** - 浏览器缓存问题 → 清除缓存并硬刷新
2. **15%** - Zama 服务暂时不可用 → 等待或使用本地网络
3. **10%** - 网络连接问题 → 检查能否访问 CDN
4. **5%** - 浏览器扩展干扰 → 使用无痕模式测试

**推荐操作顺序**：
1. ✅ 清除缓存 + 硬刷新（最快）
2. ✅ 无痕模式测试（排除扩展）
3. ✅ 测试 CDN 连接（确认网络）
4. ✅ 等待服务恢复或临时用本地

---

**现在请按照"方案 1"先清除缓存并硬刷新，然后告诉我结果！** 🚀

