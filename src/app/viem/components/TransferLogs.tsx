"use client";

import React, { useState, useEffect, useRef } from "react";
import { useViem } from "@/contexts/ViemContext";
import { erc20Abi } from "@/constants/erc20Abi";
import { formatUnits } from "viem";

interface TransferLog {
  from: string;
  to: string;
  value: string;
  blockNumber: bigint;
  transactionHash: string;
  timestamp: number;
}

interface TransferLogsProps {
  contractAddress?: `0x${string}`;
  tokenInfo?: {
    symbol: string;
    decimals: number;
  };
}

export const TransferLogs: React.FC<TransferLogsProps> = ({
  contractAddress,
  tokenInfo,
}) => {
  const { publicClient } = useViem();
  const [logs, setLogs] = useState<TransferLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  const fetchHistoricalLogs = async (address: `0x${string}`) => {
    try {
      setLoading(true);
      setError(null);

      // 获取最近的区块号
      const latestBlock = await publicClient.getBlockNumber();

      // 获取最近1000个区块的Transfer事件
      const fromBlock = latestBlock - 1000n;

      const transferLogs = await publicClient.getLogs({
        address,
        event: {
          type: "event",
          name: "Transfer",
          inputs: [
            { name: "from", type: "address", indexed: true },
            { name: "to", type: "address", indexed: true },
            { name: "value", type: "uint256", indexed: false },
          ],
        },
        fromBlock,
        toBlock: "latest",
      });

      // 转换日志格式
      const formattedLogs: TransferLog[] = transferLogs.map((log) => ({
        from: log.args.from as string,
        to: log.args.to as string,
        value: log.args.value as string,
        blockNumber: log.blockNumber,
        transactionHash: log.transactionHash,
        timestamp: Date.now(), // 这里可以进一步获取区块时间戳
      }));

      setLogs(formattedLogs.reverse()); // 最新的在前
    } catch (err) {
      setError(err instanceof Error ? err.message : "获取历史日志失败");
    } finally {
      setLoading(false);
    }
  };

  const startListening = async (address: `0x${string}`) => {
    try {
      setError(null);

      const unsubscribe = publicClient.watchContractEvent({
        address,
        abi: erc20Abi,
        eventName: "Transfer",
        onLogs: (logs) => {
          const newLogs: TransferLog[] = logs.map((log) => ({
            from: log.args.from as string,
            to: log.args.to as string,
            value: log.args.value as string,
            blockNumber: log.blockNumber,
            transactionHash: log.transactionHash,
            timestamp: Date.now(),
          }));

          setLogs((prev) => [newLogs[0], ...prev]); // 添加新日志到顶部
        },
      });

      unsubscribeRef.current = unsubscribe;
      setIsListening(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "开始监听失败");
    }
  };

  const stopListening = () => {
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
      setIsListening(false);
    }
  };

  const handleStartListening = () => {
    if (contractAddress) {
      startListening(contractAddress);
    }
  };

  const handleStopListening = () => {
    stopListening();
  };

  const handleFetchHistorical = () => {
    if (contractAddress) {
      fetchHistoricalLogs(contractAddress);
    }
  };

  // 清理监听器
  useEffect(() => {
    return () => {
      stopListening();
    };
  }, []);

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatValue = (value: string, decimals: number = 18) => {
    return parseFloat(formatUnits(BigInt(value), decimals)).toFixed(6);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold mb-4">Transfer事件监听</h2>

      {!contractAddress && (
        <div className="text-gray-500 text-center py-8">
          请先输入代币合约地址
        </div>
      )}

      {contractAddress && (
        <div className="space-y-4">
          {/* 控制按钮 */}
          <div className="flex gap-2">
            <button
              onClick={handleFetchHistorical}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "加载中..." : "获取历史记录"}
            </button>

            {!isListening ? (
              <button
                onClick={handleStartListening}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                开始监听
              </button>
            ) : (
              <button
                onClick={handleStopListening}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                停止监听
              </button>
            )}
          </div>

          {/* 状态显示 */}
          <div className="flex items-center gap-4 text-sm">
            <span
              className={`px-2 py-1 rounded-full ${
                isListening
                  ? "bg-green-100 text-green-800"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {isListening ? "正在监听" : "未监听"}
            </span>
            <span className="text-gray-600">
              合约地址: {formatAddress(contractAddress)}
            </span>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {/* 日志列表 */}
          <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-md">
            {logs.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                暂无Transfer事件记录
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {logs.map((log, index) => (
                  <div
                    key={`${log.transactionHash}-${index}`}
                    className="p-4 hover:bg-gray-50"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-900">
                          Transfer
                        </span>
                        <span className="text-xs text-gray-500">
                          Block #{log.blockNumber.toString()}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </span>
                    </div>

                    <div className="space-y-1 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-600">From:</span>
                        <span className="font-mono bg-gray-100 px-2 py-1 rounded">
                          {formatAddress(log.from)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-gray-600">To:</span>
                        <span className="font-mono bg-gray-100 px-2 py-1 rounded">
                          {formatAddress(log.to)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-gray-600">Value:</span>
                        <span className="font-medium text-blue-600">
                          {formatValue(log.value, tokenInfo?.decimals || 18)}{" "}
                          {tokenInfo?.symbol || "TOKEN"}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-gray-600">Tx:</span>
                        <span className="font-mono text-xs text-blue-600 hover:text-blue-800 cursor-pointer">
                          {formatAddress(log.transactionHash)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
