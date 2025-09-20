"use client";

import { ViemProvider } from "@/contexts/ViemContext";

export default function ViemLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ViemProvider>{children}</ViemProvider>;
}
