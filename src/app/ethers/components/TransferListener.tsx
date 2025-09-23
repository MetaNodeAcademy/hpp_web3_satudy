"use client";

import { useEffect, useMemo, useState } from "react";
import { Contract, formatUnits, Log, toBeHex } from "ethers";
import { useEthers } from "@/contexts/EthersContext";
import { erc20Abi } from "@/constants/erc20Abi";

type TransferItem = {
  txHash: string;
  from: string;
  to: string;
  value: string;
  blockNumber?: number;
};

// TransferListener 负责：
// - 订阅指定 ERC20 的 Transfer 事件
// - 将新事件展示在列表中，并限制显示数量
// - 展示如何在组件卸载时正确移除监听器
export default function TransferListener() {
  const { provider, accountAddress } = useEthers();
  const [tokenAddress, setTokenAddress] = useState<string>("");
  const [decimals, setDecimals] = useState<number>(18);
  const [symbol, setSymbol] = useState<string>("");
  const [list, setList] = useState<TransferItem[]>([]);
  const [listening, setListening] = useState(false);
  const [error, setError] = useState<string>("");

  const contract = useMemo(() => {
    if (!provider || !tokenAddress) return null;
    return new Contract(tokenAddress, erc20Abi, provider);
  }, [provider, tokenAddress]);

  useEffect(() => {
    if (!contract) return;
    let removed = false;

    async function prepare() {
      try {
        setError("");
        setList([]);
        const d = await contract.decimals();
        const s = await contract.symbol();
        if (!removed) {
          setDecimals(Number(d));
          setSymbol(String(s));
        }
      } catch (e: any) {
        setError(e?.message ?? String(e));
      }
    }
    prepare();

    function onTransfer(from: string, to: string, value: bigint, log: Log) {
      setList((prev) =>
        [
          {
            txHash: log.transactionHash ?? "",
            from,
            to,
            value: formatUnits(value, decimals),
            blockNumber: log.blockNumber,
          },
          ...prev,
        ].slice(0, 50)
      );
    }

    contract.on("Transfer", onTransfer);
    setListening(true);

    return () => {
      removed = true;
      contract.removeAllListeners?.("Transfer");
      setListening(false);
    };
  }, [contract, decimals]);

  return (
    <div className="bg-[#cbe2f3] rounded-lg shadow-md p-6">
      <h3 style={{ fontWeight: 600, marginBottom: 12 }}>
        ERC20 Transfer 事件监听
      </h3>
      <div style={{ display: "grid", gap: 8, marginBottom: 12 }}>
        <input
          placeholder="代币合约地址 0x..."
          value={tokenAddress}
          onChange={(e) => setTokenAddress(e.target.value)}
          style={{ border: "1px solid #d1d5db", borderRadius: 6, padding: 8 }}
        />
        <div>
          状态：{contract ? (listening ? "监听中" : "-") : "未就绪"}{" "}
          {symbol ? `(${symbol})` : ""}
        </div>
        {accountAddress && <div>当前账户：{accountAddress}</div>}
        {error && <div style={{ color: "#dc2626" }}>错误：{error}</div>}
      </div>

      <div
        style={{
          maxHeight: 280,
          overflow: "auto",
          border: "1px solid #f3f4f6",
          borderRadius: 6,
          padding: 8,
        }}
      >
        {list.length === 0 ? (
          <div style={{ color: "#6b7280" }}>暂无事件</div>
        ) : (
          <ul style={{ display: "grid", gap: 8 }}>
            {list.map((item, idx) => (
              <li
                key={item.txHash + idx}
                style={{ borderBottom: "1px solid #f3f4f6", paddingBottom: 8 }}
              >
                <div>Tx: {item.txHash}</div>
                <div>From: {item.from}</div>
                <div>To: {item.to}</div>
                <div>
                  Value: {item.value} {symbol}
                </div>
                {item.blockNumber ? <div>Block: {item.blockNumber}</div> : null}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
