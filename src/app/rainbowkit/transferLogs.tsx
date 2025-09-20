import { usePublicClient, useWatchContractEvent } from "wagmi";
import { useState, useEffect } from "react";
import { PencilSquareIcon as LogsIcon } from "@heroicons/react/24/solid";

export function TransferLogs() {
  const [logsList, setLogsList] = useState<any[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentBlockNumber, setCurrentBlockNumber] = useState<bigint | null>(
    null
  );

  const publicClient = usePublicClient();

  // 监听Transfer事件
  useWatchContractEvent({
    address: "0x872ff292C270eeF2cA30D0D035A7B89568f8Cc5B",
    abi: [
      {
        name: "Transfer",
        type: "event",
        inputs: [
          { indexed: true, name: "from", type: "address" },
          { indexed: true, name: "to", type: "address" },
          { indexed: false, name: "value", type: "uint256" },
        ],
      },
    ],
    eventName: "Transfer",
    onLogs(logs) {
      console.log("监听到Transfer事件:", logs);
      // 为每个事件添加时间戳
      const logsWithTimestamp = logs.map((log) => ({
        ...log,
        timestamp: new Date().toLocaleString("zh-CN", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        }),
        blockTimestamp: null, // 稍后获取区块时间戳
      }));

      setLogsList((prev) => [...logsWithTimestamp, ...prev]);
    },
    onError(error) {
      console.error("监听Transfer事件失败:", error);
      setError("监听失败: " + error.message);
    },
  });

  // 获取当前区块号
  useEffect(() => {
    const getCurrentBlock = async () => {
      if (!publicClient) return;
      try {
        const currentBlock = await publicClient.getBlockNumber();
        setCurrentBlockNumber(currentBlock);
        setIsListening(true);
      } catch (err) {
        console.error("获取当前区块号失败:", err);
        setError("获取当前区块号失败: " + (err as Error).message);
      }
    };

    getCurrentBlock();
  }, [publicClient]);

  // 解析地址格式
  const formatAddress = (topic: string) => {
    return `0x${topic.slice(26)}`;
  };

  return (
    <div className="flex flex-col justify-start items-start gap-5 border border-[#d8dadf] rounded-md p-4 bg-[#f5f5f5]">
      <div className="flex items-center gap-2">
        <LogsIcon className="size-6" />
        <h3 className="text-lg font-bold">transfer事件监听:</h3>
        <div
          className={`px-2 py-1 rounded text-xs ${
            isListening
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {isListening ? "监听中" : "未监听"}
        </div>
      </div>

      {/* 显示当前区块号 */}
      {currentBlockNumber && (
        <div className="text-sm text-gray-600 mb-2">
          当前区块: {currentBlockNumber.toString()}
        </div>
      )}

      {error && <div className="text-red-500 mb-4">{error}</div>}

      {/* 显示监听结果数量 */}
      {logsList.length > 0 && (
        <div className="text-sm text-green-600 mb-2">
          已捕获 {logsList.length} 条Transfer事件
        </div>
      )}

      {logsList.map((log, index) => (
        <div
          key={`${log.transactionHash}-${log.logIndex}`}
          className="p-3 border rounded mb-2 bg-white"
        >
          {/* 时间信息 */}
          <div className="flex justify-between items-center mb-3 pb-2 border-b border-gray-200">
            <div className="text-sm font-bold text-blue-600">
              捕获时间: {log.timestamp}
            </div>
            <div className="text-xs text-gray-500">
              区块: {log.blockNumber.toString()}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col justify-center items-start gap-1">
              <div className="text-[0.9rem] font-bold text-gray-700">From:</div>
              <div className="text-sm text-[#87888b] font-mono break-all">
                {formatAddress(log.topics[1])}
              </div>
            </div>
            <div className="flex flex-col justify-center items-start gap-1">
              <div className="text-[0.9rem] font-bold text-gray-700">To:</div>
              <div className="text-sm text-[#87888b] font-mono break-all">
                {formatAddress(log.topics[2])}
              </div>
            </div>
            <div className="flex flex-col justify-center items-start gap-1">
              <div className="text-[0.9rem] font-bold text-gray-700">
                Value:
              </div>
              <div className="text-sm text-[#87888b] font-mono">
                {BigInt(log.data).toString()}
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* 如果没有找到数据 */}
      {logsList.length === 0 && !error && (
        <div className="text-gray-500 text-center py-4">
          {isListening
            ? "正在监听Transfer事件..."
            : "等待连接以开始监听Transfer事件"}
        </div>
      )}
    </div>
  );
}
