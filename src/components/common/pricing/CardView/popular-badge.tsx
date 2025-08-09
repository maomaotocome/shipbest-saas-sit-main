import { useTranslations } from "next-intl";

export default function PopularBadge() {
  const t = useTranslations("pricing");

  return (
    <div className="bg-primary absolute top-2 right-2 z-20 rounded-full px-4 py-1 text-center text-sm font-medium text-white shadow-md dark:bg-white/10">
      {t("popular")}
    </div>
  );
}
