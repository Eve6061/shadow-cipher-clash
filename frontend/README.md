# Lucky Dice Frontend

This Next.js application powers the user interface for the Lucky Dice Lottery. It connects to the LuckyDice smart
contract, encrypts dice rolls via the FHEVM SDK, and renders decrypted outcomes for authorised accounts.

## 1. Setup

```bash
npm install
```

The frontend reads deployment addresses from `abi/LuckyDiceAddresses.ts`. The Hardhat (local) address is pre-filled.
After deploying to Sepolia, update the corresponding entry so the UI can resolve the contract.

## 2. Development

```bash
npm run dev
```

Visit `http://localhost:3000` and connect a wallet via RainbowKit. On the local chain, make sure the FHE Hardhat node
is running (`npx hardhat node`) and that `LuckyDice` has been deployed (`npx hardhat deploy --network localhost`).

## 3. Features

- RainbowKit wallet connection (top-right corner)
- Fully homomorphic encryption of dice values before submission
- Encrypted aggregation of the rolling jackpot pot
- Controlled decryption of individual rolls and the pot
- Activity log of recently decrypted rolls

## 4. Commands

| Command         | Description                       |
| --------------- | --------------------------------- |
| `npm run dev`   | Start the Next.js dev server      |
| `npm run build` | Create a production build         |
| `npm run start` | Serve the production build        |
| `npm run lint`  | Run ESLint on the project         |

## 5. Relayer Notes

- On **localhost** the FHEVM SDK connects to the Hardhat FHE node and no external relayer is required.
- On **Sepolia** you must configure the official Zama relayer (or your own). If the SDK cannot load the relayer bundle
  the UI will surface an explanatory warning.

## 6. Assets

Custom branding lives in `public/logo.svg` and `public/favicon.svg`. Update these files to adjust the application
identity.

## 7. License

Distributed under the BSD-3-Clause-Clear License. See the repository root for details.
