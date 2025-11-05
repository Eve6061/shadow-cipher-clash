
/*
  This file is auto-generated.
  Command: 'npm run genabi'
*/
export const LuckyDiceABI = {
  "abi": [
    {
      "inputs": [],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "account",
          "type": "address"
        }
      ],
      "name": "NotAuthorized",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "rollId",
          "type": "uint256"
        }
      ],
      "name": "RollDoesNotExist",
      "type": "error"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "rollId",
          "type": "uint256"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "player",
          "type": "address"
        }
      ],
      "name": "RollSubmitted",
      "type": "event"
    },
    {
      "inputs": [],
      "name": "JACKPOT_THRESHOLD",
      "outputs": [
        {
          "internalType": "uint64",
          "name": "",
          "type": "uint64"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "viewer",
          "type": "address"
        }
      ],
      "name": "allowPotViewer",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "rollId",
          "type": "uint256"
        },
        {
          "internalType": "address",
          "name": "viewer",
          "type": "address"
        }
      ],
      "name": "allowRollViewer",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "gameMaster",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getEncryptedPot",
      "outputs": [
        {
          "internalType": "euint64",
          "name": "pot",
          "type": "bytes32"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "rollId",
          "type": "uint256"
        }
      ],
      "name": "getEncryptedRollDetails",
      "outputs": [
        {
          "internalType": "euint8",
          "name": "encryptedRoll",
          "type": "bytes32"
        },
        {
          "internalType": "euint64",
          "name": "cumulativeSum",
          "type": "bytes32"
        },
        {
          "internalType": "ebool",
          "name": "hitJackpot",
          "type": "bytes32"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "rollId",
          "type": "uint256"
        }
      ],
      "name": "getRollSummary",
      "outputs": [
        {
          "internalType": "address",
          "name": "player",
          "type": "address"
        },
        {
          "internalType": "uint64",
          "name": "createdAt",
          "type": "uint64"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "protocolId",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "pure",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "rollCount",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "externalEuint8",
          "name": "rollHandle",
          "type": "bytes32"
        },
        {
          "internalType": "bytes",
          "name": "rollProof",
          "type": "bytes"
        }
      ],
      "name": "submitRoll",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "rollId",
          "type": "uint256"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ]
} as const;

