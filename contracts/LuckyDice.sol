// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {
    FHE,
    ebool,
    euint8,
    euint64,
    externalEuint8
} from "@fhevm/solidity/lib/FHE.sol";
import {SepoliaConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title Lucky Dice Lottery
/// @notice Homomorphic dice game that aggregates encrypted rolls and detects jackpot hits privately.
/// @dev Demonstrates encrypted submissions, homomorphic aggregation, and private jackpot evaluation on-chain.
contract LuckyDice is SepoliaConfig {
    uint64 public constant JACKPOT_THRESHOLD = 18;

    struct Roll {
        address player;
        euint8 encryptedRoll;
        euint64 sumAfterRoll;
        ebool hitJackpot;
        uint64 createdAt;
    }

    address public immutable gameMaster;
    uint256 public rollCount;

    euint64 private _rollingPot;

    mapping(uint256 => Roll) private _rolls;
    mapping(uint256 => mapping(address => bool)) private _rollViewers;
    mapping(address => bool) private _potViewers;

    error RollDoesNotExist(uint256 rollId);
    error NotAuthorized(address account);

    event RollSubmitted(uint256 indexed rollId, address indexed player);
    constructor() {
        gameMaster = msg.sender;
        _potViewers[msg.sender] = true;
        // Note: _rollingPot is uninitialized (zero), so no allowThis needed yet
    }

    /// @notice Submit an encrypted dice roll and update the lottery state.
    /// @param rollHandle Ciphertext handle of the dice value (1-6).
    /// @param rollProof Proof validating the ciphertext integrity.
    /// @return rollId Unique identifier of the recorded roll entry.
    function submitRoll(
        externalEuint8 rollHandle,
        bytes calldata rollProof
    ) external returns (uint256 rollId) {
        euint8 rollValue = FHE.fromExternal(rollHandle, rollProof);
        euint64 rollAs64 = FHE.asEuint64(rollValue);

        // Initialize _rollingPot to zero if this is the first roll
        if (rollCount == 0) {
            _rollingPot = FHE.asEuint64(0);
            FHE.allowThis(_rollingPot);
        }

        euint64 updatedSum = FHE.add(_rollingPot, rollAs64);

        euint64 threshold = FHE.asEuint64(JACKPOT_THRESHOLD);
        ebool hasJackpot = FHE.ge(updatedSum, threshold);

        euint64 winnerMask = FHE.asEuint64(hasJackpot);
        euint64 deduction = FHE.mul(threshold, winnerMask);
        euint64 normalizedPot = FHE.sub(updatedSum, deduction);

        _rollingPot = normalizedPot;
        _allowPotForContract();
        _allowPot(gameMaster);

        rollId = ++rollCount;
        Roll storage entry = _rolls[rollId];
        entry.player = msg.sender;
        entry.encryptedRoll = rollValue;
        entry.sumAfterRoll = updatedSum;
        entry.hitJackpot = hasJackpot;
        entry.createdAt = uint64(block.timestamp);

        // Allow contract to manage these handles
        FHE.allowThis(rollValue);
        FHE.allowThis(updatedSum);
        FHE.allowThis(hasJackpot);

        _grantRollViewer(rollId, msg.sender);
        _allowRoll(entry, msg.sender);

        _potViewers[msg.sender] = true;
        _allowPot(msg.sender);

        _grantRollViewer(rollId, gameMaster);
        _allowRoll(entry, gameMaster);

        emit RollSubmitted(rollId, msg.sender);
    }

    /// @notice Returns roll metadata without exposing encrypted values.
    /// @param rollId Identifier returned by `submitRoll`.
    /// @return player Roll owner.
    /// @return createdAt Timestamp of submission.
    function getRollSummary(
        uint256 rollId
    ) external view returns (address player, uint64 createdAt) {
        Roll storage roll = _requireRoll(rollId);
        return (roll.player, roll.createdAt);
    }

    /// @notice Returns encrypted roll details for authorized viewers.
    /// @param rollId Identifier returned by `submitRoll`.
    /// @return encryptedRoll Ciphertext of the submitted dice value.
    /// @return cumulativeSum Ciphertext representing the cumulative sum after this roll.
    /// @return hitJackpot Ciphertext flag indicating whether the threshold was reached.
    function getEncryptedRollDetails(
        uint256 rollId
    )
        external
        view
        returns (euint8 encryptedRoll, euint64 cumulativeSum, ebool hitJackpot)
    {
        Roll storage roll = _requireRoll(rollId);
        if (!_rollViewers[rollId][msg.sender]) {
            revert NotAuthorized(msg.sender);
        }
        return (roll.encryptedRoll, roll.sumAfterRoll, roll.hitJackpot);
    }

    /// @notice Allows the roll owner or game master to grant decrypt permissions.
    /// @param rollId Identifier returned by `submitRoll`.
    /// @param viewer Address authorized to retrieve ciphertexts.
    function allowRollViewer(uint256 rollId, address viewer) external {
        Roll storage roll = _requireRoll(rollId);
        if (msg.sender != roll.player && msg.sender != gameMaster) {
            revert NotAuthorized(msg.sender);
        }
        _grantRollViewer(rollId, viewer);
        _allowRoll(roll, viewer);
    }

    /// @notice Returns the encrypted rolling pot for authorized addresses.
    function getEncryptedPot() external view returns (euint64 pot) {
        // Allow anyone to view the pot (public lottery)
        // Note: The pot is encrypted, so viewing requires decryption permissions
        return _rollingPot;
    }

    /// @notice Submit multiple dice rolls in a single transaction for efficiency.
    /// @param rollHandles Array of ciphertext handles for dice values (1-6).
    /// @param rollProofs Array of proofs validating the ciphertext integrity.
    /// @return rollIds Array of unique identifiers for the recorded roll entries.
    function submitMultipleRolls(
        externalEuint8[] calldata rollHandles,
        bytes[] calldata rollProofs
    ) external returns (uint256[] memory rollIds) {
        require(rollHandles.length == rollProofs.length, "Mismatched array lengths");
        require(rollHandles.length > 0 && rollHandles.length <= 10, "Invalid number of rolls");

        rollIds = new uint256[](rollHandles.length);

        for (uint256 i = 0; i < rollHandles.length; i++) {
            rollIds[i] = _submitSingleRoll(rollHandles[i], rollProofs[i]);
        }
    }

    /// @notice Get statistics about the current lottery state.
    /// @return totalRolls Total number of rolls submitted.
    /// @return potValue Current encrypted pot value (requires decryption).
    function getLotteryStats() external view returns (uint256 totalRolls, euint64 potValue) {
        return (rollCount, _rollingPot);
    }

    /// @dev Internal function to handle single roll submission logic.
    function _submitSingleRoll(
        externalEuint8 rollHandle,
        bytes calldata rollProof
    ) private returns (uint256 rollId) {
        euint8 rollValue = FHE.fromExternal(rollHandle, rollProof);
        euint64 rollAs64 = FHE.asEuint64(rollValue);

        // Initialize _rollingPot to zero if this is the first roll
        if (rollCount == 0) {
            _rollingPot = FHE.asEuint64(0);
            FHE.allowThis(_rollingPot);
        }

        euint64 updatedSum = FHE.add(_rollingPot, rollAs64);

        euint64 threshold = FHE.asEuint64(JACKPOT_THRESHOLD);
        ebool hasJackpot = FHE.ge(updatedSum, threshold);

        euint64 winnerMask = FHE.asEuint64(hasJackpot);
        euint64 deduction = FHE.mul(threshold, winnerMask);
        euint64 normalizedPot = FHE.sub(updatedSum, deduction);

        _rollingPot = normalizedPot;
        _allowPotForContract();
        _allowPot(gameMaster);

        rollId = ++rollCount;
        Roll storage entry = _rolls[rollId];
        entry.player = msg.sender;
        entry.encryptedRoll = rollValue;
        entry.sumAfterRoll = updatedSum;
        entry.hitJackpot = hasJackpot;
        entry.createdAt = uint64(block.timestamp);

        // Allow contract to manage these handles
        FHE.allowThis(rollValue);
        FHE.allowThis(updatedSum);
        FHE.allowThis(hasJackpot);

        _grantRollViewer(rollId, msg.sender);
        _allowRoll(entry, msg.sender);

        _potViewers[msg.sender] = true;
        _allowPot(msg.sender);

        _grantRollViewer(rollId, gameMaster);
        _allowRoll(entry, gameMaster);

        emit RollSubmitted(rollId, msg.sender);
    }

    /// @notice Grants pot viewing ability to another address.
    /// @param viewer Address to authorize.
    function allowPotViewer(address viewer) external {
        if (!_potViewers[msg.sender]) {
            revert NotAuthorized(msg.sender);
        }
        _potViewers[viewer] = true;
        _allowPot(viewer);
    }

    function _allowRoll(Roll storage roll, address viewer) private {
        FHE.allow(roll.encryptedRoll, viewer);
        FHE.allow(roll.sumAfterRoll, viewer);
        FHE.allow(roll.hitJackpot, viewer);
    }

    function _allowPotForContract() private {
        FHE.allowThis(_rollingPot);
    }

    function _allowPot(address viewer) private {
        FHE.allow(_rollingPot, viewer);
    }

    function _grantRollViewer(uint256 rollId, address viewer) private {
        _rollViewers[rollId][viewer] = true;
    }

    function _requireRoll(uint256 rollId) private view returns (Roll storage roll) {
        roll = _rolls[rollId];
        if (roll.player == address(0)) {
            revert RollDoesNotExist(rollId);
        }
    }
}

