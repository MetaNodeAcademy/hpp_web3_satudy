"use client";

import React, { useState } from "react";
import { ViemProvider } from "../../contexts/ViemContext";
import { WalletConnect } from "./components/WalletConnect";
import { AccountInfo } from "./components/AccountInfo";
import { NativeTransfer } from "./components/NativeTransfer";
import { ERC20Transfer } from "./components/ERC20Transfer";
import { TransferLogs } from "./components/TransferLogs";

export default function ViemPage() {
  const [connectedAddress, setConnectedAddress] = useState<
    `0x${string}` | undefined
  >();
  const [contractAddress, setContractAddress] = useState<
    `0x${string}` | undefined
  >();
  const [tokenInfo, setTokenInfo] = useState<
    | {
        symbol: string;
        decimals: number;
      }
    | undefined
  >();

  const handleConnect = (address: `0x${string}`) => {
    setConnectedAddress(address);
  };

  const handleDisconnect = () => {
    setConnectedAddress(undefined);
    setContractAddress(undefined);
    setTokenInfo(undefined);
  };

  const handleTokenInfoUpdate = (info: {
    symbol: string;
    decimals: number;
  }) => {
    setTokenInfo(info);
  };

  return (
    <ViemProvider>
      <div className="min-h-screen bg-gray-100 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Web3 功能演示
            </h1>
            <p className="text-gray-600">基于 Viem 库实现的区块链交互功能</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 钱包连接 */}
            <WalletConnect
              onConnect={handleConnect}
              onDisconnect={handleDisconnect}
              connectedAddress={connectedAddress}
            />

            {/* 账户信息 */}
            <AccountInfo address={connectedAddress} />

            {/* ETH转账 */}
            <NativeTransfer fromAddress={connectedAddress} />

            {/* ERC-20代币转账 */}
            <ERC20Transfer
              fromAddress={connectedAddress}
              onTokenInfoUpdate={handleTokenInfoUpdate}
              onContractAddressChange={setContractAddress}
            />

            {/* Transfer事件监听 */}
            <TransferLogs
              contractAddress={contractAddress}
              tokenInfo={tokenInfo}
            />
          </div>
        </div>
      </div>
    </ViemProvider>
  );
}
