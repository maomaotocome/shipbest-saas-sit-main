import { Locale } from "./locales";

export const flag: Record<Locale, { flag: string; name: string }> = {
  en: { flag: "/images/icon/lang/us.svg", name: "English" },
  es: { flag: "/images/icon/lang/es.svg", name: "Español" },
  fr: { flag: "/images/icon/lang/fr.svg", name: "Français" },
  de: { flag: "/images/icon/lang/de.svg", name: "Deutsch" },
  it: { flag: "/images/icon/lang/it.svg", name: "Italiano" },
  "zh-hk": { flag: "/images/icon/lang/hk.svg", name: "繁體中文" },
  zh: { flag: "/images/icon/lang/cn.svg", name: "简体中文" },
  ja: { flag: "/images/icon/lang/ja.svg", name: "日本語" },
  ko: { flag: "/images/icon/lang/ko.svg", name: "한국어" },
  pt: { flag: "/images/icon/lang/pt.svg", name: "Português" },
  ru: { flag: "/images/icon/lang/ru.svg", name: "Русский" },
};

export const getDateFnsLocaleMap = async () => {
  const localeMap = {
    zh: (await import("date-fns/locale/zh-CN")).zhCN,
    "zh-hk": (await import("date-fns/locale/zh-HK")).zhHK,
    ja: (await import("date-fns/locale/ja")).ja,
    ko: (await import("date-fns/locale/ko")).ko,
    fr: (await import("date-fns/locale/fr")).fr,
    de: (await import("date-fns/locale/de")).de,
    it: (await import("date-fns/locale/it")).it,
    es: (await import("date-fns/locale/es")).es,
    pt: (await import("date-fns/locale/pt")).pt,
    ru: (await import("date-fns/locale/ru")).ru,
    en: (await import("date-fns/locale/en-US")).enUS,
  } as const;

  return localeMap;
};
