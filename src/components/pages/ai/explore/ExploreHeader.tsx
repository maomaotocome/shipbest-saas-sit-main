import { useTranslations } from "next-intl";

export function ExploreHeader() {
  const t = useTranslations("explore");

  return (
    <div className="mb-8 text-center">
      <h1 className="mb-4 text-4xl font-bold">{t("title")}</h1>
      <p className="text-muted-foreground text-lg">{t("subtitle")}</p>
    </div>
  );
}