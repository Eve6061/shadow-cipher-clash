import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  if (hre.network.name !== "hardhat") {
    await hre.fhevm.initializeCLIApi();
  }

  const deployedLuckyDice = await deploy("LuckyDice", {
    from: deployer,
    log: true,
    waitConfirmations: 1,
  });

  console.log(`LuckyDice contract: `, deployedLuckyDice.address);
};
export default func;
func.id = "deploy_lucky_dice"; // id required to prevent reexecution
func.tags = ["LuckyDice"];
