import { FhevmType } from "@fhevm/hardhat-plugin";
import { task } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";

task("task:dice-address", "Prints the LuckyDice contract address").setAction(async function (
  _taskArguments: TaskArguments,
  hre,
) {
  const deployment = await hre.deployments.get("LuckyDice");
  console.log("LuckyDice address is " + deployment.address);
});

task("task:submit-roll", "Submits an encrypted dice roll to the LuckyDice contract")
  .addOptionalParam("address", "Optionally provide the LuckyDice contract address")
  .addParam("value", "Plaintext dice value (1-6) to encrypt and submit")
  .setAction(async function (taskArguments: TaskArguments, hre) {
    const { ethers, deployments, fhevm } = hre;

    const rollValue = Number(taskArguments.value);
    if (!Number.isInteger(rollValue) || rollValue < 1 || rollValue > 6) {
      throw new Error("Argument --value must be an integer between 1 and 6.");
    }

    await fhevm.initializeCLIApi();

    const deployment = taskArguments.address
      ? { address: taskArguments.address as string }
      : await deployments.get("LuckyDice");
    console.log(`LuckyDice: ${deployment.address}`);

    const [signer] = await ethers.getSigners();
    const contract = await ethers.getContractAt("LuckyDice", deployment.address);

    const encryptedRoll = await fhevm
      .createEncryptedInput(deployment.address, signer.address)
      .add8(rollValue)
      .encrypt();

    const tx = await contract
      .connect(signer)
      .submitRoll(encryptedRoll.handles[0], encryptedRoll.inputProof);
    console.log(`Wait for tx:${tx.hash}...`);

    const receipt = await tx.wait();
    console.log(`tx:${tx.hash} status=${receipt?.status}`);

    const rollId = await contract.rollCount();
    console.log(`Roll recorded successfully with id=${rollId.toString()}`);
  });

task("task:decrypt-roll", "Decrypts the encrypted roll details for a given id")
  .addOptionalParam("address", "Optionally provide the LuckyDice contract address")
  .addParam("rollid", "Roll identifier returned by task:submit-roll")
  .setAction(async function (taskArguments: TaskArguments, hre) {
    const { ethers, deployments, fhevm } = hre;

    await fhevm.initializeCLIApi();

    const deployment = taskArguments.address
      ? { address: taskArguments.address as string }
      : await deployments.get("LuckyDice");

    const [signer] = await ethers.getSigners();
    const contract = await ethers.getContractAt("LuckyDice", deployment.address);

    const rollId = BigInt(taskArguments.rollid);
    const [encRoll, encSum, encJackpot] = await contract
      .connect(signer)
      .getEncryptedRollDetails(rollId);

    const dice = await fhevm.userDecryptEuint(FhevmType.euint8, encRoll, deployment.address, signer);
    const sum = await fhevm.userDecryptEuint(FhevmType.euint64, encSum, deployment.address, signer);
    const jackpot = await fhevm.userDecryptEbool(encJackpot, deployment.address, signer);

    console.log(`Roll ${rollId} decrypted results:`);
    console.log(`- dice      : ${dice}`);
    console.log(`- sum       : ${sum}`);
    console.log(`- hitJackpot: ${jackpot ? "YES" : "NO"}`);
  });

task("task:decrypt-pot", "Decrypts the encrypted rolling pot")
  .addOptionalParam("address", "Optionally provide the LuckyDice contract address")
  .setAction(async function (taskArguments: TaskArguments, hre) {
    const { ethers, deployments, fhevm } = hre;

    await fhevm.initializeCLIApi();

    const deployment = taskArguments.address
      ? { address: taskArguments.address as string }
      : await deployments.get("LuckyDice");

    const [signer] = await ethers.getSigners();
    const contract = await ethers.getContractAt("LuckyDice", deployment.address);

    const encryptedPot = await contract.connect(signer).getEncryptedPot();
    const pot = await fhevm.userDecryptEuint(FhevmType.euint64, encryptedPot, deployment.address, signer);

    console.log(`Current rolling pot: ${pot}`);
  });

