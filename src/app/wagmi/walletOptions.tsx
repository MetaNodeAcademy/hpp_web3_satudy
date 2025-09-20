import * as React from "react";
import { Connector, useConnect } from "wagmi";

export function WalletOptions() {
  const { connectors, connect } = useConnect();
  console.log("connectors", connectors);
  return (
    <div className="flex flex-col justify-center items-start gap-5 border border-[#d8dadf] rounded-md p-4 bg-[#cbe2f3]">
      {connectors.map((connector) => (
        <button
          className="bg-blue-500 text-white p-2 rounded-md m-2"
          key={connector.uid}
          onClick={() => connect({ connector })}
        >
          {connector.name}
        </button>
      ))}
    </div>
  );
}
