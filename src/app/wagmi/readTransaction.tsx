import { type BaseError, useReadContracts, useAccount } from "wagmi";
import { wagmiContractConfig } from "./contracts";
import { DocumentCurrencyDollarIcon as DCDIcon } from "@heroicons/react/24/solid";

export function ReadTransaction() {
  const accountInfo = useAccount();
  const { data, error, isPending } = useReadContracts({
    contracts: [
      {
        ...wagmiContractConfig,
        functionName: "balanceOf",
        args: [accountInfo.address as `0x${string}`],
      },
      {
        ...wagmiContractConfig,
        functionName: "totalSupply",
      },
      {
        ...wagmiContractConfig,
        functionName: "name",
      },
    ],
  });
  const [balance, totalSupply, name] = data || [];

  console.log("data", data);
  if (isPending) return <div>Loading...</div>;

  if (error)
    return (
      <div>Error: {(error as BaseError).shortMessage || error.message}</div>
    );

  return (
    <div className="flex flex-col justify-center items-start gap-5 border border-[#d8dadf] rounded-md p-4 bg-[#f5f5f5]">
      <div className="flex items-center gap-2">
        <DCDIcon className="size-6" />
        <h3 className="text-lg font-bold">代币信息:</h3>
      </div>
      <div className="flex flex-col justify-center items-start gap-1">
        <div className="text-[1rem] font-bold ">代币名称:</div>
        <div className="text-lg text-[#87888b]">{name?.result}</div>
      </div>
      <div className="flex flex-col justify-center items-start gap-1">
        <div className="text-[1rem] font-bold ">代币余额:</div>
        <div className="text-lg text-[#87888b]">{balance?.result}</div>
      </div>
      <div className="flex flex-col justify-center items-start gap-1">
        <div className="text-[1rem] font-bold ">代币总供应量:</div>
        <div className="text-lg text-[#87888b]">{totalSupply?.result}</div>
      </div>
    </div>
  );
}
