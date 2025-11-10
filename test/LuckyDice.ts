import { expect } from "chai";
import { ethers, fhevm } from "hardhat";
import type { LuckyDice, LuckyDice__factory } from "../types";
import { FhevmType } from "@fhevm/hardhat-plugin";
import type { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

type Signers = {
  gameMaster: HardhatEthersSigner;
  player: HardhatEthersSigner;
  spectator: HardhatEthersSigner;
};

async function deployLuckyDice() {
  const factory = (await ethers.getContractFactory("LuckyDice")) as LuckyDice__factory;
  const contract = (await factory.deploy()) as LuckyDice;
  const address = await contract.getAddress();
  return { contract, address };
}

describe("LuckyDice", function () {
  let signers: Signers;
  let luckyDice: LuckyDice;
  let contractAddress: string;

  before(async function () {
    const available = await ethers.getSigners();
    const [gameMaster, player, spectator] = available;
    signers = { gameMaster, player, spectator } as Signers;
  });

  beforeEach(async function () {
    if (!fhevm.isMock) {
      console.warn(`This hardhat test suite cannot run on Sepolia Testnet`);
      this.skip();
    }
    ({ contract: luckyDice, address: contractAddress } = await deployLuckyDice());
  });

  it("records a dice roll and decrypts its results", async function () {
    const rollValue = 5;

    const encryptedRoll = await fhevm
      .createEncryptedInput(contractAddress, signers.player.address)
      .add8(rollValue)
      .encrypt();

    await luckyDice
      .connect(signers.player)
      .submitRoll(encryptedRoll.handles[0], encryptedRoll.inputProof);

    const rollId = await luckyDice.rollCount();
    expect(rollId).to.equal(1n);

    const [encRoll, encSum, encJackpot] = await luckyDice
      .connect(signers.player)
      .getEncryptedRollDetails(rollId);

    const decryptedRoll = await fhevm.userDecryptEuint(
      FhevmType.euint8,
      encRoll,
      contractAddress,
      signers.player,
    );
    const decryptedSum = await fhevm.userDecryptEuint(
      FhevmType.euint64,
      encSum,
      contractAddress,
      signers.player,
    );
    const decryptedJackpot = await fhevm.userDecryptEbool(encJackpot, contractAddress, signers.player);

    expect(decryptedRoll).to.equal(BigInt(rollValue));
    expect(decryptedSum).to.equal(BigInt(rollValue));
    expect(decryptedJackpot).to.equal(false);

    const encryptedPot = await luckyDice.connect(signers.player).getEncryptedPot();
    const pot = await fhevm.userDecryptEuint(FhevmType.euint64, encryptedPot, contractAddress, signers.player);
    expect(pot).to.equal(BigInt(rollValue));
  });

  it("restricts access to encrypted rolls until permission is granted", async function () {
    const encryptedRoll = await fhevm
      .createEncryptedInput(contractAddress, signers.player.address)
      .add8(6)
      .encrypt();

    await luckyDice
      .connect(signers.player)
      .submitRoll(encryptedRoll.handles[0], encryptedRoll.inputProof);

    const rollId = await luckyDice.rollCount();

    await expect(
      luckyDice.connect(signers.spectator).getEncryptedRollDetails(rollId),
    ).to.be.revertedWithCustomError(luckyDice, "NotAuthorized");

    await luckyDice.connect(signers.player).allowRollViewer(rollId, signers.spectator.address);

    const [, , encJackpot] = await luckyDice
      .connect(signers.spectator)
      .getEncryptedRollDetails(rollId);
    const jackpot = await fhevm.userDecryptEbool(encJackpot, contractAddress, signers.spectator);
    expect(typeof jackpot).to.equal("boolean");
  });
});

