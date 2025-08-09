import DashboardMenuItem from "@/components/common/dashboard-menu-item";
import { getMenuItems } from "@/staticData/studio-menu";
import { getTranslations } from "next-intl/server";

export default async function StudioHomePage() {
  const menuGroups = await getMenuItems();
  const t = await getTranslations("studio.home");

  // We don't want to show the "Home" link on the home page itself.
  const filteredMenuGroups = menuGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => item.href !== "/studio"),
    }))
    .filter((group) => group.items.length > 0);

  return (
    <div className="container mx-auto p-6">
      <h1 className="mb-2 text-3xl font-bold">{t("title")}</h1>
      <p className="mb-8 text-lg text-gray-600 dark:text-gray-400">{t("description")}</p>

      {/* Render each group as a section */}
      {filteredMenuGroups.map((group, groupIndex) => (
        <div key={groupIndex} className="mb-10">
          {group.label && <h2 className="mb-4 text-xl font-semibold">{group.label}</h2>}
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
