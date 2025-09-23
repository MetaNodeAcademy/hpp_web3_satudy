"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { BrowserProvider, Eip1193Provider, JsonRpcSigner } from "ethers";

type EthersContextValue = {
  provider: BrowserProvider | null;
  signer: JsonRpcSigner | null;
  accountAddress: string | null;
  chainId: number | null;
  isConnecting: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => Promise<void>;
  ensureSigner: () => Promise<JsonRpcSigner>;
};

const EthersContext = createContext<EthersContextValue | null>(null);

function getInjectedProvider(): Eip1193Provider | null {
  if (typeof window === "undefined") return null;
  // 仅当浏览器存在注入的以太坊对象时才返回
  return (window as any).ethereum ?? null;
}

// EthersProvider 负责：
// 1) 基于浏览器注入的 provider（如 MetaMask）创建 BrowserProvider
// 2) 提供全局的 provider/signer/account/chainId 状态
// 3) 暴露 connectWallet/ensureSigner 等方法给子组件复用
export function EthersProvider({ children }: { children: React.ReactNode }) {
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const [signer, setSigner] = useState<JsonRpcSigner | null>(null);
  const [accountAddress, setAccountAddress] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  // 初始化 BrowserProvider（仅在第一次加载或注入的 provider 变化时执行）
  useEffect(() => {
    const injected = getInjectedProvider();
    if (!injected) return;
    const browserProvider = new BrowserProvider(injected);
    setProvider(browserProvider);
  }, []);

  // 订阅账户和网络变化事件，保持全局状态同步
  useEffect(() => {
    const injected = getInjectedProvider();
    if (!injected) return;

    const handleAccountsChanged = (accounts: string[]) => {
      setAccountAddress(accounts && accounts.length > 0 ? accounts[0] : null);
      // 如果没有账户，则清空 signer
      if (!accounts || accounts.length === 0) setSigner(null);
    };

    const handleChainChanged = async () => {
      // 链变化后，需要刷新 provider 派生的信息
      if (!provider) return;
      try {
        const network = await provider.getNetwork();
        setChainId(Number(network.chainId));
      } catch (e) {
        console.error(e);
      }
    };

    (injected as any).on?.("accountsChanged", handleAccountsChanged);
    (injected as any).on?.("chainChanged", handleChainChanged);

    return () => {
      (injected as any).removeListener?.(
        "accountsChanged",
        handleAccountsChanged
      );
      (injected as any).removeListener?.("chainChanged", handleChainChanged);
    };
  }, [provider]);

  const connectWallet = useCallback(async () => {
    const injected = getInjectedProvider();
    if (!injected)
      throw new Error("未检测到注入的钱包。请安装 MetaMask 或启用钱包。");
    if (!provider) throw new Error("Provider 尚未就绪，请稍后重试。");
    try {
      setIsConnecting(true);
      // 请求账户权限
      const accounts: string[] = await injected.request?.({
        method: "eth_requestAccounts",
      });
      const selected = accounts && accounts.length > 0 ? accounts[0] : null;
      setAccountAddress(selected);
      // 派生 signer 与 chainId
      const nextSigner = await provider.getSigner();
      setSigner(nextSigner);
      const network = await provider.getNetwork();
      setChainId(Number(network.chainId));
    } finally {
      setIsConnecting(false);
    }
  }, [provider]);

  const disconnectWallet = useCallback(async () => {
    // 浏览器注入钱包通常不支持真正 "断开"，这里清空本地状态，模拟断开效果
    setSigner(null);
    setAccountAddress(null);
    // 保留 provider，方便后续再次连接
  }, []);

  const ensureSigner = useCallback(async () => {
    if (signer) return signer;
    if (!provider) throw new Error("Provider 未就绪");
    const nextSigner = await provider.getSigner();
    setSigner(nextSigner);
    return nextSigner;
  }, [provider, signer]);

  const value: EthersContextValue = useMemo(
    () => ({
      provider,
      signer,
      accountAddress,
      chainId,
      isConnecting,
      connectWallet,
      disconnectWallet,
      ensureSigner,
    }),
    [
      provider,
      signer,
      accountAddress,
      chainId,
      isConnecting,
      connectWallet,
      disconnectWallet,
      ensureSigner,
    ]
  );

  return (
    <EthersContext.Provider value={value}>{children}</EthersContext.Provider>
  );
}

export function useEthers() {
  const ctx = useContext(EthersContext);
  if (!ctx) throw new Error("useEthers 必须在 EthersProvider 内使用");
  return ctx;
}
