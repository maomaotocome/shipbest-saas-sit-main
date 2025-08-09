"use client";
import { Button } from "@/components/ui/button";
import { flag } from "@/i18n/config";
import { defaultLocale, Locale, locales } from "@/i18n/locales";
import { redirect, usePathname } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useLocalStorage } from "usehooks-ts";

const STORAGE_KEY = "locale-suggest-dismissed";

export function LocaleSwitchSuggest() {
  const pathname = usePathname();
  const currentLocale = pathname?.split("/")[1] || defaultLocale;
  const t = useTranslations("locale.suggestTip");
  const [show, setShow] = useState(false);
  const [browserLocale, setBrowserLocale] = useState<string | null>(null);
  const [dismissed, setDismissed] = useLocalStorage(STORAGE_KEY, "");

  useEffect(() => {
    const browserLang = navigator.language.toLowerCase();
    console.log("browserLang", browserLang);

    // Check if suggestion was previously dismissed
    if (dismissed) return;

    // Handle special cases for compound language codes
    let normalizedLang: string;
    if (browserLang.startsWith("zh-")) {
      // Handle Chinese variants
      if (browserLang === "zh-hk" || browserLang === "zh-tw") {
        normalizedLang = "zh-hk";
      } else {
        normalizedLang = "zh";
      }
    } else {
      // For other languages, take only the primary language code
      normalizedLang = browserLang.split("-")[0];
    }

    setBrowserLocale(normalizedLang);

    // Show suggestion if browser language is different from current locale
    // and browser language is supported
    if (normalizedLang !== currentLocale && locales.includes(normalizedLang as Locale)) {
      setShow(true);
    }
  }, [currentLocale, dismissed]);

  const handleAccept = () => {
    if (
      browserLocale &&
      browserLocale !== currentLocale &&
      locales.includes(browserLocale as Locale)
    ) {
      // Use the same path redirection logic as LocaleSwitcherContent
      const redirectedPath = redirectedPathName();
      handleDismiss();
      redirect({ href: redirectedPath, locale: browserLocale as Locale });
    }
  };

  const handleDismiss = () => {
    setShow(false);
    setDismissed("true");
  };

  // Add the same path redirection function as in LocaleSwitcherContent
  const redirectedPathName = () => {
    const segments = pathname.split("/").filter(Boolean); // Remove empty strings

    // If the first segment is not a locale, it means we're on the default language path
    if (segments.length > 0 && !locales.includes(segments[0] as Locale)) {
      // Insert the new locale at the beginning
      return `/${segments.join("/")}`;
    }

    // If we already have a locale in the path, replace it
    if (segments.length > 0) {
      return `/${segments.join("/")}`;
    }

    // If we're at the root path
    return `/`;
  };

  if (!show) return null;

  // Get the language name from the flag config, handling both 2-letter and 5-letter codes
  const suggestedLanguageName =
    browserLocale &&
    (() => {
      // Try exact match first
      const exactMatch = flag[browserLocale as keyof typeof flag]?.name;
      if (exactMatch) return exactMatch;

      // If no exact match, try matching with base language code (first 2 letters)
      const baseLocale = browserLocale.substring(0, 2);
      return flag[baseLocale as keyof typeof flag]?.name;
    })();

  return (
    <div className="fixed bottom-4 left-1/2 z-50 w-full max-w-md -translate-x-1/2 transform px-4">
      <div className="bg-background relative overflow-hidden rounded-lg p-4 shadow-2xl shadow-black/10 dark:shadow-white/10">
        <div className="absolute bottom-2 left-2">
          <Image
            src={flag[browserLocale as keyof typeof flag].flag}
            alt={flag[browserLocale as keyof typeof flag]?.name || "locale"}
            width={96}
            height={96}
            className="h-24 w-24 object-cover opacity-20"
          />
        </div>
        <div className="relative z-10 flex flex-col gap-3">
          <h3 className="text-lg font-medium">{t("title")}</h3>
          <p className="text-muted-foreground">
            {t("description", { language: suggestedLanguageName ?? "" })}
          </p>
          <div className="mt-2 flex justify-end gap-2">
            <Button variant="outline" onClick={handleDismiss}>
              {t("cancel")}
            </Button>
            <Button onClick={handleAccept}>{t("accept")}</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
