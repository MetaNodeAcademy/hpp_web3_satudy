"use client";

import { useViem } from "@/contexts/ViemContext";
import { useState } from "react";
import { CurrencyDollarIcon } from "@heroicons/react/24/solid";
import { commonTokens } from "@/constants/erc20Abi";

export function ERC20Transfer() {
  const { sendERC20Transfer, isLoading } = useViem();
  const [tokenAddress, setTokenAddress] = useState("");
  const [toAddress, setToAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setTxHash(null);

    if (!tokenAddress || !toAddress || !amount) {
      setError("请填写所有字段");
      return;
    }

    if (parseFloat(amount) <= 0) {
      setError("转账金额必须大于0");
      return;
    }

    try {
      const hash = await sendERC20Transfer(
        tokenAddress as `0x${string}`,
        toAddress as `0x${string}`,
        amount
      );
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

  const handleTokenSelect = (tokenAddr: string) => {
    setTokenAddress(tokenAddr);
  };

  return (
    <div className="p-6 border border-gray-300 rounded-lg bg-white shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <CurrencyDollarIcon className="w-6 h-6 text-purple-500" />
        <h2 className="text-xl font-bold text-gray-800">ERC-20代币转账</h2>
      </div>

      <form onSubmit={handleTransfer} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            代币合约地址
          </label>
          <input
            type="text"
            value={tokenAddress}
            onChange={(e) => setTokenAddress(e.target.value)}
            placeholder="0x..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            disabled={isLoading}
          />
          <div className="mt-2">
            <p className="text-sm text-gray-600 mb-2">常用代币:</p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => handleTokenSelect(commonTokens.USDT)}
                className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
              >
                USDT
              </button>
              <button
                type="button"
                onClick={() => handleTokenSelect(commonTokens.USDC)}
                className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
              >
                USDC
              </button>
              <button
                type="button"
                onClick={() => handleTokenSelect(commonTokens.DAI)}
                className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
              >
                DAI
              </button>
              <button
                type="button"
                onClick={() => handleTokenSelect(commonTokens.WETH)}
                className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
              >
                WETH
              </button>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            接收地址
          </label>
          <input
            type="text"
            value={toAddress}
            onChange={(e) => setToAddress(e.target.value)}
            placeholder="0x..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            disabled={isLoading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            转账数量
          </label>
          <input
            type="number"
            step="0.0001"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="1.0"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            disabled={isLoading}
          />
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
          disabled={isLoading || !tokenAddress || !toAddress || !amount}
          className="w-full bg-purple-500 hover:bg-purple-600 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
        >
          {isLoading && (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          )}
          {isLoading ? "转账中..." : "发送代币转账"}
        </button>
      </form>
    </div>
  );
}
