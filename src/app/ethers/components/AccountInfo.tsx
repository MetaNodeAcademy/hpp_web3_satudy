"use client";

import { useEffect, useMemo, useState } from "react";
import { formatEther } from "ethers";
import { useEthers } from "@/contexts/EthersContext";

// AccountInfo 负责：
// - 连接/断开钱包
// - 展示地址、余额、网络
// - 演示如何从全局 Context 获取 provider 与账户信息
export default function AccountInfo() {
  const {
    provider,
    accountAddress,
    chainId,
    isConnecting,
    connectWallet,
    disconnectWallet,
  } = useEthers();
  const [balance, setBalance] = useState<string>("-");
  const [networkName, setNetworkName] = useState<string>("-");

  // 查询余额与网络信息
  useEffect(() => {
    let aborted = false;
    async function load() {
      if (!provider) return;
      try {
        const network = await provider.getNetwork();
        if (aborted) return;
        setNetworkName(network.name ?? `chain-${String(network.chainId)}`);
        if (accountAddress) {
          const bal = await provider.getBalance(accountAddress);
          if (!aborted) setBalance(formatEther(bal));
        } else {
          setBalance("-");
        }
      } catch (e) {
        if (!aborted) {
          setNetworkName("-");
          setBalance("-");
        }
      }
    }
    load();
    return () => {
      aborted = true;
    };
  }, [provider, accountAddress, chainId]);

  const statusText = useMemo(() => {
    if (isConnecting) return "连接中...";
    if (accountAddress) return "已连接";
    return "未连接";
  }, [accountAddress, isConnecting]);

  return (
    <div style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: 16 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 12,
        }}
      >
        <h3 style={{ fontWeight: 600 }}>账户信息</h3>
        {accountAddress ? (
          <button
            onClick={disconnectWallet}
            style={{
              padding: "6px 10px",
              border: "1px solid #ccc",
              borderRadius: 6,
            }}
          >
            断开
          </button>
        ) : (
          <button
            onClick={connectWallet}
            disabled={isConnecting}
            style={{
              padding: "6px 10px",
              border: "1px solid #ccc",
              borderRadius: 6,
            }}
          >
            {isConnecting ? "连接中..." : "连接钱包"}
          </button>
        )}
      </div>

      <div style={{ lineHeight: 1.8 }}>
        <div>状态：{statusText}</div>
        <div>地址：{accountAddress ?? "-"}</div>
        <div>
          网络：{networkName} {chainId ? `(ChainId: ${chainId})` : ""}
        </div>
        <div>余额：{balance === "-" ? "-" : `${balance} ETH`}</div>
      </div>
    </div>
  );
}
