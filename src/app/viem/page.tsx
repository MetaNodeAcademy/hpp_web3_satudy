"use client";

import { useViem } from "@/contexts/ViemContext";
import { WalletConnect } from "./components/WalletConnect";
import { AccountInfo } from "./components/AccountInfo";
import { NativeTransfer } from "./components/NativeTransfer";
import { ERC20Transfer } from "./components/ERC20Transfer";
import { TransferLogs } from "./components/TransferLogs";

export default function ViemPage() {
  const { isConnected } = useViem();

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Web3 学习 - Viem 实现
          </h1>
          <p className="text-lg text-gray-600">
            使用 Viem 和 Next.js 实现钱包连接、转账和事件监听功能
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 钱包连接和账户信息 */}
          <div className="space-y-6">
            {!isConnected ? <WalletConnect /> : <AccountInfo />}
          </div>

          {/* 转账功能 */}
          <div className="space-y-6">
            <NativeTransfer />
            <ERC20Transfer />
          </div>

          {/* 事件监听 - 全宽 */}
          <div className="lg:col-span-2">
            <TransferLogs />
          </div>
        </div>
      </div>
    </div>
  );
}
