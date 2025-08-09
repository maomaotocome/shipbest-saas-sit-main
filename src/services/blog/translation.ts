import { type Locale } from "@/i18n/locales";

export async function translateToAllLocales(
  text: string,
  fromLang: Locale,
  locales: readonly Locale[]
) {
  const translations = await Promise.all(
    locales
      .filter((locale) => locale !== fromLang)
      .map(async (locale) => ({
        locale,
        text,
      }))
  );

  return translations;
}
