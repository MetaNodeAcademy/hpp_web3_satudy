"use client";

import { FormEvent, useState } from "react";
import { parseEther } from "ethers";
import { useEthers } from "@/contexts/EthersContext";

// SendTransaction 负责：
// - 通过 signer 发送原生币交易
// - 演示确保 signer 的复用（由 ensureSigner 提供）
export default function SendTransaction() {
  const { ensureSigner, accountAddress } = useEthers();
  const [to, setTo] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [txHash, setTxHash] = useState<string>("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string>("");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setTxHash("");
    try {
      if (!accountAddress) throw new Error("请先连接钱包");
      if (!to || !amount) throw new Error("请填写收款地址和金额");
      setSending(true);
      const signer = await ensureSigner();
      const tx = await signer.sendTransaction({
        to,
        value: parseEther(amount),
      });
      const receipt = await tx.wait();
      setTxHash(receipt?.hash ?? tx.hash);
    } catch (e: any) {
      setError(e?.message ?? String(e));
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="bg-[#cbe2f3] rounded-lg shadow-md p-6">
      <h3 style={{ fontWeight: 600, marginBottom: 12 }}>发送交易（原生币）</h3>
      <form onSubmit={onSubmit} style={{ display: "grid", gap: 8 }}>
        <input
          placeholder="收款地址 0x..."
          value={to}
          onChange={(e) => setTo(e.target.value)}
          style={{ border: "1px solid #d1d5db", borderRadius: 6, padding: 8 }}
        />
        <input
          placeholder="金额，例如 0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          style={{ border: "1px solid #d1d5db", borderRadius: 6, padding: 8 }}
        />
        <button
          type="submit"
          disabled={sending}
          style={{
            padding: "8px 12px",
            border: "1px solid #ccc",
            borderRadius: 6,
          }}
        >
          {sending ? "发送中..." : "发送"}
        </button>
      </form>
      {txHash && <div style={{ marginTop: 8 }}>交易哈希：{txHash}</div>}
      {error && (
        <div style={{ marginTop: 8, color: "#dc2626" }}>错误：{error}</div>
      )}
    </div>
  );
}
