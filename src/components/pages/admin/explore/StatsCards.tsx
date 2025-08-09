"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslations } from "next-intl";

interface Stats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  hidden: number;
  visible: number;
  featured: number;
}

interface StatsCardsProps {
  stats: Stats;
}

export function StatsCards({ stats }: StatsCardsProps) {
  const t = useTranslations("admin.explore.stats");

  const statItems = [
    { key: "total", value: stats.total, className: "text-blue-600" },
    { key: "pending", value: stats.pending, className: "text-yellow-600" },
    { key: "approved", value: stats.approved, className: "text-green-600" },
    { key: "rejected", value: stats.rejected, className: "text-red-600" },
    { key: "hidden", value: stats.hidden, className: "text-gray-600" },
    { key: "visible", value: stats.visible, className: "text-emerald-600" },
    { key: "featured", value: stats.featured, className: "text-purple-600" },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-7">
      {statItems.map((item) => (
        <Card key={item.key}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t(item.key as string)}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${item.className}`}>
              {item.value.toLocaleString()}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}