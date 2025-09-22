"use client";

import React, { useState, useEffect } from "react";
import { useViem } from "@/contexts/ViemContext";

interface WalletConnectProps {
  onConnect: (address: `0x${string}`) => void;
  onDisconnect: () => void;
  connectedAddress?: `0x${string}`;
}

export const WalletConnect: React.FC<WalletConnectProps> = ({
  onConnect,
  onDisconnect,
  connectedAddress,
}) => {
  const { walletClient } = useViem();
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const connectWallet = async () => {
    if (!window.ethereum) {
      setError("请安装MetaMask或其他Web3钱包");
      return;
    }

    if (!walletClient) {
      setError("钱包客户端未初始化");
      return;
    }

    try {
      setIsConnecting(true);
      setError(null);

      // 使用 viem 的钱包客户端请求地址
      const accounts = await walletClient.requestAddresses();

      if (accounts && accounts.length > 0) {
        onConnect(accounts[0]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "连接钱包失败");
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    onDisconnect();
  };

  // 检查是否已经连接
  useEffect(() => {
    const checkConnection = async () => {
      if (window.ethereum && walletClient) {
        try {
          const accounts = await walletClient.requestAddresses();
          if (accounts && accounts.length > 0) {
            onConnect(accounts[0]);
          }
        } catch (err) {
          console.error("检查钱包连接失败:", err);
        }
      }
    };

    checkConnection();
  }, [onConnect, walletClient]);

  // 监听账户变化
  useEffect(() => {
    if (window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          onDisconnect();
        } else {
          onConnect(accounts[0] as `0x${string}`);
        }
      };

      window.ethereum.on("accountsChanged", handleAccountsChanged);

      return () => {
        window.ethereum?.removeListener(
          "accountsChanged",
          handleAccountsChanged
        );
      };
    }
  }, [onConnect, onDisconnect]);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold mb-4">钱包连接</h2>

      {!connectedAddress ? (
        <div className="text-center">
          <p className="text-gray-600 mb-4">连接您的Web3钱包以开始使用</p>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          <button
            onClick={connectWallet}
            disabled={isConnecting}
            className="bg-blue-600 text-white py-2 px-6 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isConnecting ? "连接中..." : "连接钱包"}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-md p-4">
            <p className="text-green-600 font-medium mb-2">钱包已连接</p>
            <p className="text-sm text-gray-600 font-mono">
              {connectedAddress}
            </p>
          </div>

          <button
            onClick={disconnectWallet}
            className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors"
          >
            断开连接
          </button>
        </div>
      )}
    </div>
  );
};
