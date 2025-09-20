"use client";

import { useViem } from "@/contexts/ViemContext";
import { useState } from "react";

export function WalletConnect() {
  const { isConnected, connectWallet, isLoading } = useViem();
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      await connectWallet();
    } catch (error) {
      console.error("连接失败:", error);
    } finally {
      setIsConnecting(false);
    }
  };

  if (isConnected) {
    return null; // 如果已连接，不显示连接按钮
  }

  return (
    <div className="flex flex-col items-center justify-center p-8 border border-gray-300 rounded-lg bg-gray-50">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">连接钱包</h2>
      <p className="text-gray-600 mb-6 text-center">
        请连接您的MetaMask钱包以开始使用Web3功能
      </p>
      <button
        onClick={handleConnect}
        disabled={isLoading || isConnecting}
        className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center gap-2"
      >
        {(isLoading || isConnecting) && (
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        )}
        {isLoading || isConnecting ? "连接中..." : "连接MetaMask"}
      </button>
      <p className="text-sm text-gray-500 mt-4 text-center">
        如果您没有安装MetaMask，请先安装MetaMask扩展
      </p>
    </div>
  );
}
