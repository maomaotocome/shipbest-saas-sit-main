import { usePathname } from "@/i18n/routing";
import { useLocale } from "next-intl";
import { LocaleSwitcherContent } from "./LocaleSwitcherContent";

export const LocaleSwitcher = () => {
  const pathname = usePathname();
  const locale = useLocale();

  return <LocaleSwitcherContent currentLang={locale} pathname={pathname || "/"} />;
};
