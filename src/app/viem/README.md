# Web3 功能演示页面

这是一个基于 Viem 库实现的 Web3 功能演示页面，包含以下功能：

## 功能特性

### 1. 账户信息查询

- 查询连接钱包的 ETH 余额
- 显示账户的 Nonce 值
- 支持手动刷新账户信息

### 2. ETH 转账

- 实现账户之间的 ETH 转账
- 自动估算 Gas 费用
- 显示交易状态和哈希

### 3. ERC-20 代币操作

- 查询代币合约信息（名称、符号、精度、总供应量）
- 查看用户代币余额
- 实现代币转账功能

### 4. Transfer 事件监听

- 监听代币合约的 Transfer 事件
- 显示历史转账记录
- 实时监听新的转账事件

## 技术实现

- **框架**: Next.js 15 + React 19
- **Web3 库**: Viem 2.37.6
- **网络**: Sepolia 测试网
- **样式**: Tailwind CSS

## 使用方法

1. **连接钱包**

   - 点击"连接钱包"按钮
   - 确保 MetaMask 已安装并切换到 Sepolia 测试网

2. **查看账户信息**

   - 连接钱包后自动显示账户信息
   - 可以点击"刷新信息"按钮更新数据

3. **进行 ETH 转账**

   - 输入接收地址和转账金额
   - 点击"发送转账"按钮
   - 在 MetaMask 中确认交易

4. **查询代币信息**

   - 输入 ERC-20 代币合约地址
   - 点击"查询"按钮获取代币信息

5. **代币转账**

   - 查询代币信息后，输入接收地址和转账金额
   - 点击"发送转账"按钮

6. **监听 Transfer 事件**
   - 输入代币合约地址后，可以获取历史转账记录
   - 点击"开始监听"按钮实时监听新事件

## 配置说明

### Infura 配置

在 `src/contexts/ViemContext.tsx` 中，需要替换 Infura 密钥：

```typescript
transport: http("https://sepolia.infura.io/v3/YOUR_INFURA_KEY");
```

### 测试代币

可以使用以下 Sepolia 测试网上的代币合约地址进行测试：

- USDC: `0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238`
- DAI: `0xFF34B3d4Aee8ddCd6F9AFFFB6Fe49bD371b8a357`

## 注意事项

1. 确保钱包已连接到 Sepolia 测试网
2. 需要足够的测试 ETH 用于支付 Gas 费用
3. 代币转账需要先有代币余额
4. 事件监听功能需要有效的代币合约地址

## 项目结构

```
src/app/viem/
├── components/
│   ├── AccountInfo.tsx      # 账户信息组件
│   ├── NativeTransfer.tsx   # ETH转账组件
│   ├── ERC20Transfer.tsx    # 代币转账组件
│   ├── TransferLogs.tsx     # 事件监听组件
│   └── WalletConnect.tsx    # 钱包连接组件
├── page.tsx                 # 主页面
└── README.md               # 说明文档
```

## 开发说明

所有组件都通过 `ViemContext` 共享同一个 viem 客户端实例，避免了重复初始化的问题。组件之间通过 props 传递状态，实现了良好的解耦和复用性。
