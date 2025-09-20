"use client";

import { useViem } from "@/contexts/ViemContext";
import { useState } from "react";
import { ArrowRightIcon } from "@heroicons/react/24/solid";

export function NativeTransfer() {
  const { sendNativeTransfer, isLoading, balance } = useViem();
  const [toAddress, setToAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setTxHash(null);

    if (!toAddress || !amount) {
      setError("请填写所有字段");
      return;
    }

    if (parseFloat(amount) <= 0) {
      setError("转账金额必须大于0");
      return;
    }

    if (balance && parseFloat(amount) > parseFloat(balance)) {
      setError("余额不足");
      return;
    }

    try {
      const hash = await sendNativeTransfer(toAddress as `0x${string}`, amount);
      if (hash) {
        setTxHash(hash);
        setToAddress("");
        setAmount("");
      } else {
        setError("转账失败");
      }
    } catch (err) {
      setError("转账失败: " + (err as Error).message);
    }
  };

  return (
    <div className="p-6 border border-gray-300 rounded-lg bg-white shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <ArrowRightIcon className="w-6 h-6 text-green-500" />
        <h2 className="text-xl font-bold text-gray-800">ETH转账</h2>
      </div>

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
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isLoading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            转账金额 (ETH)
          </label>
          <div className="relative">
            <input
              type="number"
              step="0.0001"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.001"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isLoading}
            />
            <div className="absolute right-3 top-2 text-sm text-gray-500">
              ETH
            </div>
          </div>
          {balance && (
            <p className="text-sm text-gray-500 mt-1">
              可用余额: {parseFloat(balance).toFixed(4)} ETH
            </p>
          )}
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {txHash && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-600 mb-2">转账成功！</p>
            <p className="text-xs text-green-500 break-all">
              交易哈希: {txHash}
            </p>
            <a
              href={`https://etherscan.io/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-500 hover:underline"
            >
              在Etherscan上查看
            </a>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading || !toAddress || !amount}
          className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
        >
          {isLoading && (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          )}
          {isLoading ? "转账中..." : "发送转账"}
        </button>
      </form>
    </div>
  );
}
