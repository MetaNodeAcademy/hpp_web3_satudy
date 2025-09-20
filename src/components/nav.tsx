"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Nav() {
  const pathname = usePathname();
  return (
    <div className="flex justify-end gap-4 mx-20 my-10 border border-[#d8dadf] rounded-md p-4">
      <Link
        href="/rainbowkit"
        className={pathname === "/rainbowkit" ? "text-blue-500" : ""}
      >
        Rainbowkit
      </Link>
      <Link
        href="/wagmi"
        className={pathname === "/wagmi" ? "text-blue-500" : ""}
      >
        Wagmi
      </Link>
      <Link
        href="/viem"
        className={pathname === "/viem" ? "text-blue-500" : ""}
      >
        Viem
      </Link>
      <Link
        href="/ethers"
        className={pathname === "/ethers" ? "text-blue-500" : ""}
      >
        Ethers
      </Link>
    </div>
  );
}
