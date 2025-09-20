"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import {
  createPublicClient,
  createWalletClient,
  custom,
  http,
  formatEther,
  parseEther,
  Address,
} from "viem";
import { mainnet, sepolia, base } from "viem/chains";
import { erc20Abi } from "../constants/erc20Abi";

// 定义Context的类型
interface ViemContextType {
  // 连接状态
  isConnected: boolean;
  address: Address | undefined;
  chainId: number | undefined;

  // 账户信息
  balance: string | undefined;
  isLoading: boolean;

  // 方法
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  switchChain: (chainId: number) => Promise<void>;

  // 转账方法
  sendNativeTransfer: (to: Address, amount: string) => Promise<string | null>;
  sendERC20Transfer: (
    tokenAddress: Address,
    to: Address,
    amount: string
  ) => Promise<string | null>;

  // 监听事件
  watchTransferEvents: (tokenAddress?: Address) => void;
  transferEvents: any[];

  // 客户端实例
  publicClient: any;
  walletClient: any;
}

// 创建Context
const ViemContext = createContext<ViemContextType | undefined>(undefined);

// 支持的链
const supportedChains = {
  1: mainnet,
  11155111: sepolia,
  8453: base,
};

// Provider组件
export function ViemProvider({ children }: { children: ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState<Address | undefined>();
  const [chainId, setChainId] = useState<number | undefined>();
  const [balance, setBalance] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [transferEvents, setTransferEvents] = useState<any[]>([]);

  // 根据当前链ID获取对应的链配置
  const getChainConfig = (chainId: number) => {
    switch (chainId) {
      case 1:
        return mainnet;
      case 11155111:
        return sepolia;
      case 8453:
        return base;
      default:
        return mainnet; // 默认使用主网
    }
  };

  // 创建客户端的函数
  const createClients = (targetChainId?: number) => {
    const chain = targetChainId ? getChainConfig(targetChainId) : mainnet;

    const publicClient = createPublicClient({
      chain: chain,
      transport: http(),
    });

    let walletClient: any;
    if (typeof window !== "undefined" && window.ethereum) {
      walletClient = createWalletClient({
        chain: chain,
        transport: custom(window.ethereum),
      });
    }

    return { publicClient, walletClient };
  };

  // 初始客户端实例
  const { publicClient, walletClient } = createClients(chainId);

  // 检查钱包连接状态
  const checkConnection = async () => {
    if (typeof window !== "undefined" && window.ethereum) {
      try {
        const accounts = await window.ethereum.request({
          method: "eth_accounts",
        });
        if (accounts.length > 0) {
          setAddress(accounts[0] as Address);
          setIsConnected(true);

          // 获取链ID
          const chainId = await window.ethereum.request({
            method: "eth_chainId",
          });
          const currentChainId = parseInt(chainId, 16);
          setChainId(currentChainId);

          // 使用正确的链ID获取余额
          await updateBalance(accounts[0] as Address, currentChainId);
        }
        console.log("checkConnection", accounts, chainId);
      } catch (error) {
        console.error("检查连接状态失败:", error);
      }
    }
  };

  // 更新余额
  const updateBalance = async (
    accountAddress: Address,
    targetChainId?: number
  ) => {
    try {
      // 使用指定链ID或当前链ID获取余额
      const currentChainId = targetChainId || chainId;
      if (!currentChainId) {
        console.warn("链ID未设置，无法获取余额");
        return;
      }

      console.log("更新余额 - 链ID:", currentChainId, "地址:", accountAddress);
      const { publicClient } = createClients(currentChainId);
      const balance = await publicClient.getBalance({
        address: accountAddress,
      });
      const formattedBalance = formatEther(balance);
      console.log("获取到余额:", formattedBalance, "ETH");
      setBalance(formattedBalance);
    } catch (error) {
      console.error("获取余额失败:", error);
    }
  };

  // 连接钱包
  const connectWallet = async () => {
    if (typeof window !== "undefined" && window.ethereum) {
      try {
        setIsLoading(true);
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });

        if (accounts.length > 0) {
          setAddress(accounts[0] as Address);
          setIsConnected(true);

          // 获取链ID
          const chainId = await window.ethereum.request({
            method: "eth_chainId",
          });
          const currentChainId = parseInt(chainId, 16);
          setChainId(currentChainId);

          // 使用正确的链ID获取余额
          await updateBalance(accounts[0] as Address, currentChainId);
        }
        console.log("walletClient", accounts, chainId);
      } catch (error) {
        console.error("连接钱包失败:", error);
      } finally {
        setIsLoading(false);
      }
    } else {
      alert("请安装MetaMask钱包");
    }
  };

  // 断开钱包
  const disconnectWallet = () => {
    setAddress(undefined);
    setIsConnected(false);
    setChainId(undefined);
    setBalance(undefined);
    setTransferEvents([]);
  };

  // 切换链
  const switchChain = async (targetChainId: number) => {
    if (typeof window !== "undefined" && window.ethereum) {
      try {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: `0x${targetChainId.toString(16)}` }],
        });
        setChainId(targetChainId);

        // 切换链后立即更新余额
        if (address) {
          await updateBalance(address, targetChainId);
        }
      } catch (error) {
        console.error("切换链失败:", error);
      }
    }
  };

  // 发送原生代币转账
  const sendNativeTransfer = async (
    to: Address,
    amount: string
  ): Promise<string | null> => {
    if (!address || !chainId) return null;

    try {
      setIsLoading(true);

      // 使用当前链的客户端
      const { publicClient, walletClient } = createClients(chainId);

      const hash = await walletClient.sendTransaction({
        to,
        value: parseEther(amount),
        account: address,
      });

      // 等待交易确认
      const receipt = await publicClient.waitForTransactionReceipt({ hash });

      // 更新余额
      await updateBalance(address, chainId);

      return hash;
    } catch (error) {
      console.error("转账失败:", error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // 发送ERC-20代币转账
  const sendERC20Transfer = async (
    tokenAddress: Address,
    to: Address,
    amount: string
  ): Promise<string | null> => {
    if (!address || !chainId) return null;

    try {
      setIsLoading(true);

      // 使用当前链的客户端
      const { publicClient, walletClient } = createClients(chainId);

      const hash = await walletClient.writeContract({
        address: tokenAddress,
        abi: erc20Abi,
        functionName: "transfer",
        args: [to, parseEther(amount)],
        account: address,
      });

      // 等待交易确认
      const receipt = await publicClient.waitForTransactionReceipt({ hash });

      return hash;
    } catch (error) {
      console.error("ERC-20转账失败:", error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // 监听Transfer事件
  const watchTransferEvents = (tokenAddress?: Address) => {
    if (!tokenAddress || !chainId) return;

    try {
      // 使用当前链的客户端
      const { publicClient } = createClients(chainId);

      const unwatch = publicClient.watchContractEvent({
        address: tokenAddress,
        abi: erc20Abi,
        eventName: "Transfer",
        onLogs: (logs) => {
          setTransferEvents((prev) => [...prev, ...logs]);
        },
      });

      return unwatch;
    } catch (error) {
      console.error("监听事件失败:", error);
    }
  };

  // 监听链ID变化，重新创建客户端
  useEffect(() => {
    if (chainId && address) {
      updateBalance(address, chainId);
    }
  }, [chainId, address]);

  // 监听账户变化
  useEffect(() => {
    checkConnection();

    if (typeof window !== "undefined" && window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnectWallet();
        } else {
          setAddress(accounts[0] as Address);
          if (chainId) {
            updateBalance(accounts[0] as Address, chainId);
          }
        }
      };

      const handleChainChanged = (chainId: string) => {
        const newChainId = parseInt(chainId, 16);
        setChainId(newChainId);
        if (address) {
          updateBalance(address, newChainId);
        }
      };

      window.ethereum.on("accountsChanged", handleAccountsChanged);
      window.ethereum.on("chainChanged", handleChainChanged);

      return () => {
        window.ethereum.removeListener(
          "accountsChanged",
          handleAccountsChanged
        );
        window.ethereum.removeListener("chainChanged", handleChainChanged);
      };
    }
  }, [address]);

  const value: ViemContextType = {
    isConnected,
    address,
    chainId,
    balance,
    isLoading,
    connectWallet,
    disconnectWallet,
    switchChain,
    sendNativeTransfer,
    sendERC20Transfer,
    watchTransferEvents,
    transferEvents,
    publicClient,
    walletClient,
  };

  return <ViemContext.Provider value={value}>{children}</ViemContext.Provider>;
}

// 自定义Hook
export function useViem() {
  const context = useContext(ViemContext);
  if (context === undefined) {
    throw new Error("useViem must be used within a ViemProvider");
  }
  return context;
}

// 扩展Window接口以支持ethereum
declare global {
  interface Window {
    ethereum?: any;
  }
}
