# Viem Web3 功能实现

这个页面展示了如何使用 Viem 库在 Next.js 中实现完整的 Web3 功能。

## 架构设计

### 局部 Context 设计

- **ViemContext** 只在 `/viem` 路由下生效
- 通过 `src/app/viem/layout.tsx` 提供 ViemProvider
- 不影响其他页面（如 wagmi、rainbowkit 页面）

### 文件结构

```
src/app/viem/
├── layout.tsx              # Viem 专用的 layout，提供 ViemProvider
├── page.tsx                # 主页面
├── components/             # 组件目录
│   ├── WalletConnect.tsx   # 钱包连接组件
│   ├── AccountInfo.tsx     # 账户信息展示
│   ├── NativeTransfer.tsx  # ETH 转账
│   ├── ERC20Transfer.tsx   # ERC-20 转账
│   └── TransferLogs.tsx    # 事件监听
└── README.md               # 说明文档
```

## 功能特性

### 1. 钱包连接

- 支持 MetaMask 钱包连接
- 自动检测钱包连接状态
- 支持账户切换和链切换

### 2. 账户信息展示

- 显示钱包地址（支持复制）
- 显示 ETH 余额
- 显示当前网络信息
- 支持切换不同网络（主网、测试网、Base）

### 3. 原生代币转账

- ETH 转账功能
- 实时余额检查
- 交易状态反馈
- 支持在 Etherscan 上查看交易

### 4. ERC-20 代币转账

- 支持任意 ERC-20 代币转账
- 预设常用代币地址（USDT、USDC、DAI、WETH）
- 完整的错误处理

### 5. Transfer 事件监听

- 实时监听 ERC-20 代币的 Transfer 事件
- 显示转账详情（发送方、接收方、数量）
- 支持开始/停止监听
- 事件日志展示

## 技术实现

### Context 模式

使用 React Context 来管理局部的 Web3 状态：

- `ViemContext`: 提供所有 Web3 相关的状态和方法
- `useViem`: 自定义 Hook，方便在组件中使用
- 只在 viem 路由下生效，不影响其他页面

### 组件结构

每个功能都封装成独立的组件，便于维护和复用：

- 清晰的职责分离
- 统一的错误处理
- 一致的 UI 设计风格

## 使用方法

1. **访问页面**

   - 直接访问 `/viem` 路由
   - ViemProvider 会自动包装页面内容

2. **连接钱包**

   - 点击"连接 MetaMask"按钮
   - 在 MetaMask 中确认连接

3. **使用功能**
   - 查看账户信息
   - 进行转账操作
   - 监听事件

## 学习要点

### 1. Next.js 路由级 Layout

```typescript
// src/app/viem/layout.tsx
export default function ViemLayout({ children }) {
  return <ViemProvider>{children}</ViemProvider>;
}
```

### 2. 局部状态管理

- Context 只在特定路由下生效
- 避免全局状态污染
- 更好的代码组织

### 3. Viem 核心概念

- 客户端创建和管理
- 钱包连接和状态同步
- 交易发送和事件监听

## 优势

1. **模块化设计**: 每个功能独立，便于维护
2. **局部作用域**: Context 只在需要的地方生效
3. **类型安全**: 完整的 TypeScript 支持
4. **错误处理**: 完善的错误处理和用户反馈
5. **响应式设计**: 适配不同屏幕尺寸

## 扩展建议

1. **添加更多代币支持**
2. **实现批量转账功能**
3. **添加交易历史记录**
4. **支持更多钱包类型**
5. **添加多签钱包支持**
