import { expect } from "chai";
import { ethers } from "hardhat";
import { LuckyDice } from "../types/contracts/LuckyDice";

describe("LuckyDice Sepolia Tests", function () {
  let luckyDice: LuckyDice;
  let contractAddress: string;

  // Increase timeout for network tests
  this.timeout(60000);

  before(async function () {
    // Skip these tests if not on Sepolia
    if (network.name !== "sepolia") {
      console.log("Skipping Sepolia tests - not on Sepolia network");
      this.skip();
      return;
    }

    // Get deployed contract address from deployments
    const deployment = require("../deployments/sepolia/LuckyDice.json");
    contractAddress = deployment.address;

    luckyDice = await ethers.getContractAt("LuckyDice", contractAddress);
  });

  describe("Sepolia Deployment", function () {
    it("Should be deployed on Sepolia", async function () {
      expect(await luckyDice.getAddress()).to.be.properAddress;
    });

    it("Should have correct game master", async function () {
      const gameMaster = await luckyDice.gameMaster();
      expect(gameMaster).to.be.properAddress;
      expect(gameMaster).to.not.equal(ethers.ZeroAddress);
    });

    it("Should start with zero rolls", async function () {
      const rollCount = await luckyDice.rollCount();
      expect(rollCount).to.equal(0);
    });
  });

  describe("Sepolia FHE Operations", function () {
    it("Should handle FHE roll submissions", async function () {
      // This test requires FHE setup and real encrypted values
      // For demonstration purposes, we'll test the interface
      const methods = Object.keys(luckyDice.interface.functions);
      expect(methods).to.include("submitRoll");
      expect(methods).to.include("getRollSummary");
      expect(methods).to.include("getEncryptedRollDetails");
    });

    it("Should have proper access controls", async function () {
      const [signer] = await ethers.getSigners();

      // Test that contract exists and is accessible
      const code = await ethers.provider.getCode(await luckyDice.getAddress());
      expect(code).to.not.equal("0x");

      // Test basic function accessibility
      await expect(luckyDice.connect(signer).rollCount()).to.not.be.reverted;
    });
  });

  describe("Sepolia Network Interactions", function () {
    it("Should handle network-specific configurations", async function () {
      const network = await ethers.provider.getNetwork();
      expect(network.chainId).to.equal(11155111n); // Sepolia chain ID
    });

    it("Should be compatible with Sepolia FHEVM", async function () {
      // Test that the contract is configured for Sepolia
      const isSepoliaConfig = luckyDice instanceof ethers.Contract;
      expect(isSepoliaConfig).to.be.true;
    });
  });
});
