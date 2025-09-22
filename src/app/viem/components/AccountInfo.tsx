"use client";

import React, { useState, useEffect } from "react";
import { useViem } from "@/contexts/ViemContext";
import { formatEther, formatUnits } from "viem";

interface AccountInfoProps {
  address?: `0x${string}`;
}

export const AccountInfo: React.FC<AccountInfoProps> = ({ address }) => {
  const { publicClient } = useViem();
  const [accountInfo, setAccountInfo] = useState<{
    balance: string;
    nonce: number;
    address: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAccountInfo = async (accountAddress: `0x${string}`) => {
    try {
      setLoading(true);
      setError(null);

      // 获取ETH余额
      const balance = await publicClient.getBalance({
        address: accountAddress,
      });

      // 获取nonce
      const nonce = await publicClient.getTransactionCount({
        address: accountAddress,
      });

      setAccountInfo({
        balance: formatEther(balance),
        nonce,
        address: accountAddress,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "获取账户信息失败");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (address) {
      fetchAccountInfo(address);
    }
  }, [address]);

  const handleRefresh = () => {
    if (address) {
      fetchAccountInfo(address);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold mb-4">账户信息</h2>

      {!address && (
        <div className="text-gray-500 text-center py-8">请先连接钱包</div>
      )}

      {address && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="font-medium">地址:</span>
            <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
              {address}
            </span>
          </div>

          {loading && (
            <div className="text-center py-4">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600">加载中...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {accountInfo && !loading && (
            <>
              <div className="flex justify-between items-center">
                <span className="font-medium">ETH余额:</span>
                <span className="text-lg font-bold text-blue-600">
                  {accountInfo.balance} ETH
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="font-medium">Nonce:</span>
                <span className="text-lg font-bold">{accountInfo.nonce}</span>
              </div>

              <button
                onClick={handleRefresh}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
              >
                刷新信息
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};
