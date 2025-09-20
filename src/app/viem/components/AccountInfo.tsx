"use client";

import { useViem } from "@/contexts/ViemContext";
import { LinkIcon, WalletIcon } from "@heroicons/react/24/solid";

export function AccountInfo() {
  const {
    isConnected,
    address,
    chainId,
    balance,
    disconnectWallet,
    switchChain,
  } = useViem();

  if (!isConnected || !address) {
    return null;
  }

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const getChainName = (chainId: number) => {
    switch (chainId) {
      case 1:
        return "Ethereum Mainnet";
      case 11155111:
        return "Sepolia Testnet";
      case 8453:
        return "Base";
      default:
        return `Chain ${chainId}`;
    }
  };

  const handleSwitchChain = async (targetChainId: number) => {
    try {
      await switchChain(targetChainId);
    } catch (error) {
      console.error("切换链失败:", error);
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6 border border-gray-300 rounded-lg bg-white shadow-sm">
      <div className="flex items-center gap-3">
        <WalletIcon className="w-6 h-6 text-blue-500" />
        <h2 className="text-xl font-bold text-gray-800">账户信息</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-600">钱包地址</label>
          <div className="flex items-center gap-2">
            <code className="bg-gray-100 px-3 py-2 rounded text-sm font-mono">
              {formatAddress(address)}
            </code>
            <button
              onClick={() => navigator.clipboard.writeText(address)}
              className="p-1 hover:bg-gray-100 rounded"
              title="复制地址"
            >
              <LinkIcon className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-600">余额</label>
          <div className="text-lg font-semibold text-gray-800">
            {balance ? `${parseFloat(balance).toFixed(4)} ETH` : "加载中..."}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-600">当前网络</label>
          <div className="text-sm text-gray-800">
            {chainId ? getChainName(chainId) : "未知"}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-600">连接状态</label>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm text-green-600 font-medium">已连接</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold text-gray-800">切换网络</h3>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleSwitchChain(1)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              chainId === 1
                ? "bg-blue-500 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            以太坊主网
          </button>
          <button
            onClick={() => handleSwitchChain(11155111)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              chainId === 11155111
                ? "bg-blue-500 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Sepolia测试网
          </button>
          <button
            onClick={() => handleSwitchChain(8453)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              chainId === 8453
                ? "bg-blue-500 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Base
          </button>
        </div>
      </div>

      <button
        onClick={disconnectWallet}
        className="w-full bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
      >
        断开连接
      </button>
    </div>
  );
}
