"use client";

import { useViem } from "@/contexts/ViemContext";

export default function DebugPage() {
  const { chainId, address, balance, isConnected } = useViem();

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">调试信息</h1>
      <div className="space-y-4">
        <div>
          <strong>连接状态:</strong> {isConnected ? "已连接" : "未连接"}
        </div>
        <div>
          <strong>链ID:</strong> {chainId || "未设置"}
        </div>
        <div>
          <strong>地址:</strong> {address || "未设置"}
        </div>
        <div>
          <strong>余额:</strong> {balance || "未设置"}
        </div>
        <div>
          <strong>网络名称:</strong>{" "}
          {chainId === 1
            ? "Ethereum Mainnet"
            : chainId === 11155111
            ? "Sepolia Testnet"
            : chainId === 8453
            ? "Base"
            : "未知网络"}
        </div>
      </div>
    </div>
  );
}
