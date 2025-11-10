import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { http } from "wagmi";
import { hardhat, sepolia } from "wagmi/chains";

// Use a valid WalletConnect Project ID or a placeholder
// Get your own at https://cloud.walletconnect.com
export const walletProjectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6";

export const wagmiConfig = getDefaultConfig({
  appName: "Lucky Dice Lottery",
  projectId: walletProjectId,
  chains: [hardhat, sepolia],
  transports: {
    [hardhat.id]: http("http://127.0.0.1:8545"),
    [sepolia.id]: http("https://ethereum-sepolia-rpc.publicnode.com"),
  },
});

export const initialMockChains: Readonly<Record<number, string>> = {
  [hardhat.id]: "http://127.0.0.1:8545",
};

