"use client";

import { useEffect, useMemo, useState } from "react";
import { useAccount } from "wagmi";

import { ErrorNotDeployed } from "@/components/ErrorNotDeployed";
import { initialMockChains } from "@/lib/wagmi";
import { useFhevm } from "@/fhevm/useFhevm";
import { useInMemoryStorage } from "@/hooks/useInMemoryStorage";
import { useLuckyDice } from "@/hooks/useLuckyDice";
import { useWagmiEthers } from "@/hooks/wagmi/useWagmiEthers";

const diceOptions = [1, 2, 3, 4, 5, 6];

function formatTimestamp(timestamp: number) {
  if (!timestamp) return "--";
  return new Date(timestamp * 1000).toLocaleString();
}

export function LuckyDiceApp() {
  const [mounted, setMounted] = useState(false);
  const { isConnected } = useAccount();
  const { storage } = useInMemoryStorage();

  const { chainId, ethersProvider, ethersReadonlyProvider, ethersSigner, isConnected: wagmiConnected } =
    useWagmiEthers(initialMockChains);

  useEffect(() => {
    setMounted(true);
  }, []);

  const provider = useMemo(() => {
    // For FHEVM, we need the raw EIP-1193 provider or an RPC URL
    // Since we're on localhost (chainId 31337), we can use the RPC URL directly
    if (chainId === 31337) {
      // For Hardhat local network, use the RPC URL
      return "http://127.0.0.1:8545";
    }
    
    // For other networks, try to extract the provider from ethersProvider
    if (ethersProvider) {
      // ethersProvider is a BrowserProvider, access its internal provider
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const internalProvider = (ethersProvider as any)._getConnection?.()?.provider;
      if (internalProvider) {
        return internalProvider;
      }
    }
    
    // Fallback to window.ethereum
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (typeof window !== "undefined" && (window as any).ethereum) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (window as any).ethereum;
    }
    
    return undefined;
  }, [ethersProvider, chainId]);

  const {
    instance,
    status: fhevmStatus,
    error: fhevmError,
    refresh: refreshFhevm,
  } = useFhevm({
    provider,
    chainId,
    initialMockChains,
    enabled: wagmiConnected,
  });

  const dice = useLuckyDice({
    instance,
    chainId,
    ethersSigner,
    ethersReadonlyProvider,
    fhevmDecryptionSignatureStorage: storage,
  });

  const [diceValue, setDiceValue] = useState<string>("4");
  const [rollLookup, setRollLookup] = useState<string>("");
  const [batchRolls, setBatchRolls] = useState<string[]>(["4", "2", "6"]);
  const [isBatchMode, setIsBatchMode] = useState(false);

  useEffect(() => {
    if (dice.isDeployed) {
      dice.refreshRollCount();
      dice.fetchEncryptedPot();
    }
    // Only run when isDeployed changes, not when the functions change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dice.isDeployed]);

  const canEncrypt = instance !== undefined && wagmiConnected;
  const submitDisabled =
    !wagmiConnected || !canEncrypt || dice.isSubmitting || !diceValue || Number(diceValue) < 1 || Number(diceValue) > 6;

  const activeStatus =
    dice.status ||
    (fhevmStatus === "error" && fhevmError
      ? fhevmError.message
      : fhevmStatus === "ready"
      ? "FHEVM ready."
      : fhevmStatus === "loading"
      ? "Connecting to FHEVM runtime..."
      : "");

  const relayerHelp =
    fhevmStatus === "error" && fhevmError?.message?.includes("relayerSDK")
      ? "Relayer SDK could not be initialised. When testing on Sepolia, please configure the official Zama relayer endpoint. On localhost, ensure the FHE Hardhat node is running."
      : undefined;

  if (dice.isDeployed === false) {
    return <ErrorNotDeployed chainId={chainId} contractName="LuckyDice" />;
  }

  return (
    <div className="space-y-10">
      <section className="glass-surface relative overflow-hidden p-8">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-purple-500/20 via-transparent to-fuchsia-500/10" />
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl space-y-4">
            <h1 className="text-4xl font-semibold text-white">Encrypted Dice Lottery</h1>
            <p className="text-base leading-7 text-slate-200/80">
              Submit a dice roll that stays private on-chain. Lucky Dice aggregates encrypted rolls, checks for the
              jackpot threshold homomorphically, and lets you decrypt the outcome only when you have the right
              permissions.
            </p>
            <div className="flex flex-wrap gap-3 text-sm text-white/70">
              <span className="rounded-full border border-white/20 px-3 py-1">FHE Encryption</span>
              <span className="rounded-full border border-white/20 px-3 py-1">Homomorphic Aggregation</span>
              <span className="rounded-full border border-white/20 px-3 py-1">Private Jackpot Reveal</span>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/20 bg-black/40 p-4 shadow-lg shadow-purple-900/20">
              <p className="text-xs uppercase tracking-wide text-slate-400">FHEVM Status</p>
              <p className="mt-2 text-2xl font-semibold text-white">
                {fhevmStatus === "ready"
                  ? "Ready"
                  : fhevmStatus === "loading"
                  ? "Connecting"
                  : fhevmStatus === "error"
                  ? "Error"
                  : "Idle"}
              </p>
              <p className="mt-1 text-xs text-slate-400">
                {mounted ? (chainId ? `chainId ${chainId}` : "No network selected") : "Loading..."}
              </p>
              <button
                className="mt-4 rounded-xl border border-white/20 px-3 py-1 text-xs text-white/70 transition hover:border-white/40"
                onClick={refreshFhevm}
                type="button"
              >
                Refresh connection
              </button>
            </div>
            <div className="rounded-2xl border border-white/20 bg-black/40 p-4 shadow-lg shadow-purple-900/20">
              <p className="text-xs uppercase tracking-wide text-slate-400">Total Rolls</p>
              <p className="mt-2 text-3xl font-semibold text-white">{dice.rollCount.toString()}</p>
              <p className="mt-1 text-xs text-slate-400">
                Each roll is encrypted and influences the rolling jackpot pot.
              </p>
            </div>
          </div>
        </div>
      </section>

      {mounted && relayerHelp ? (
        <div className="rounded-2xl border border-yellow-500/30 bg-yellow-500/10 p-4 text-sm text-yellow-100 shadow-lg shadow-yellow-900/20">
          {relayerHelp}
        </div>
      ) : null}

      <section className="glass-surface p-6">
        <h2 className="text-xl font-semibold text-white">Lottery Statistics</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-lg border border-white/10 bg-black/20 p-4">
            <p className="text-sm text-slate-400">Total Rolls</p>
            <p className="text-2xl font-semibold text-white">{dice.rollCount?.toString() || "0"}</p>
          </div>
          <div className="rounded-lg border border-white/10 bg-black/20 p-4">
            <p className="text-sm text-slate-400">Jackpot Threshold</p>
            <p className="text-2xl font-semibold text-white">18</p>
          </div>
          <div className="rounded-lg border border-white/10 bg-black/20 p-4">
            <p className="text-sm text-slate-400">Active Players</p>
            <p className="text-2xl font-semibold text-white">--</p>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[3fr_2fr]">
        <div className="glass-surface p-6">
          <h2 className="text-xl font-semibold text-white">Submit encrypted roll</h2>
          <p className="mt-2 text-sm text-slate-300/80">
            Choose a dice value, encrypt it locally with the FHEVM coprocessor, and submit it to the chain. Your guess
            never leaves the browser in cleartext.
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-[200px_1fr] md:items-center">
            <div className="flex items-center gap-2">
              <label htmlFor="diceValue" className="text-sm font-medium text-white/90">
                Dice value
              </label>
              <select
                id="diceValue"
                className="w-24 rounded-xl border border-white/20 bg-black/40 px-3 py-2 text-white focus:border-purple-500 focus:outline-none"
                value={diceValue}
                onChange={(event) => setDiceValue(event.target.value)}
              >
                {diceOptions.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              disabled={submitDisabled}
              onClick={() => dice.submitRoll(Number(diceValue))}
              className="w-full rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 px-4 py-3 text-sm font-semibold text-white transition hover:from-purple-400 hover:to-indigo-400 disabled:cursor-not-allowed disabled:bg-white/10"
            >
              {dice.isSubmitting ? "Encrypting & submitting..." : "Submit encrypted roll"}
            </button>
          </div>

          {mounted && !isConnected ? (
            <p className="mt-4 text-xs text-slate-400">Connect a wallet to start rolling the dice.</p>
          ) : null}
        </div>

        <div className="glass-surface space-y-4 p-6">
          <h2 className="text-xl font-semibold text-white">Load existing roll</h2>
          <p className="text-sm text-slate-300/80">
            If you already have a roll identifier, you can retrieve its encrypted handles before requesting a decrypt.
          </p>
          <div className="flex gap-3">
            <input
              value={rollLookup}
              onChange={(event) => setRollLookup(event.target.value.replace(/\D/g, ""))}
              placeholder="Roll ID"
              className="flex-1 rounded-xl border border-white/20 bg-black/40 px-3 py-2 text-white focus:border-purple-500 focus:outline-none"
            />
            <button
              type="button"
              disabled={!rollLookup || !wagmiConnected || !canEncrypt}
              onClick={() => dice.fetchEncryptedRoll(BigInt(rollLookup))}
              className="rounded-xl border border-white/20 px-4 py-2 text-sm font-semibold text-white transition hover:border-purple-400 disabled:cursor-not-allowed disabled:border-white/10 disabled:text-white/40"
            >
              Fetch
            </button>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[3fr_2fr]">
        <div className="glass-surface p-6">
          <h2 className="text-xl font-semibold text-white">Decrypt latest roll</h2>
          <p className="mt-2 text-sm text-slate-300/80">
            Only addresses allowed by the contract can unlock the ciphertext. Use this action to reveal the dice value,
            the rolling sum, and whether a jackpot was hit.
          </p>
          <div className="mt-4">
            <button
              type="button"
              onClick={() => dice.decryptActiveRoll()}
              disabled={!dice.activeRoll || dice.isDecrypting}
              className="rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20 disabled:cursor-not-allowed disabled:bg-white/5 disabled:text-white/40"
            >
              {dice.isDecrypting ? "Decrypting..." : "Decrypt active roll"}
            </button>
            {dice.activeRoll ? (
              <p className="mt-3 text-xs text-slate-400">
                Roll #{dice.activeRoll.rollId.toString()} recorded on {formatTimestamp(dice.activeRoll.createdAt)}
              </p>
            ) : (
              <p className="mt-3 text-xs text-slate-400">Submit or load a roll to decrypt it.</p>
            )}
          </div>

          {dice.latestDecrypted ? (
            <div className="mt-6 rounded-2xl border border-white/10 bg-black/40 p-4">
              <p className="text-sm font-semibold text-white">
                Roll #{dice.latestDecrypted.rollId.toString()} — {dice.latestDecrypted.value}
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Player: {dice.latestDecrypted.player.slice(0, 6)}…{dice.latestDecrypted.player.slice(-4)} ·{" "}
                {formatTimestamp(dice.latestDecrypted.createdAt)}
              </p>
              <dl className="mt-4 grid grid-cols-2 gap-3 text-sm text-slate-200">
                <div>
                  <dt className="text-xs uppercase tracking-wide text-slate-400">Rolling sum</dt>
                  <dd className="text-lg font-semibold text-white">{dice.latestDecrypted.sum.toString()}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide text-slate-400">Jackpot hit</dt>
                  <dd className="text-lg font-semibold text-white">
                    {dice.latestDecrypted.hitJackpot ? "Yes 🎉" : "No"}
                  </dd>
                </div>
              </dl>
            </div>
          ) : null}
        </div>

        <div className="glass-surface space-y-4 p-6">
          <h2 className="text-xl font-semibold text-white">Decrypt rolling pot</h2>
          <p className="text-sm text-slate-300/80">
            The rolling pot tracks the encrypted sum. Decrypt it to understand how close the lottery is to another
            jackpot.
          </p>
          <button
            type="button"
            className="rounded-xl border border-white/20 px-4 py-2 text-sm font-semibold text-white transition hover:border-purple-400 disabled:cursor-not-allowed disabled:border-white/10 disabled:text-white/40"
            onClick={() => dice.decryptPot()}
            disabled={!dice.potHandle || dice.isDecryptingPot}
          >
            {dice.isDecryptingPot ? "Decrypting pot..." : "Decrypt rolling pot"}
          </button>

          {dice.potValue !== undefined ? (
            <div className="rounded-2xl border border-white/10 bg-black/40 p-4 text-sm text-slate-200">
              <p className="text-xs uppercase tracking-wide text-slate-400">Current pot</p>
              <p className="mt-1 text-2xl font-semibold text-white">{dice.potValue.toString()}</p>
              <p className="mt-2 text-xs text-slate-400">
                Pot is normalised whenever a jackpot ({">="} 18) is detected.
              </p>
            </div>
          ) : (
            <p className="text-xs text-slate-400">No pot to decrypt yet.</p>
          )}
        </div>
      </section>

      <section className="glass-surface p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">Recent decrypted rolls</h2>
          <span className="text-xs text-slate-400">Showing last {mounted ? dice.history.length : 0} entries</span>
        </div>
        {!mounted || dice.history.length === 0 ? (
          <p className="mt-4 text-sm text-slate-300/80">Decrypt a roll to populate the audit trail.</p>
        ) : (
          <div className="mt-4 grid gap-3">
            {dice.history.map((entry) => (
              <div
                key={entry.rollId.toString()}
                className="rounded-2xl border border-white/10 bg-black/30 p-4 text-sm text-slate-200"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="font-semibold text-white">
                    Roll #{entry.rollId.toString()} — {entry.value}
                  </p>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      entry.hitJackpot ? "bg-emerald-500/20 text-emerald-200" : "bg-white/10 text-white/70"
                    }`}
                  >
                    {entry.hitJackpot ? "Jackpot" : "No jackpot"}
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-400">
                  Player: {entry.player.slice(0, 6)}…{entry.player.slice(-4)} · {formatTimestamp(entry.createdAt)}
                </p>
                <p className="mt-2 text-xs text-slate-400">Sum after roll: {entry.sum.toString()}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      {mounted && activeStatus ? (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-200">{activeStatus}</div>
      ) : null}
    </div>
  );
}






