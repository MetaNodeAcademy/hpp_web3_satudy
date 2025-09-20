"use client";

import { useViem } from "@/contexts/ViemContext";
import { useState, useEffect } from "react";
import { EyeIcon, PlayIcon, StopIcon } from "@heroicons/react/24/solid";
import { formatEther } from "viem";

export function TransferLogs() {
  const { watchTransferEvents, transferEvents, isConnected } = useViem();
  const [tokenAddress, setTokenAddress] = useState("");
  const [isWatching, setIsWatching] = useState(false);
  const [unwatch, setUnwatch] = useState<(() => void) | null>(null);

  const startWatching = () => {
    if (!isConnected) {
      alert("请先连接钱包");
      return;
    }

    if (!tokenAddress) {
      alert("请输入代币合约地址");
      return;
    }

    try {
      const unwatchFn = watchTransferEvents(tokenAddress as `0x${string}`);
      if (unwatchFn) {
        setUnwatch(() => unwatchFn);
        setIsWatching(true);
      }
    } catch (error) {
      console.error("开始监听失败:", error);
      alert("开始监听失败");
    }
  };

  const stopWatching = () => {
    if (unwatch) {
      unwatch();
      setUnwatch(null);
      setIsWatching(false);
    }
  };

  const clearLogs = () => {
    // 这里我们需要在context中添加清除日志的方法
    // 暂时通过刷新页面来清除
    window.location.reload();
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const formatValue = (value: bigint, decimals: number = 18) => {
    try {
      return formatEther(value);
    } catch {
      return value.toString();
    }
  };

  useEffect(() => {
    return () => {
      if (unwatch) {
        unwatch();
      }
    };
  }, [unwatch]);

  return (
    <div className="p-6 border border-gray-300 rounded-lg bg-white shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <EyeIcon className="w-6 h-6 text-orange-500" />
        <h2 className="text-xl font-bold text-gray-800">Transfer事件监听</h2>
      </div>

      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            代币合约地址
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={tokenAddress}
              onChange={(e) => setTokenAddress(e.target.value)}
              placeholder="0x..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              disabled={isWatching}
            />
            <button
              onClick={isWatching ? stopWatching : startWatching}
              disabled={!isConnected}
              className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                isWatching
                  ? "bg-red-500 hover:bg-red-600 text-white"
                  : "bg-orange-500 hover:bg-orange-600 text-white"
              } disabled:bg-gray-400`}
            >
              {isWatching ? (
                <>
                  <StopIcon className="w-4 h-4" />
                  停止监听
                </>
              ) : (
                <>
                  <PlayIcon className="w-4 h-4" />
                  开始监听
                </>
              )}
            </button>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={clearLogs}
            className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
          >
            清除日志
          </button>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <div
              className={`w-2 h-2 rounded-full ${
                isWatching ? "bg-green-500" : "bg-gray-400"
              }`}
            ></div>
            {isWatching ? "正在监听" : "未监听"}
          </div>
        </div>
      </div>

      <div className="border border-gray-200 rounded-lg">
        <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
          <h3 className="font-medium text-gray-800">
            事件日志 ({transferEvents.length} 条)
          </h3>
        </div>

        <div className="max-h-96 overflow-y-auto">
          {transferEvents.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              {isWatching ? "等待Transfer事件..." : "请开始监听以查看事件"}
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {transferEvents.map((event, index) => (
                <div key={index} className="p-4 hover:bg-gray-50">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                    <div>
                      <span className="font-medium text-gray-600">From:</span>
                      <div className="font-mono text-xs break-all">
                        {formatAddress(event.args.from)}
                      </div>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">To:</span>
                      <div className="font-mono text-xs break-all">
                        {formatAddress(event.args.to)}
                      </div>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Value:</span>
                      <div className="font-mono text-xs">
                        {formatValue(event.args.value)}
                      </div>
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-gray-500">
                    区块: {event.blockNumber?.toString() || "N/A"} | 交易:{" "}
                    {event.transactionHash?.slice(0, 10)}...
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
