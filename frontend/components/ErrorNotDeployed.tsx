type ErrorNotDeployedProps = {
  chainId: number | undefined;
  contractName?: string;
};

const CHAIN_LABEL: Record<number, string> = {
  31337: "Hardhat (31337)",
  11155111: "Sepolia (11155111)",
};

export function ErrorNotDeployed({ chainId, contractName = "LuckyDice" }: ErrorNotDeployedProps) {
  const chainLabel = chainId ? CHAIN_LABEL[chainId] ?? `chainId=${chainId}` : "current network";

  return (
    <div className="mx-auto max-w-3xl rounded-3xl border border-red-500/30 bg-red-500/10 p-8 text-left shadow-lg shadow-red-900/20">
      <p className="text-2xl font-semibold text-red-200">
        {contractName}.sol is not deployed on {chainLabel}.
      </p>

      <p className="mt-4 text-base text-red-100/80">
        Please deploy the contract to continue. If you are developing locally, make sure you have a Hardhat FHE node
        running and run:
      </p>

      <pre className="mt-6 rounded-2xl bg-slate-950/60 p-4 text-sm text-red-100 shadow-inner shadow-black/30">
        npx hardhat node
        {"\n"}
        npx hardhat deploy --network localhost
      </pre>

      <p className="mt-6 text-base text-red-100/70">
        After deployment, update the address in <code className="rounded bg-white/10 px-2 py-1 font-mono text-sm">
          frontend/abi/LuckyDiceAddresses.ts
        </code>{" "}
        and refresh the page.
      </p>
    </div>
  );
}
