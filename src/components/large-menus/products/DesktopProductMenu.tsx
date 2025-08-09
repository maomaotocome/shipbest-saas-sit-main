"use client";
import { defaultLocale } from "@/i18n/locales";
import data from "@/staticData/largemenus/products.json";
import { useLocale } from "next-intl";
import Image from "next/image";
import Link from "next/link";
import { LocaleData } from "./types";

export const DesktopProductMenu = () => {
  const locale = useLocale();
  const productMenuItems = (data as LocaleData)[locale] || (data as LocaleData)[defaultLocale];

  return (
    <>
      <div className="container mx-auto p-8">
        <div className="grid grid-cols-4 gap-8">
          {productMenuItems.map((category) => (
            <div key={category.label} className="space-y-2">
              <div className="text-foreground text-lg font-semibold">{category.label}</div>
              <div className="space-y-2">
                {category.items.map((item) => (
                  <Link key={item.href} href={`/${locale}${item.href}`} className="group block">
                    {item.description ? (
                      <>
                        <div className="hover:bg-accent relative rounded-lg transition-colors">
                          <div className="relative h-16 w-full">
                            <Image
                              src={`/images/large-menus/product/bg-dark.svg`}
                              alt={item.title}
                              fill
                              className="rounded-lg object-cover opacity-0 dark:opacity-50"
                            />
                            <Image
                              src={`/images/large-menus/product/bg-light.svg`}
                              alt={item.title}
                              fill
                              className="rounded-lg object-cover opacity-100 dark:opacity-0"
                            />
                            <div className="absolute inset-0 flex flex-col justify-center p-4">
                              <div className="text-foreground group-hover:text-primary font-medium">
                                {item.title}
                              </div>
                              <p className="text-muted-foreground mt-1 text-xs">
                                {item.description}
                              </p>
                            </div>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="hover:bg-accent rounded-lg px-2 py-1 transition-colors">
                        <span className="text-foreground group-hover:text-primary">
                          {item.title}
                        </span>
                      </div>
                    )}
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
