"use client";

import React, { useState } from "react";
import { useViem } from "@/contexts/ViemContext";
import { parseEther, formatEther } from "viem";

interface NativeTransferProps {
  fromAddress?: `0x${string}`;
}

export const NativeTransfer: React.FC<NativeTransferProps> = ({
  fromAddress,
}) => {
  const { publicClient, walletClient } = useViem();
  const [toAddress, setToAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fromAddress || !toAddress || !amount) {
      setError("请填写所有字段");
      return;
    }

    if (!walletClient) {
      setError("请先连接钱包");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setTxHash(null);

      // 获取账户信息
      const accounts = await walletClient.requestAddresses();
      console.log("accounts", accounts);
      if (!accounts[0]) {
        throw new Error("未找到钱包账户");
      }

      // 构建交易参数
      const value = parseEther(amount);

      // 获取gas估算
      const gasEstimate = await publicClient?.estimateGas({
        account: accounts[0],
        to: toAddress as `0x${string}`,
        value,
      });

      // 发送交易
      const hash = await walletClient.sendTransaction({
        account: accounts[0],
        to: toAddress as `0x${string}`,
        value,
        gas: gasEstimate,
      });

      setTxHash(hash);

      // 等待交易确认
      const receipt = await publicClient?.waitForTransactionReceipt({ hash });

      if (receipt?.status === "success") {
        // 清空表单
        setToAddress("");
        setAmount("");
      } else {
        setError("交易失败");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "转账失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold mb-4">ETH转账</h2>

      {!fromAddress && (
        <div className="text-gray-500 text-center py-8">请先连接钱包</div>
      )}

      {fromAddress && (
        <form onSubmit={handleTransfer} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              接收地址
            </label>
            <input
              type="text"
              value={toAddress}
              onChange={(e) => setToAddress(e.target.value)}
              placeholder="0x..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              转账金额 (ETH)
            </label>
            <input
              type="number"
              step="0.000001"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.0"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {txHash && (
            <div className="bg-green-50 border border-green-200 rounded-md p-4">
              <p className="text-green-600 mb-2">交易成功!</p>
              <p className="text-sm text-gray-600">
                交易哈希: <span className="font-mono">{txHash}</span>
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "处理中..." : "发送转账"}
          </button>
        </form>
      )}
    </div>
  );
};
