"use client";
import { ModelMenu } from "@/components/large-menus/models/ModelMenu";
import { ProductMenu } from "@/components/large-menus/products/ProductMenu";
import { useLocale, useTranslations } from "next-intl";

export type LargeMenu = React.ComponentType<{
  isMobile?: boolean;
  expandedCategory?: string | null;
  expandedSubCategory?: string | null;
  onSubCategoryClick?: (label: string) => void;
  onClose?: () => void;
}>;

export interface NavItem {
  href: string;
  label: string;
  type: "link" | "large-menu";
  largeMenu?: LargeMenu;
  menuKey?: string;
}
export const useNavItems = () => {
  const locale = useLocale();
  const t = useTranslations("header.nav");
  return [
    { href: `/${locale}`, label: t("home"), type: "link" },
    { href: `/${locale}/pricing`, label: t("pricing"), type: "link" },
    { href: `/${locale}/explore`, label: t("explore"), type: "link" },
    {
      href: `#`,
      label: t("products"),
      type: "large-menu",
      largeMenu: ProductMenu,
      menuKey: "products",
    },
    {
      href: `#`,
      label: t("models"),
      type: "large-menu",
      largeMenu: ModelMenu,
      menuKey: "models",
    },
  ] as NavItem[];
};
