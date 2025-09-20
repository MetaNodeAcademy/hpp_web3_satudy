"use client";

import { WagmiProvider, useAccount } from "wagmi";
import { config } from "@/wagmi.config";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { WalletOptions } from "./walletOptions";
import { Account } from "./account";
import { SendTransaction } from "./sendTransaction";
import { ReadTransaction } from "./readTransaction";
import { MintToken } from "./mintToken";
import { TransferLogs } from "./transferLogs";

const queryClient = new QueryClient();

function ConnectWallet() {
  const { isConnected } = useAccount();
  if (isConnected) return <Account />;
  return <WalletOptions />;
}

export default function WagmiPage() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <div className="grid grid-cols-2 gap-4 px-20">
          <ConnectWallet />
          <SendTransaction />
          <ReadTransaction />
          {/* <MintToken /> */}
          <TransferLogs />
        </div>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
