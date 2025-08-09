import { Locale } from "@/i18n/locales";
import { getStaticData } from "@/staticData";
import { getLocale } from "next-intl/server";
import { ShowcaseClient } from "./client";

export const Showcase = async ({ type, className }: { type: string; className?: string }) => {
  const locale = (await getLocale()) as Locale;
  const data = await getStaticData({ locale, key: "showcase", type });
  return <ShowcaseClient data={data} className={className} />;
};
