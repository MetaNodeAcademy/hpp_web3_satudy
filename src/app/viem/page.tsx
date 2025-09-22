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
            <div className="lg:col-span-2">
              <WalletConnect
                onConnect={handleConnect}
                onDisconnect={handleDisconnect}
                connectedAddress={connectedAddress}
              />
            </div>

            {/* 账户信息 */}
            <AccountInfo address={connectedAddress} />

            {/* ETH转账 */}
            <NativeTransfer fromAddress={connectedAddress} />

            {/* ERC-20代币转账 */}
            <div className="lg:col-span-2">
              <ERC20Transfer
                fromAddress={connectedAddress}
                onTokenInfoUpdate={handleTokenInfoUpdate}
                onContractAddressChange={setContractAddress}
              />
            </div>

            {/* Transfer事件监听 */}
            <div className="lg:col-span-2">
              <TransferLogs
                contractAddress={contractAddress}
                tokenInfo={tokenInfo}
              />
            </div>
          </div>

          {/* 使用说明 */}
          <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">
              使用说明
            </h3>
            <div className="space-y-2 text-sm text-blue-800">
              <p>1. 首先点击"连接钱包"按钮连接您的MetaMask钱包</p>
              <p>2. 连接后可以查看账户信息，包括ETH余额和Nonce</p>
              <p>3. 可以进行ETH转账，输入接收地址和金额即可</p>
              <p>4. 输入ERC-20代币合约地址查询代币信息，并进行代币转账</p>
              <p>5. 可以监听代币合约的Transfer事件，查看实时转账记录</p>
              <p className="mt-4 text-blue-600">
                <strong>注意：</strong>
                请确保您的钱包已切换到Sepolia测试网络，并拥有足够的测试ETH用于支付gas费用。
              </p>
            </div>
          </div>
        </div>
      </div>
    </ViemProvider>
  );
}
