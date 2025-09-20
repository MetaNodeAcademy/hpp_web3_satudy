"use client";
import { useForm } from "react-hook-form";
import {
  useSendTransaction,
  useWaitForTransactionReceipt,
  type BaseError,
} from "wagmi";
import { parseEther } from "viem";
import { CurrencyDollarIcon } from "@heroicons/react/24/solid";

type FormValues = { address: string; value: string };
export function SendTransaction() {
  const {
    data: hash,
    isPending,
    sendTransaction,
    error,
  } = useSendTransaction();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>();

  const submit = async function ({ address, value }: FormValues) {
    const to = address as `0x${string}`;
    const amount = value as string;
    sendTransaction({ to, value: parseEther(amount) });
  };

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
    });

  return (
    <form
      className="flex flex-col justify-start items-start gap-5 border border-[#d8dadf] rounded-md p-4 bg-[#cbe2f3]"
      onSubmit={handleSubmit(submit)}
    >
      <div className="flex justify-start items-start gap-2">
        <CurrencyDollarIcon className="size-6" />
        <label className="text-lg font-bold">转账功能</label>
      </div>
      <div className="flex flex-col justify-center items-start gap-5 w-100">
        <label htmlFor="address">接收地址</label>
        <input
          {...register("address", { required: "地址是必填项" })}
          name="address"
          placeholder="0xA0Cf…251e"
          className="w-100"
        />
      </div>
      <div className="flex flex-col justify-center items-start gap-5 w-100">
        <label htmlFor="value">转账金额</label>
        <input
          {...register("value", { required: "金额是必填项" })}
          name="value"
          placeholder="0.05"
          className="w-100"
        />
      </div>
      <button
        className="bg-blue-500 text-white px-4 py-2 rounded-md w-100"
        disabled={isPending}
        type="submit"
      >
        {isPending ? "转账中" : "转账"}
      </button>
      {hash && <div>交易哈希: {hash}</div>}
      {isConfirming && <div>等待确认...</div>}
      {isConfirmed && <div>交易确认。</div>}
      {error && (
        <div>错误: {(error as BaseError).shortMessage || error.message}</div>
      )}
    </form>
  );
}
