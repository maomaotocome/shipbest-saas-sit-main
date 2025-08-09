import { defaultLocale } from "@/i18n/locales";

export const getStaticData = async ({ locale, key, type }: { locale?: string; key: string; type: string }) => {
  const data = await import(`./${key}/${type}.json`);
  return locale ? data[locale] || data[defaultLocale] : data;
};
