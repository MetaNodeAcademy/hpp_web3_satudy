"use client";

import { FormEvent, useMemo, useState } from "react";
import { Contract, formatUnits, parseUnits } from "ethers";
import { useEthers } from "@/contexts/EthersContext";
import { erc20Abi } from "@/constants/erc20Abi";

// ERC20Tool 负责：
// - 查询 ERC20 的基本信息（name/symbol/decimals）与余额
// - 发起 ERC20 transfer，并在成功后更新余额
// - 演示合约实例通过 provider 与 signer 的切换
export default function ERC20Tool() {
  const { provider, ensureSigner, accountAddress } = useEthers();

  const [tokenAddress, setTokenAddress] = useState<string>("");
  const [decimals, setDecimals] = useState<number>(18);
  const [symbol, setSymbol] = useState<string>("-");
  const [name, setName] = useState<string>("-");
  const [balance, setBalance] = useState<string>("-");
  const [amount, setAmount] = useState<string>("");
  const [to, setTo] = useState<string>("");
  const [txHash, setTxHash] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const contract = useMemo(() => {
    if (!provider || !tokenAddress) return null;
    return new Contract(tokenAddress, erc20Abi, provider);
  }, [provider, tokenAddress]);

  async function queryToken() {
    if (!contract || !accountAddress) return;
    setError("");
    setTxHash("");
    setLoading(true);
    try {
      const [d, s, n, b] = await Promise.all([
        contract.decimals(),
        contract.symbol(),
        contract.name(),
        contract.balanceOf(accountAddress),
      ]);
      setDecimals(Number(d));
      setSymbol(String(s));
      setName(String(n));
      setBalance(formatUnits(b, Number(d)));
    } catch (e: any) {
      setError(e?.message ?? String(e));
    } finally {
      setLoading(false);
    }
  }

  async function onTransfer(e: FormEvent) {
    e.preventDefault();
    if (!contract) return;
    setError("");
    setTxHash("");
    try {
      if (!amount || !to) throw new Error("请填写收款地址与转账数量");
      const signer = await ensureSigner();
      const withSigner = contract.connect(signer);
      const tx = await withSigner.transfer(to, parseUnits(amount, decimals));
      const receipt = await tx.wait();
      setTxHash(receipt?.hash ?? tx.hash);
      // 更新余额
      if (accountAddress) {
        const b = await contract.balanceOf(accountAddress);
        setBalance(formatUnits(b, decimals));
      }
    } catch (e: any) {
      setError(e?.message ?? String(e));
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 style={{ fontWeight: 600, marginBottom: 12 }}>ERC20 查询与转账</h3>
      <div style={{ display: "grid", gap: 8, marginBottom: 12 }}>
        <input
          placeholder="代币合约地址 0x..."
          value={tokenAddress}
          onChange={(e) => setTokenAddress(e.target.value)}
          style={{ border: "1px solid #d1d5db", borderRadius: 6, padding: 8 }}
        />
        <button
          onClick={queryToken}
          disabled={!contract || !accountAddress || loading}
          style={{
            padding: "8px 12px",
            border: "1px solid #ccc",
            borderRadius: 6,
          }}
        >
          {loading ? "查询中..." : "查询代币信息"}
        </button>
      </div>

      <div style={{ lineHeight: 1.8, marginBottom: 12 }}>
        <div>名称：{name}</div>
        <div>符号：{symbol}</div>
        <div>精度：{decimals}</div>
        <div>余额：{balance === "-" ? "-" : `${balance} ${symbol}`}</div>
      </div>

      <form onSubmit={onTransfer} style={{ display: "grid", gap: 8 }}>
        <input
          placeholder="收款地址 0x..."
          value={to}
          onChange={(e) => setTo(e.target.value)}
          style={{ border: "1px solid #d1d5db", borderRadius: 6, padding: 8 }}
        />
        <input
          placeholder="转账数量"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          style={{ border: "1px solid #d1d5db", borderRadius: 6, padding: 8 }}
        />
        <button
          type="submit"
          style={{
            padding: "8px 12px",
            border: "1px solid #ccc",
            borderRadius: 6,
          }}
        >
          转账
        </button>
      </form>

      {txHash && <div style={{ marginTop: 8 }}>交易哈希：{txHash}</div>}
      {error && (
        <div style={{ marginTop: 8, color: "#dc2626" }}>错误：{error}</div>
      )}
    </div>
  );
}
