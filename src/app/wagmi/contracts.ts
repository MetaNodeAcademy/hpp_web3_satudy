export const wagmiContractConfig = {
    address: '0x872ff292C270eeF2cA30D0D035A7B89568f8Cc5B',
    abi: [
      {
        type: 'function',
        name: 'balanceOf',
        stateMutability: 'view',
        inputs: [{ name: 'account', type: 'address' }],
        outputs: [{ type: 'uint256' }],
      },
      {
        type: 'function',
        name: 'totalSupply',
        stateMutability: 'view',
        inputs: [],
        outputs: [{ name: 'supply', type: 'uint256' }],
      },
      {
        type: 'function',
        name: 'name',
        stateMutability: 'view',
        inputs: [],
        outputs: [{ name: 'name', type: 'string' }],
      }
    ],
  } as const