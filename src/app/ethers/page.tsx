"use client";

import Nav from "@/components/nav";
import { EthersProvider } from "@/contexts/EthersContext";
import AccountInfo from "./components/AccountInfo";
import SendTransaction from "./components/SendTransaction";
import ERC20Tool from "./components/ERC20Tool";
import TransferListener from "./components/TransferListener";

export default function EthersPage() {
  return (
    <div>
      <div className="grid grid-cols-2 gap-4 px-20">
        <EthersProvider>
          <AccountInfo />
          <SendTransaction />
          <ERC20Tool />
          <TransferListener />
        </EthersProvider>
      </div>
    </div>
  );
}
