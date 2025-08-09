"use client";

import DashboardMenuItem from "@/components/common/dashboard-menu-item";
import { useTranslations } from "next-intl";

interface MenuItem {
  icon: string | React.ComponentType<{ className?: string }>;
  label: string;
  href: string;
  children?: MenuItem[];
}

interface MenuGroup {
  label?: string;
  items: MenuItem[];
}

interface UserDashboardProps {
  menuGroups: MenuGroup[];
}

export default function UserDashboard({ menuGroups }: UserDashboardProps) {
  const t = useTranslations("user.dashboard");

  return (
    <div className="p-8">
      <h1 className="mb-8 text-3xl font-bold">{t("title")}</h1>

      {/* Render each group as a section */}
      {menuGroups.map((group, groupIndex) => (
        <div key={groupIndex} className="mb-10">
          <h2 className="mb-4 text-xl font-semibold">{group.label || t("general")}</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {group.items.map((item, itemIndex) => (
              <DashboardMenuItem key={itemIndex} item={item} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
