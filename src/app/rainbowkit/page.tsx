"use client";

import { WagmiProvider, useAccount } from "wagmi";
import { config } from "@/wagmi.config";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "@rainbow-me/rainbowkit/styles.css";
import { getDefaultConfig, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { mainnet, sepolia } from "wagmi/chains";

import { WalletOptions } from "./walletOptions";
import { Account } from "./account";
import { SendTransaction } from "./sendTransaction";
import { ReadTransaction } from "./readTransaction";
import { TransferLogs } from "./transferLogs";

const queryClient = new QueryClient();

const configRainbowKit = getDefaultConfig({
  appName: "My RainbowKit App",
  projectId: "36c03a1f8f4216039545acd42b809aea",
  chains: [mainnet, sepolia],
  ssr: true, // If your dApp uses server side rendering (SSR)
});

function ConnectWallet() {
  const { isConnected } = useAccount();
  if (isConnected) return <Account />;
  return <WalletOptions />;
}

export default function WagmiPage() {
  return (
    <WagmiProvider config={configRainbowKit}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <div className="grid grid-cols-2 gap-4 px-20">
            <ConnectWallet />
            <SendTransaction />
            <ReadTransaction />
            <TransferLogs />
          </div>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
