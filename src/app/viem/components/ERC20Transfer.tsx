"use client";

import React, { useState, useEffect } from "react";
import { useViem } from "@/contexts/ViemContext";
import { erc20Abi } from "@/constants/erc20Abi";
import { formatUnits, parseUnits, getContract, encodeFunctionData } from "viem";

interface ERC20TransferProps {
  fromAddress?: `0x${string}`;
  onTokenInfoUpdate?: (info: { symbol: string; decimals: number }) => void;
  onContractAddressChange?: (address: `0x${string}`) => void;
}

export const ERC20Transfer: React.FC<ERC20TransferProps> = ({
  fromAddress,
  onTokenInfoUpdate,
  onContractAddressChange,
}) => {
  const { publicClient, walletClient } = useViem();
  const [contractAddress, setContractAddress] = useState("");
  const [tokenInfo, setTokenInfo] = useState<{
    name: string;
    symbol: string;
    decimals: number;
    totalSupply: string;
    balance: string;
  } | null>(null);
  const [toAddress, setToAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchTokenInfo = async (address: `0x${string}`) => {
    try {
      setLoading(true);
      setError(null);

      const contract = getContract({
        address,
        abi: erc20Abi,
        client: publicClient,
      });

      // 并行获取代币信息
      const [name, symbol, decimals, totalSupply, balance] = await Promise.all([
        contract.read.name(),
        contract.read.symbol(),
        contract.read.decimals(),
        contract.read.totalSupply(),
        fromAddress ? contract.read.balanceOf([fromAddress]) : BigInt(0),
      ]);

      const tokenInfoData = {
        name: name as string,
        symbol: symbol as string,
        decimals: Number(decimals),
        totalSupply: formatUnits(totalSupply as bigint, Number(decimals)),
        balance: fromAddress
          ? formatUnits(balance as bigint, Number(decimals))
          : "0",
      };

      setTokenInfo(tokenInfoData);

      // 通知父组件代币信息更新
      if (onTokenInfoUpdate) {
        onTokenInfoUpdate({
          symbol: tokenInfoData.symbol,
          decimals: tokenInfoData.decimals,
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "获取代币信息失败");
    } finally {
      setLoading(false);
    }
  };

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !fromAddress ||
      !toAddress ||
      !amount ||
      !contractAddress ||
      !tokenInfo
    ) {
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
      if (!accounts[0]) {
        throw new Error("未找到钱包账户");
      }

      const contract = getContract({
        address: contractAddress as `0x${string}`,
        abi: erc20Abi,
        client: walletClient,
      });

      // 计算转账数量
      const transferAmount = parseUnits(amount, tokenInfo.decimals);

      // 编码transfer函数调用
      const transferData = encodeFunctionData({
        abi: erc20Abi,
        functionName: "transfer",
        args: [toAddress as `0x${string}`, transferAmount],
      });

      // 获取gas估算
      const gasEstimate = await publicClient.estimateGas({
        account: accounts[0],
        to: contractAddress as `0x${string}`,
        data: transferData,
      });

      console.log("transferData", transferData, gasEstimate);
      // 发送交易
      const hash = await walletClient.sendTransaction({
        account: accounts[0],
        to: contractAddress as `0x${string}`,
        data: transferData,
        gas: gasEstimate,
      });

      setTxHash(hash);

      // 等待交易确认
      const receipt = await publicClient.waitForTransactionReceipt({ hash });

      if (receipt.status === "success") {
        // 清空表单并刷新代币信息
        setToAddress("");
        setAmount("");
        fetchTokenInfo(contractAddress as `0x${string}`);
      } else {
        setError("交易失败");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "转账失败");
    } finally {
      setLoading(false);
    }
  };

  const handleFetchTokenInfo = () => {
    if (contractAddress) {
      const address = contractAddress as `0x${string}`;
      fetchTokenInfo(address);

      // 通知父组件合约地址变化
      if (onContractAddressChange) {
        onContractAddressChange(address);
      }
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold mb-4">ERC-20代币转账</h2>

      {!fromAddress && (
        <div className="text-gray-500 text-center py-8">请先连接钱包</div>
      )}

      {fromAddress && (
        <div className="space-y-6">
          {/* 代币合约地址输入 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              代币合约地址
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={contractAddress}
                onChange={(e) => setContractAddress(e.target.value)}
                placeholder="0x..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={handleFetchTokenInfo}
                disabled={!contractAddress || loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                查询
              </button>
            </div>
          </div>

          {/* 代币信息显示 */}
          {tokenInfo && (
            <div className="bg-gray-50 rounded-md p-4 space-y-2">
              <h3 className="font-medium text-gray-900">代币信息</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">名称:</span>
                  <span className="ml-2 font-medium">{tokenInfo.name}</span>
                </div>
                <div>
                  <span className="text-gray-600">符号:</span>
                  <span className="ml-2 font-medium">{tokenInfo.symbol}</span>
                </div>
                <div>
                  <span className="text-gray-600">精度:</span>
                  <span className="ml-2 font-medium">{tokenInfo.decimals}</span>
                </div>
                <div>
                  <span className="text-gray-600">总供应量:</span>
                  <span className="ml-2 font-medium">
                    {parseFloat(tokenInfo.totalSupply).toFixed(2)}
                  </span>
                </div>
                <div className="col-span-2">
                  <span className="text-gray-600">我的余额:</span>
                  <span className="ml-2 font-medium text-blue-600">
                    {parseFloat(tokenInfo.balance).toFixed(6)}{" "}
                    {tokenInfo.symbol}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* 转账表单 */}
          {tokenInfo && (
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
                  转账金额 ({tokenInfo.symbol})
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
      )}
    </div>
  );
};
