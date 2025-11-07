# 📋 Load Existing Roll 使用说明

## 🎯 功能说明

**Load existing roll（加载现有投注）** 用于重新加载你之前提交的投注记录。

### 适用场景

1. **页面刷新后**：之前的投注数据丢失，想重新查看
2. **查看历史投注**：想查看之前某次投注的详细信息
3. **跨设备访问**：在另一台电脑上查看自己的投注
4. **解密特定投注**：选择性地解密某个 Roll ID

---

## 📝 操作步骤

### 步骤 1: 获取 Roll ID

**Roll ID 从哪里来？**

#### 方法 A: 提交投注时记录
```
提交投注后，会显示：
"Roll #8 recorded on 2025/11/10 11:34:19"
       ↑
    Roll ID = 8
```

#### 方法 B: 查看历史记录
在 "Recent decrypted rolls" 区域，每条记录都显示 Roll ID：
```
Roll #5 — 4
Roll #6 — 6
Roll #7 — 5
Roll #8 — 6  ← 这个就是 Roll ID
```

#### 方法 C: 查看当前 Total Rolls
```
Total Rolls: 8
```
说明已经有 8 次投注，Roll ID 范围是 1-8

### 步骤 2: 输入 Roll ID

在 "Load existing roll" 输入框中输入数字：
```
┌─────────────────┐
│ 8               │  ← 输入 Roll ID
└─────────────────┘
```

**注意**：
- ✅ 只能输入数字（1, 2, 3...）
- ❌ 不能输入字母或符号
- ✅ 系统会自动过滤非数字字符

### 步骤 3: 点击 Fetch 按钮

点击 **"Fetch"** 按钮后，系统会：
1. 从智能合约读取该 Roll ID 的加密数据
2. 加载到 "Decrypt latest roll" 区域
3. 显示 "Roll #X recorded on ..."

### 步骤 4: 解密查看

加载成功后，点击 **"Decrypt active roll"** 查看结果：
```
Roll #8 — 6
Player: 0xbDA5...197E
Sum: 21
Jackpot: Yes 🎉
```

---

## ❌ 为什么点击 Fetch 没反应？

### 问题 1: 按钮是灰色的（禁用状态）

**可能原因**：

#### 原因 A: 没有输入 Roll ID
```
❌ 输入框是空的
✅ 解决：输入一个数字（例如：8）
```

#### 原因 B: 钱包未连接
```
❌ 右上角没有显示钱包地址
✅ 解决：点击 "Connect Wallet" 连接 MetaMask
```

#### 原因 C: FHEVM 未就绪
```
❌ FHEVM Status 显示 "Error" 或 "Connecting"
✅ 解决：等待显示 "Ready ✅"
```

### 问题 2: 按钮是白色的（可点击），但点击无反应

**诊断步骤**：

#### 步骤 A: 打开浏览器控制台
```
按 F12 → 切换到 Console 标签
```

#### 步骤 B: 点击 Fetch 按钮

#### 步骤 C: 查看错误信息

**常见错误和解决方案**：

##### 错误 1: Roll does not exist
```javascript
Error: RollDoesNotExist(8)
```

**原因**：Roll ID 8 不存在（可能只有 7 次投注）

**解决**：
- 检查 "Total Rolls" 数字
- 只能加载 1 到 Total Rolls 之间的 ID
- 例如：Total Rolls = 7，只能加载 1-7

##### 错误 2: Contract not deployed
```javascript
Error: Contract not deployed on this network
```

**原因**：MetaMask 网络错误

**解决**：
- 确认 MetaMask 在 **Hardhat Local** (Chain ID: 31337)
- 不是 Sepolia 或其他网络

##### 错误 3: Not authorized
```javascript
Error: NotAuthorized
```

**原因**：你没有权限查看这个投注（不是你的投注）

**解决**：
- 只能加载自己的投注
- 或者需要合约 owner 授权

##### 错误 4: Missing revert data
```javascript
Error: missing revert data
```

**原因**：合约调用失败，可能是网络问题

**解决**：
1. 刷新页面（Ctrl + F5）
2. 重新连接钱包
3. 检查 Hardhat 节点是否运行

---

## ✅ 正确的操作流程示例

### 完整示例：加载 Roll #8

```
步骤 1: 准备工作
  ✅ MetaMask 已连接
  ✅ 网络：Hardhat Local (31337)
  ✅ FHEVM Status: Ready ✅
  ✅ Total Rolls: 8

步骤 2: 输入 Roll ID
  在输入框输入: 8
  [8                    ] [Fetch]
                           ↑ 按钮变为可点击状态

步骤 3: 点击 Fetch
  点击 "Fetch" 按钮
  等待 1-2 秒
  
步骤 4: 验证加载成功
  "Decrypt latest roll" 区域显示:
  "Roll #8 recorded on 2025/11/10 11:34:19"
  
步骤 5: 解密查看
  点击 "Decrypt active roll"
  等待解密完成
  查看结果:
    Roll #8 — 6
    Sum: 21
    Jackpot: Yes 🎉
```

---

## 🔍 调试技巧

### 方法 1: 查看网络请求

1. **F12** → **Network** 标签
2. 点击 **Fetch** 按钮
3. 查找合约调用请求
4. 检查请求是否成功（Status: 200）

### 方法 2: 查看控制台日志

启用详细日志：
```javascript
1. F12 → Console
2. 点击 Fetch
3. 查找以下日志：
   - [useLuckyDice] Fetching roll #8...
   - [useLuckyDice] Roll loaded successfully
   或
   - [useLuckyDice] Failed to fetch roll details
```

### 方法 3: 测试简单的 Roll ID

先测试最新的投注：
```
1. 查看 "Total Rolls": 8
2. 加载最新的: 输入 8，点击 Fetch
3. 如果成功，说明功能正常
4. 如果失败，检查钱包和网络
```

---

## 🎮 实际使用场景

### 场景 1: 页面刷新后恢复数据

```
情况：刚投注了 Roll #8，不小心刷新了页面
问题："Decrypt latest roll" 区域空白了
解决：
  1. 输入 8
  2. 点击 Fetch
  3. 重新加载 Roll #8
  4. 点击 Decrypt active roll 查看结果
```

### 场景 2: 查看历史中奖记录

```
情况：我记得 Roll #5 中奖了，想再看一次
解决：
  1. 输入 5
  2. 点击 Fetch
  3. 解密查看
  4. 确认是否中奖
```

### 场景 3: 验证别人的投注（如果有权限）

```
情况：朋友说他投注了 Roll #7，想验证
解决：
  1. 输入 7
  2. 点击 Fetch
  3. 如果有权限，可以加载
  4. 解密查看（需要权限）
```

---

## 📊 与其他功能的关系

### Load existing roll 与其他功能的配合

```
Flow 1: 提交 → 加载 → 解密
  Submit roll (#8)
    ↓
  页面刷新（数据丢失）
    ↓
  Load existing roll (输入 8)
    ↓
  Decrypt active roll
    ↓
  查看结果

Flow 2: 历史查询
  查看 Recent decrypted rolls
    ↓
  看到 Roll #5 — 4
    ↓
  Load existing roll (输入 5)
    ↓
  重新查看详情
```

---

## ⚠️ 常见误解

### 误解 1: Fetch = Decrypt
```
❌ 错误：点击 Fetch 就能看到结果
✅ 正确：Fetch 只是加载加密数据，还需要点击 Decrypt
```

### 误解 2: 可以加载任意 Roll ID
```
❌ 错误：输入 999 尝试加载
✅ 正确：只能加载 1 到 Total Rolls 之间的有效 ID
```

### 误解 3: 可以查看别人的投注
```
❌ 错误：输入别人的 Roll ID 就能查看
✅ 正确：需要有解密权限（通常只能看自己的）
```

### 误解 4: Fetch 后自动解密
```
❌ 错误：Fetch 完就能看到结果
✅ 正确：Fetch 后还需要点击 "Decrypt active roll"
```

---

## 🆘 故障排查清单

在报告问题前，请检查：

- [ ] **钱包已连接**
  - 右上角显示钱包地址
  
- [ ] **网络正确**
  - MetaMask 在 Hardhat Local (31337)
  
- [ ] **FHEVM 就绪**
  - Status 显示 "Ready ✅"
  
- [ ] **Roll ID 有效**
  - 1 ≤ Roll ID ≤ Total Rolls
  
- [ ] **输入正确**
  - 输入框有数字
  - 不是空的
  
- [ ] **按钮可点击**
  - 不是灰色
  - 鼠标悬停有变化
  
- [ ] **检查控制台**
  - F12 查看是否有错误
  
- [ ] **合约已部署**
  - 页面不显示 "Contract not deployed"

---

## 🎯 快速测试

### 测试 Load existing roll 功能

```bash
# 测试步骤
1. 提交一次投注（得到 Roll #X）
2. 记下 Roll ID（例如：8）
3. 刷新页面（Ctrl + F5）
4. 输入 Roll ID: 8
5. 点击 Fetch
6. 预期：显示 "Roll #8 recorded on..."
7. 点击 Decrypt active roll
8. 预期：显示完整结果

如果以上全部成功 = 功能正常 ✅
如果某步失败 = 查看上面的故障排查
```

---

## 💡 总结

### Load existing roll 的作用

**简单说**：就像"历史记录查询"功能

- 📋 输入 Roll ID
- 🔍 从合约加载加密数据
- 🔓 解密查看详细结果
- 📊 恢复之前的投注记录

### 为什么需要这个功能？

1. **页面状态临时性**：刷新页面会丢失数据
2. **链上数据持久性**：投注永久存储在区块链
3. **随时查询**：可以随时重新加载任何投注
4. **跨设备访问**：在任何设备上都能查询

---

**现在请按照上面的步骤检查，告诉我你遇到的具体情况（按钮是否可点击？控制台有什么错误？），我来帮你解决！** 🔧

