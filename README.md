# 🎲 Lucky Dice - Encrypted Lottery on FHEVM

An encrypted dice lottery game built with [Zama's FHEVM](https://docs.zama.ai/fhevm) (Fully Homomorphic Encryption Virtual Machine), demonstrating privacy-preserving smart contracts on Ethereum.

## 🎬 Live Demo

- **🌐 Vercel Deployment**: [https://lucky-blond-kappa.vercel.app/](https://lucky-blond-kappa.vercel.app/)
- **📹 Video Demo**: [Watch Demo Video](./lucky.mp4)

## 🌟 Features

- 🔒 **Fully Encrypted Dice Rolls**: Your dice choices are encrypted on-chain using FHEVM
- 🎰 **Homomorphic Jackpot Detection**: Contract detects jackpots without decrypting individual rolls
- 🎯 **Private Result Reveal**: Only authorized addresses can decrypt roll results
- 🌐 **Multi-Network Support**: Works on both Hardhat local network and Sepolia testnet
- ⚡ **Modern UI**: Beautiful React/Next.js frontend with RainbowKit wallet integration

## 🎮 How It Works

1. **Choose a dice value** (1-6) on the frontend
2. **Encrypt locally** using FHEVM SDK in your browser
3. **Submit to blockchain** - your choice stays encrypted on-chain
4. **Homomorphic aggregation** - contract sums encrypted values without seeing them
5. **Jackpot detection** - triggers when encrypted sum ≥ 18
6. **Decrypt results** - only you can see your roll and check if you won

### Game Rules

- Roll a dice (1-6) and submit encrypted value
- Each roll adds to the encrypted "rolling pot"
- When pot reaches ≥18, **Jackpot!** 🎉
- Pot resets and a new round begins
- All operations happen on encrypted data

## 🔐 Core Encryption Logic

### Contract Architecture (`LuckyDice.sol`)

The Lucky Dice contract leverages FHEVM to perform all operations on encrypted data:

```solidity
contract LuckyDice is SepoliaConfig {
    uint64 public constant JACKPOT_THRESHOLD = 18;
    
    struct Roll {
        address player;
        euint8 encryptedRoll;      // Encrypted dice value (1-6)
        euint64 sumAfterRoll;      // Encrypted sum after this roll
        ebool hitJackpot;          // Encrypted jackpot flag
        uint64 createdAt;
    }
    
    euint64 private _rollingPot;   // Encrypted rolling sum
}
```

### Key Encryption/Decryption Workflow

#### 1. **Client-Side Encryption** (Frontend)

```typescript
// User selects dice value (1-6)
const diceValue = 5;

// Encrypt using FHEVM SDK
const { handles, proof } = await fhevm.encrypt_euint8(diceValue);

// Submit encrypted data to contract
await contract.submitRoll(handles[0], proof);
```

**Key Points:**
- Encryption happens **in the browser** using FHEVM SDK
- Only encrypted ciphertext is sent to the blockchain
- Original value never leaves the user's device in cleartext

#### 2. **On-Chain Homomorphic Operations** (Smart Contract)

```solidity
function submitRoll(
    externalEuint8 rollHandle,
    bytes calldata rollProof
) external returns (uint256 rollId) {
    // Convert external handle to internal encrypted type
    euint8 rollValue = FHE.fromExternal(rollHandle, rollProof);
    
    // Cast to euint64 for aggregation
    euint64 rollAs64 = FHE.asEuint64(rollValue);
    
    // Homomorphic addition (works on encrypted data!)
    euint64 updatedSum = FHE.add(_rollingPot, rollAs64);
    
    // Homomorphic comparison for jackpot detection
    euint64 threshold = FHE.asEuint64(JACKPOT_THRESHOLD);
    ebool hasJackpot = FHE.ge(updatedSum, threshold);  // updatedSum >= 18
    
    // Conditional pot reset using homomorphic operations
    euint64 winnerMask = FHE.asEuint64(hasJackpot);
    euint64 deduction = FHE.mul(threshold, winnerMask);
    euint64 normalizedPot = FHE.sub(updatedSum, deduction);
    
    // Update state with encrypted values
    _rollingPot = normalizedPot;
    
    // Store encrypted roll data
    Roll storage entry = _rolls[rollId];
    entry.encryptedRoll = rollValue;
    entry.sumAfterRoll = updatedSum;
    entry.hitJackpot = hasJackpot;
}
```

**Key Points:**
- All arithmetic happens on **encrypted data** using homomorphic operations
- `FHE.add()`, `FHE.ge()`, `FHE.mul()`, `FHE.sub()` work without decryption
- Contract logic executes without seeing actual dice values
- Jackpot detection is done **homomorphically** - no cleartext comparison needed

#### 3. **Selective Decryption** (Access Control)

```solidity
function getEncryptedRoll(uint256 rollId, address account) 
    public view returns (euint8, euint64, ebool) 
{
    if (!_rollViewers[rollId][account]) {
        revert NotAuthorized(account);
    }
    Roll storage entry = _rolls[rollId];
    return (entry.encryptedRoll, entry.sumAfterRoll, entry.hitJackpot);
}
```

**Key Points:**
- Returns **still-encrypted** handles to authorized viewers
- Access control via `_rollViewers` mapping
- Only the **player** and **gameMaster** can access roll data

#### 4. **Client-Side Decryption** (Frontend)

```typescript
// Request encrypted handles from contract
const { encryptedRoll, sumAfterRoll, hitJackpot } = 
    await contract.getEncryptedRoll(rollId, userAddress);

// Decrypt using FHEVM SDK
const diceValue = await fhevm.decrypt(encryptedRoll);
const totalSum = await fhevm.decrypt(sumAfterRoll);
const isJackpot = await fhevm.decrypt(hitJackpot);

console.log(`Your roll: ${diceValue}`);
console.log(`Total sum: ${totalSum}`);
console.log(`Jackpot: ${isJackpot ? 'YES!' : 'No'}`);
```

**Key Points:**
- Decryption requires **authorization** from the contract
- Happens on client side using FHEVM RelayerSDK
- Only authorized addresses can decrypt data

### Privacy Guarantees

| Data | On-Chain State | Who Can Decrypt |
|------|----------------|-----------------|
| Dice Roll Value (1-6) | ✅ Encrypted (`euint8`) | Player + GameMaster |
| Rolling Pot Sum | ✅ Encrypted (`euint64`) | Authorized viewers |
| Jackpot Flag | ✅ Encrypted (`ebool`) | Player + GameMaster |
| Player Address | ⚠️ Public | Everyone |
| Timestamp | ⚠️ Public | Everyone |
| Roll Count | ⚠️ Public | Everyone |

### Homomorphic Operation Examples

```solidity
// Example: Adding two encrypted numbers
euint8 a = FHE.asEuint8(5);  // Encrypted 5
euint8 b = FHE.asEuint8(3);  // Encrypted 3
euint8 c = FHE.add(a, b);    // Encrypted 8 (computed without decryption!)

// Example: Comparing encrypted values
ebool isGreater = FHE.ge(c, FHE.asEuint8(7));  // Encrypted "true"

// Example: Conditional selection
euint8 result = FHE.select(isGreater, a, b);   // Returns 'a' if true, 'b' if false
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- MetaMask or compatible wallet
- (Optional) Sepolia ETH for testnet deployment

### Local Development

1. **Clone the repository**
```bash
git clone https://github.com/Eve6061/shadow-cipher-clash.git
cd shadow-cipher-clash/lucky
```

2. **Install dependencies**
```bash
npm install
cd frontend
npm install
cd ..
```

3. **Start local network**
```bash
# Option 1: Use the automated script (Windows)
.\restart-services.bat

# Option 2: Manual steps
# Terminal 1: Start Hardhat node
npx hardhat node

# Terminal 2: Deploy contracts
npx hardhat deploy --network localhost

# Terminal 3: Start frontend
cd frontend
npm run dev
```

4. **Configure MetaMask**
- Network: Hardhat Local
- RPC URL: `http://localhost:8545`
- Chain ID: `31337`
- Currency: ETH

5. **Import test account**
```
Address: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
Private Key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
```

6. **Open the app**
```
http://localhost:3000
```

## 📁 Project Structure

```
lucky/
├── contracts/          # Solidity contracts
│   └── LuckyDice.sol  # Main lottery contract with FHEVM
├── frontend/          # Next.js frontend
│   ├── app/          # App pages and layouts
│   ├── components/   # React components
│   ├── hooks/        # Custom React hooks
│   ├── fhevm/        # FHEVM SDK integration
│   └── abi/          # Auto-generated contract ABIs
├── deploy/           # Deployment scripts
├── test/            # Contract tests
├── tasks/           # Hardhat tasks
└── docs/            # Documentation (Chinese)
    ├── 本地运行指南.md
    ├── MetaMask配置指南.md
    ├── Sepolia测试网使用指南.md
    └── ...more guides
```

## 🔧 Available Scripts

### Backend (Hardhat)

```bash
# Compile contracts
npx hardhat compile

# Run tests
npx hardhat test

# Deploy to local network
npx hardhat deploy --network localhost

# Deploy to Sepolia
npx hardhat deploy --network sepolia

# Run Hardhat node
npx hardhat node
```

### Frontend (Next.js)

```bash
cd frontend

# Development server
npm run dev

# Production build
npm run build

# Start production server
npm start

# Generate contract ABIs
npm run genabi
```

## 🌐 Networks

### Hardhat Local (Development)

- **Chain ID**: 31337
- **RPC**: http://localhost:8545
- **FHEVM**: Mock mode (instant, no external dependencies)
- **Best for**: Development and testing

### Sepolia Testnet (Public Testing)

- **Chain ID**: 11155111
- **Contract**: `0x1a84Ec39BA9480D67740B37bD1aFdE4fEA904A3c`
- **FHEVM**: Zama RelayerSDK (requires internet connection)
- **Faucet**: https://sepoliafaucet.com/
- **Best for**: Public demos and collaborative testing

## 🎯 Key Technologies

- **Smart Contracts**: Solidity + FHEVM
- **Frontend**: Next.js 15 + React 19 + TypeScript
- **Wallet Integration**: RainbowKit + Wagmi
- **Encryption**: Zama FHEVM SDK
- **Styling**: Tailwind CSS
- **Development**: Hardhat + TypeChain

## 🔒 Security & Privacy

### What's Encrypted?

- ✅ Dice roll values (1-6)
- ✅ Rolling pot sum
- ✅ Jackpot detection flags

### What's Public?

- ⚠️ Player addresses
- ⚠️ Transaction timestamps
- ⚠️ Roll counts

### Key Privacy Features

1. **On-chain encryption**: Dice values never appear in cleartext on blockchain
2. **Homomorphic operations**: Contract can compute on encrypted data
3. **Selective decryption**: Only authorized addresses can decrypt results
4. **Access control**: Fine-grained permissions for viewing encrypted data

## 🧪 Testing

### Run All Tests

```bash
npx hardhat test
```

### Test on Sepolia

```bash
npx hardhat test --network sepolia
```

### Test Coverage

The project includes comprehensive tests for:
- Contract deployment and initialization
- Encrypted roll submission
- Jackpot detection and pot reset
- Access control and permissions
- Decryption functionality

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the BSD-3-Clause-Clear License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Zama](https://www.zama.ai/) for FHEVM technology
- [Hardhat](https://hardhat.org/) for development environment
- [RainbowKit](https://www.rainbowkit.com/) for wallet integration
- Original template from [fhevm-hardhat-template](https://github.com/zama-ai/fhevm-hardhat-template)

## 📞 Support

- **GitHub**: https://github.com/Eve6061/shadow-cipher-clash
- **Zama Docs**: https://docs.zama.ai/fhevm
- **Zama Discord**: https://discord.com/invite/fhe-org

## 🎲 Try It Now!

Visit our **live demo at [https://lucky-blond-kappa.vercel.app/](https://lucky-blond-kappa.vercel.app/)** to experience encrypted lottery gaming with FHEVM!

---

**Built with ❤️ and 🔐 using Zama FHEVM**
