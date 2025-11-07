# 🦊 如何导入 Hardhat 测试账户到 MetaMask

## 📋 问题说明

错误信息：
```
could not coalesce error
Details: Internal JSON-RPC error
```

**原因**：你当前使用的 MetaMask 账户（`0xd301...6d70`）在 Hardhat 本地网络上余额为 **0 ETH**，无法支付交易 gas 费用。

---

## ✅ 解决方案：导入测试账户

Hardhat 本地节点启动时会自动创建 20 个测试账户，每个账户有 **10000 ETH**。

### 🔑 可用测试账户

#### 账户 #0（推荐使用）
```
地址：     0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
私钥：     0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
初始余额： 10000 ETH
```

#### 账户 #1
```
地址：     0x70997970C51812dc3A010C7d01b50e0d17dc79C8
私钥：     0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d
初始余额： 10000 ETH
```

#### 账户 #2
```
地址：     0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC
私钥：     0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a
初始余额： 10000 ETH
```

---

## 📝 导入步骤（详细图文）

### 方法 1：导入账户（推荐）

#### 步骤 1：打开 MetaMask
1. 点击浏览器右上角的 MetaMask 图标
2. 确保已切换到 **Hardhat Local** 网络
   - 如果没有，参考 `MetaMask配置指南.md` 添加网络

#### 步骤 2：进入账户菜单
1. 点击 MetaMask 右上角的 **圆形头像图标**
2. 在下拉菜单中选择 **"导入账户"**（Import Account）

#### 步骤 3：粘贴私钥
1. 在 "Select Type" 下拉菜单选择 **"Private Key"**
2. 在 "Paste your private key string here" 输入框中粘贴：
   ```
   0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
   ```
3. 点击 **"Import"** 按钮

#### 步骤 4：验证导入成功
1. MetaMask 会自动切换到新导入的账户
2. 地址应该显示为：`0xf39F...2266`
3. 余额应该显示：**10000 ETH**
4. ✅ 导入成功！

---

### 方法 2：使用助记词（可选）

如果你想导入所有 20 个测试账户，可以使用 Hardhat 的默认助记词：

```
test test test test test test test test test test test junk
```

#### 导入步骤：
1. 在 MetaMask 中选择 **"使用助记词导入"**
2. 输入上面的助记词
3. 设置密码
4. 完成后会自动创建账户 #0（`0xf39F...2266`）
5. 可以通过 "创建账户" 继续派生账户 #1、#2 等

---

## 🎯 导入后的操作

### 1️⃣ 刷新页面
```
按 Ctrl + F5（硬刷新）
```

### 2️⃣ 重新连接钱包
1. 如果页面显示 "Connect Wallet"，点击连接
2. 在 MetaMask 中选择新导入的账户（`0xf39F...2266`）
3. 点击 "下一步" → "连接"

### 3️⃣ 验证连接
- 右上角应该显示：`0xf39F...2266`
- FHEVM 状态应该显示：`Ready ✅`
- Total Rolls 应该可以正常显示

### 4️⃣ 重新提交投注
1. 选择骰子值（1-6）
2. 点击 "Submit encrypted roll"
3. MetaMask 会弹出确认窗口
4. 点击 "确认"
5. ✅ 交易成功！

---

## ⚠️ 重要提示

### 🔒 安全警告
```
⚠️ 这些私钥是 Hardhat 的默认测试私钥，已经公开！
⚠️ 仅用于本地测试，永远不要在主网或测试网使用！
⚠️ 不要向这些地址发送真实的 ETH 或代币！
```

### 🔄 重启后的变化
每次重启 Hardhat 节点：
- ✅ 测试账户地址**不变**
- ✅ 余额重置为 **10000 ETH**
- ❌ 之前的交易历史**清空**
- ❌ 合约会重新部署到**新地址**

### 📱 切换回主账户
如果你想切换回原来的账户：
1. 点击 MetaMask 右上角的账户图标
2. 在账户列表中选择你的原始账户
3. 但记住：原始账户在本地网络上没有 ETH

---

## 🧪 快速测试

导入账户后，运行以下测试验证一切正常：

### 测试 1：检查余额
```powershell
# 在项目根目录运行
cd E:\Spring\Zama\lucky
$body = '{"jsonrpc":"2.0","method":"eth_getBalance","params":["0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266","latest"],"id":1}'
Invoke-RestMethod -Uri http://127.0.0.1:8545 -Method Post -Body $body -ContentType "application/json"
```

预期结果：
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": "0x21e19e0c9bab2400000"  // 10000 ETH (in wei)
}
```

### 测试 2：提交投注
1. 打开 http://localhost:3000
2. 确保右上角显示 `0xf39F...2266`
3. 选择骰子值：5
4. 点击 "Submit encrypted roll"
5. MetaMask 确认交易
6. ✅ 等待交易成功（应该几秒钟内完成）

---

## 🆘 常见问题

### Q1: 导入后还是显示 0 ETH？
**A**: 
- 检查是否切换到了 **Hardhat Local** 网络
- 不要选择 **Localhost 8545**（这是不同的网络）
- 参考 `MetaMask配置指南.md` 正确配置网络

### Q2: 私钥格式错误？
**A**: 
- 确保私钥以 `0x` 开头
- 完整复制，不要有空格或换行
- 正确的格式：`0xac09...ff80`（66个字符）

### Q3: 可以导入多个测试账户吗？
**A**: 
- 可以！按照相同步骤导入账户 #1、#2 等
- 或者使用助记词方法一次性导入所有账户

### Q4: 重启后需要重新导入吗？
**A**: 
- **不需要**！账户会保存在 MetaMask 中
- 但余额会重置为 10000 ETH
- 交易历史会清空

---

## 🎉 完成！

现在你可以：
- ✅ 提交加密投注
- ✅ 解密查看结果
- ✅ 查看奖池状态
- ✅ 追逐 Jackpot！

**祝你玩得开心！🎲🍀**

