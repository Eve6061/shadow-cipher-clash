import { expect } from "chai";
import { ethers, deployments, fhevm } from "hardhat";
import { FhevmType } from "@fhevm/hardhat-plugin";
import type { LuckyDice } from "../types";
import type { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("LuckyDiceSepolia", function () {
  let contract: LuckyDice;
  let contractAddress: string;
  let player: HardhatEthersSigner;

  before(async function () {
    if (fhevm.isMock) {
      console.warn(`This hardhat test suite can only run on Sepolia Testnet`);
      this.skip();
    }

    const deployment = await deployments.get("LuckyDice");
    contractAddress = deployment.address;
    contract = (await ethers.getContractAt("LuckyDice", deployment.address)) as LuckyDice;

    const signers = await ethers.getSigners();
    [player] = signers;
  });

  it("submits a roll and decrypts results on Sepolia", async function () {
    this.timeout(5 * 60 * 1000);

    const rollValue = 4;

    console.log(`  → Creating encrypted input with value ${rollValue}...`);
    const encryptedRoll = await fhevm
      .createEncryptedInput(contractAddress, player.address)
      .add8(rollValue)
      .encrypt();

    console.log(`  → Submitting roll to contract ${contractAddress}...`);
    const tx = await contract
      .connect(player)
      .submitRoll(encryptedRoll.handles[0], encryptedRoll.inputProof);
    const receipt = await tx.wait();
    console.log(`  → Transaction confirmed: ${receipt?.hash}`);

    const rollId = await contract.rollCount();
    console.log(`  → Roll ID: ${rollId}`);
    expect(rollId).to.be.greaterThan(0n);

    console.log(`  → Fetching encrypted roll details...`);
    const [encRoll, encSum, encJackpot] = await contract
      .connect(player)
      .getEncryptedRollDetails(rollId);

    console.log(`  → Waiting 10 seconds for ACL updates to propagate...`);
    await new Promise(resolve => setTimeout(resolve, 10000));

    console.log(`  → Decrypting roll value...`);
    const dice = await fhevm.userDecryptEuint(FhevmType.euint8, encRoll, contractAddress, player);
    console.log(`  → Decrypted dice: ${dice}`);

    console.log(`  → Decrypting sum...`);
    const sum = await fhevm.userDecryptEuint(FhevmType.euint64, encSum, contractAddress, player);
    console.log(`  → Decrypted sum: ${sum}`);

    console.log(`  → Decrypting jackpot flag...`);
    const jackpot = await fhevm.userDecryptEbool(encJackpot, contractAddress, player);
    console.log(`  → Jackpot: ${jackpot}`);

    expect(dice).to.equal(BigInt(rollValue));
    expect(sum).to.be.greaterThanOrEqual(BigInt(rollValue));
    expect(typeof jackpot).to.equal("boolean");
  });
});

