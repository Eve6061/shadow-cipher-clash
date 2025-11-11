import { ethers } from "hardhat";

async function main() {
  console.log("Deploying LuckyDice contract...");

  const LuckyDice = await ethers.getContractFactory("LuckyDice");
  const luckyDice = await LuckyDice.deploy();

  await luckyDice.waitForDeployment();

  const address = await luckyDice.getAddress();
  console.log("LuckyDice deployed to:", address);

  // Verify contract on Etherscan if not on localhost
  if (network.name !== "localhost" && network.name !== "hardhat") {
    console.log("Waiting for block confirmations...");
    await luckyDice.deploymentTransaction()?.wait(5);

    console.log("Verifying contract...");
    try {
      await hre.run("verify:verify", {
        address: address,
        constructorArguments: [],
      });
    } catch (error) {
      console.log("Verification failed:", error);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
