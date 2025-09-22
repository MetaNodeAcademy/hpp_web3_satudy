"use client";

import React, { useState } from "react";
import { useViem } from "../../contexts/ViemContext";

export default function DebugPage() {
  const { publicClient, walletClient } = useViem();
  const [testResult, setTestResult] = useState<string>("");

  const testConnection = async () => {
    try {
      setTestResult("测试中...");

      // 测试公共客户端
      const blockNumber = await publicClient?.getBlockNumber();
      setTestResult(`公共客户端连接成功，当前区块号: ${blockNumber}`);

      // 测试钱包客户端
      if (walletClient) {
        const accounts = await walletClient.requestAddresses();
        setTestResult(
          (prev) => prev + `\n钱包客户端连接成功，账户数量: ${accounts.length}`
        );
      } else {
        setTestResult((prev) => prev + "\n钱包客户端未初始化");
      }
    } catch (error) {
      setTestResult(
        `测试失败: ${error instanceof Error ? error.message : "未知错误"}`
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-2xl font-bold mb-4">调试页面</h1>

        <div className="bg-white rounded-lg shadow-md p-6 mb-4">
          <h2 className="text-lg font-semibold mb-4">连接测试</h2>
          <button
            onClick={testConnection}
            className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
          >
            测试连接
          </button>

          {testResult && (
            <div className="mt-4 p-4 bg-gray-100 rounded-md">
              <pre className="whitespace-pre-wrap">{testResult}</pre>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">客户端状态</h2>
          <div className="space-y-2">
            <p>公共客户端: {publicClient ? "✅ 已初始化" : "❌ 未初始化"}</p>
            <p>钱包客户端: {walletClient ? "✅ 已初始化" : "❌ 未初始化"}</p>
            <p>
              window.ethereum:{" "}
              {typeof window !== "undefined" && window.ethereum
                ? "✅ 可用"
                : "❌ 不可用"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
