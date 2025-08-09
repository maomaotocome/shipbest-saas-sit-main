"use client";
import data from "@/staticData/largemenus/models.json";
import { useLocale } from "next-intl";
import Link from "next/link";
import { LocaleData } from "./types";
import { defaultLocale } from "@/i18n/locales";

export const DesktopModelMenu = () => {
  const locale = useLocale();
  const modelMenuItems = (data as LocaleData)[locale] || (data as LocaleData)[defaultLocale];

  return (
    <>
      <div className="container mx-auto p-8">
        <div className="flex flex-col gap-8">
          {modelMenuItems.map((category) => (
            <div key={category.label} className="space-y-2">
              <div className="text-foreground text-lg font-semibold">{category.label}</div>
              <div className="flex flex-wrap gap-2 font-light">
                {category.items.map((item) => (
                  <Link
                    key={item.href}
                    href={`/${locale}${item.href}`}
                    title={item.description || item.title}
                    className="group block"
                  >
                    <div className="hover:bg-accent rounded-lg px-3 py-1.5 whitespace-nowrap transition-colors">
                      <span className="group-hover:text-primary text-gray-600 dark:text-gray-300">
                        {item.title}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};
