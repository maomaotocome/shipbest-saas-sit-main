"use client";
import { usePathname } from "next/navigation";
import { use } from "react";

export default function Empty({ params }: { params: Promise<{ uri: string }> }) {
  const resolvedParams = use(params);
  const { uri } = resolvedParams;
  const path = usePathname();
  return (
    <div className="flex h-screen flex-col items-center justify-center">
      <h1 className="text-9xl font-bold">{uri}</h1>
      <p className="text-muted-foreground">{path}</p>
    </div>
  );
}
