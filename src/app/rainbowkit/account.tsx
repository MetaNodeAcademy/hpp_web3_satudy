import { useAccount, useDisconnect, useBalance } from "wagmi";
import { LinkIcon } from "@heroicons/react/24/solid";

export function Account() {
  const accountInfo = useAccount();
  const { disconnect } = useDisconnect();
  const { data: balance } = useBalance({ address: accountInfo.address });
  console.log("address", accountInfo, balance);
  return (
    <div className="flex flex-col justify-center items-start gap-5 border border-[#d8dadf] rounded-md p-4 bg-[#f5f5f5]">
      <div className="flex items-center gap-2">
        <LinkIcon className="size-6" />{" "}
        <h3 className="text-lg font-bold">账户信息:</h3>
      </div>
      <div className="flex flex-col justify-center items-start gap-1">
        <div className="text-[1rem] font-bold ">账户地址:</div>
        <div className="text-lg text-[#87888b]">{accountInfo.address}</div>
      </div>
      <div className="flex flex-col justify-center items-start gap-1">
        <div className="text-[1rem] font-bold ">账户余额:</div>
        <div className="text-lg text-[#87888b]">
          {balance?.formatted + " " + balance?.symbol}
        </div>
      </div>
      <div className="flex flex-col justify-center items-start gap-1">
        <div className="text-[1rem] font-bold ">链ID:</div>
        <div className="text-lg text-[#87888b]">{accountInfo.chainId}</div>
      </div>
      <div className="flex flex-col justify-center items-start gap-1">
        <div className="text-[1rem] font-bold ">链连接状态:</div>
        <div
          className={`text-lg text-[#87888b] ${
            accountInfo.isConnected ? "text-green-500" : "text-red-500"
          }`}
        >
          {accountInfo.isConnected ? "已连接" : "未连接"}
        </div>
      </div>
      <div className="flex flex-col justify-center items-start gap-1">
        <div className="text-[1rem] font-bold ">钱包类型:</div>
        <div className="text-lg text-[#87888b]">
          {accountInfo.connector?.name}
        </div>
      </div>
      <button
        className="bg-red-500 text-white p-2 rounded-md m-2"
        onClick={() => disconnect()}
      >
        Disconnect
      </button>
    </div>
  );
}
