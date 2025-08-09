"use client";

import type { LucideProps } from "lucide-react";
import * as Icons from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

interface MenuItem {
  icon: string | React.ComponentType<{ className?: string }>;
  label: string;
  href: string;
  children?: MenuItem[];
}

interface DashboardMenuItemProps {
  item: MenuItem;
}

export default function DashboardMenuItem({ item }: DashboardMenuItemProps) {
  const params = useParams();
  // Assume locale always exists as a string in route parameters
  const locale = params.locale as string;

  // Handle both string and component types for icon
  const Icon =
    typeof item.icon === "string"
      ? (Icons as unknown as Record<string, React.ComponentType<LucideProps>>)[item.icon]
      : item.icon;

  return (
    <Link
      // Add locale prefix to original href
      href={`/${locale}${item.href}`}
      className="bg-card flex flex-col items-center justify-center rounded-lg p-4 shadow-sm transition-shadow hover:shadow-md dark:hover:shadow-white/20"
    >
      <div className="mb-2 flex h-10 w-10 items-center justify-center">
        {Icon && <Icon className="h-6 w-6" />}
      </div>
      <span className="text-sm font-medium">{item.label}</span>
    </Link>
  );
}
