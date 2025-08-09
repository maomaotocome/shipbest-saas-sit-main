"use client";
import data from "@/staticData/largemenus/models.json";
import { ChevronRight } from "lucide-react";
import { useLocale } from "next-intl";
import Link from "next/link";
import { LocaleData } from "./types";
import { defaultLocale } from "@/i18n/locales";

interface MobileModelMenuProps {
  expandedSubCategory?: string | null;
  onSubCategoryClick?: (label: string) => void;
  onClose?: () => void;
}

export const MobileModelMenu = ({
  expandedSubCategory,
  onSubCategoryClick,
  onClose,
}: MobileModelMenuProps) => {
  const locale = useLocale();
  const modelMenuItems = (data as LocaleData)[locale] || (data as LocaleData)[defaultLocale];
  return (
    <div className="ml-4 space-y-2">
      {modelMenuItems.map((category) => (
        <div key={category.label} className="space-y-2">
          <button
            onClick={() => onSubCategoryClick?.(category.label)}
            className="flex w-full items-center justify-between py-2 text-sm"
          >
            <span>{category.label}</span>
            <ChevronRight
              className={`h-4 w-4 transition-transform duration-200 ${
                expandedSubCategory === category.label ? "rotate-90" : ""
              }`}
            />
          </button>
          {expandedSubCategory === category.label && (
            <div className="ml-4 space-y-2">
              {category.items.map((item) => (
                <Link
                  key={item.href}
                  href={`/${locale}${item.href}`}
                  className="text-muted-foreground hover:text-primary block py-2 text-sm"
                  onClick={onClose}
                >
                  {item.title}
                  {item.description && (
                    <p className="text-muted-foreground mt-1 text-xs">{item.description}</p>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
