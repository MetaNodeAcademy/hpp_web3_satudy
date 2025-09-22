"use client";

import React, { createContext, useContext, ReactNode } from "react";
import { createPublicClient, createWalletClient, custom, http } from "viem";
import { sepolia } from "viem/chains";

// 创建公共客户端实例（用于读取数据）
const publicClient = createPublicClient({
  chain: sepolia,
  transport: http("https://eth-sepolia.g.alchemy.com/v2/-JqvFazL69l7h4wzvujTx"),
});

// 创建钱包客户端实例（用于发送交易）
const createWalletClientInstance = () => {
  if (typeof window !== "undefined" && window.ethereum) {
    return createWalletClient({
      chain: sepolia,
      transport: custom(window.ethereum), // 使用 custom transport 连接钱包
    });
  }
  return null;
};

// 扩展Window接口以包含ethereum
declare global {
  interface Window {
    ethereum?: any;
  }
}

interface ViemContextType {
  publicClient: typeof publicClient;
  walletClient: ReturnType<typeof createWalletClientInstance>;
  createWalletClient: typeof createWalletClientInstance;
}

const ViemContext = createContext<ViemContextType | undefined>(undefined);

export const ViemProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const walletClient = createWalletClientInstance();

  return (
    <ViemContext.Provider
      value={{
        publicClient,
        walletClient,
        createWalletClient: createWalletClientInstance,
      }}
    >
      {children}
    </ViemContext.Provider>
  );
};

export const useViem = () => {
  const context = useContext(ViemContext);
  if (context === undefined) {
    throw new Error("useViem must be used within a ViemProvider");
  }
  return context;
};
