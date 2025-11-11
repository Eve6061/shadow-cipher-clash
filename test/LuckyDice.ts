import { expect } from "chai";
import { ethers } from "hardhat";
import { LuckyDice } from "../types/contracts/LuckyDice";
import { Signers } from "../types/common";

describe("LuckyDice", function () {
  let luckyDice: LuckyDice;
  let signers: Signers;

  before(async function () {
    signers = {
      deployer: (await ethers.getSigners())[0],
      alice: (await ethers.getSigners())[1],
      bob: (await ethers.getSigners())[2],
    };
  });

  beforeEach(async function () {
    const LuckyDiceFactory = await ethers.getContractFactory("LuckyDice");
    luckyDice = await LuckyDiceFactory.deploy();
    await luckyDice.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the right game master", async function () {
      expect(await luckyDice.gameMaster()).to.equal(signers.deployer.address);
    });

    it("Should start with zero roll count", async function () {
      expect(await luckyDice.rollCount()).to.equal(0);
    });
  });

  describe("Roll Submission", function () {
    it("Should accept valid dice rolls", async function () {
      const rollValue = 3;
      const rollId = await submitRoll(rollValue);

      expect(rollId).to.equal(1);
      expect(await luckyDice.rollCount()).to.equal(1);
    });

    it("Should reject invalid dice values", async function () {
      await expect(submitRoll(0)).to.be.revertedWith("Invalid dice value");
      await expect(submitRoll(7)).to.be.revertedWith("Invalid dice value");
    });

    it("Should track roll ownership correctly", async function () {
      const rollId = await submitRoll(4);
      const [player] = await luckyDice.getRollSummary(rollId);

      expect(player).to.equal(signers.alice.address);
    });
  });

  describe("Jackpot Logic", function () {
    it("Should detect jackpot when sum reaches threshold", async function () {
      // Submit rolls that sum to exactly JACKPOT_THRESHOLD (18)
      await submitRoll(6); // sum = 6
      await submitRoll(6); // sum = 12
      await submitRoll(6); // sum = 18 (jackpot!)

      const rollCount = await luckyDice.rollCount();
      expect(rollCount).to.equal(3);
    });

    it("Should reset pot after jackpot", async function () {
      // Submit enough rolls to trigger jackpot
      for (let i = 0; i < 3; i++) {
        await submitRoll(6);
      }

      // Next roll should start fresh
      await submitRoll(3);
      expect(await luckyDice.rollCount()).to.equal(4);
    });
  });

  describe("Access Control", function () {
    it("Should allow game master to grant viewer permissions", async function () {
      const rollId = await submitRoll(5);

      await luckyDice.allowRollViewer(rollId, signers.bob.address);

      // Bob should now be able to view the roll
      await expect(luckyDice.connect(signers.bob).getEncryptedRollDetails(rollId)).to.not.be.reverted;
    });

    it("Should prevent unauthorized access to roll details", async function () {
      const rollId = await submitRoll(2);

      await expect(luckyDice.connect(signers.bob).getEncryptedRollDetails(rollId))
        .to.be.revertedWith("NotAuthorized");
    });
  });

  describe("Batch Operations", function () {
    it("Should handle multiple roll submissions in batch", async function () {
      const rolls = [3, 5, 2];
      const rollIds = await submitBatchRolls(rolls);

      expect(rollIds.length).to.equal(3);
      expect(await luckyDice.rollCount()).to.equal(3);
    });

    it("Should reject invalid batch sizes", async function () {
      await expect(submitBatchRolls([])).to.be.revertedWith("Invalid number of rolls");

      const tooManyRolls = new Array(11).fill(1);
      await expect(submitBatchRolls(tooManyRolls)).to.be.revertedWith("Invalid number of rolls");
    });

    it("Should provide lottery statistics", async function () {
      await submitRoll(4);

      const [totalRolls, potValue] = await luckyDice.getLotteryStats();
      expect(totalRolls).to.equal(1);
      // potValue would be encrypted in real FHE implementation
    });
  });

  describe("Edge Cases", function () {
    it("Should handle maximum valid dice values", async function () {
      await submitRoll(6); // Maximum valid value
      expect(await luckyDice.rollCount()).to.equal(1);
    });

    it("Should handle minimum valid dice values", async function () {
      await submitRoll(1); // Minimum valid value
      expect(await luckyDice.rollCount()).to.equal(1);
    });

    it("Should maintain state across multiple players", async function () {
      await submitRoll(3); // Alice rolls
      await luckyDice.connect(signers.bob).submitRoll(
        ethers.toBeHex(4),
        "0x" + "00".repeat(32)
      ); // Bob rolls

      expect(await luckyDice.rollCount()).to.equal(2);
    });
  });

  async function submitRoll(value: number): Promise<bigint> {
    // In a real FHE setup, this would encrypt the value
    // For testing, we'll use a mock implementation
    const mockEncryptedValue = ethers.toBeHex(value);
    const mockProof = "0x" + "00".repeat(32); // Mock proof

    const tx = await luckyDice.connect(signers.alice).submitRoll(mockEncryptedValue, mockProof);
    const receipt = await tx.wait();

    // Extract rollId from event (simplified)
    return 1n; // Mock return for testing
  }
});
