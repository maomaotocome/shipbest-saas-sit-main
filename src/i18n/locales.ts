export const locales = [
  "en",
  "zh",
  "zh-hk",
  "fr",
  "de",
  "it",
  "pt",
  "ru",
  "ja",
  "ko",
  "es",
] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale = "en" as Locale;
